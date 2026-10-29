import { PMTiles, FetchSource } from 'pmtiles'
import Pbf from 'pbf'
import { VectorTile, VectorTileLayer } from '@mapbox/vector-tile'
import {
  REGIONS_PMTILES_URL,
  COUNTRIES_PMTILES_URL,
  WATERSHED_PMTILES_URL,
  ABSOLUTE_FIELD_PREFIXES,
  PCT_FIELD_PREFIXES,
} from '../constants'
import { RegionOption, RegionType } from '../types/RegionDataTypes'
import { COUNTRY_EXTENTS_BY_TERRITORY } from '../data/countryExtentOverrides'
import { REGION_EXTENTS } from '../data/regionExtents'

const pmtilesCache = new Map<string, PMTiles>()

function getPMTiles(url: string): PMTiles {
  let instance = pmtilesCache.get(url)
  if (!instance) {
    instance = new PMTiles(new FetchSource(url))
    pmtilesCache.set(url, instance)
  }
  return instance
}

type Tile = [z: number, x: number, y: number]

// Small-island watersheds are dropped from overview tiles and only exist from the detail zoom up.
const WATERSHED_OVERVIEW_ZOOM = 2
const WATERSHED_DETAIL_ZOOM = 6

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

async function getParsedLayer(config: {
  url: string
  sourceLayer: string
  z?: number
  x?: number
  y?: number
}): Promise<VectorTileLayer | null> {
  const pm = getPMTiles(config.url)
  const tileData = await pm.getZxy(config.z ?? 0, config.x ?? 0, config.y ?? 0)
  if (!tileData?.data) {
    return null
  }
  const pbf = new Pbf(new Uint8Array(tileData.data))
  const vt = new VectorTile(pbf)
  return vt.layers[config.sourceLayer] ?? null
}

export const boundarySourceConfig: Partial<
  Record<RegionType, { url: string; sourceLayer: string; filterProp: string }>
> = {
  region: { url: REGIONS_PMTILES_URL, sourceLayer: 'data', filterProp: 'REALM_ID' },
  country: { url: COUNTRIES_PMTILES_URL, sourceLayer: 'data', filterProp: 'COUNTRY_ID' },
}

/**
 * Fetches feature properties directly from a PMTiles file at z=0.
 * All region and country features exist in the single z=0 tile,
 * so this avoids any dependency on the map viewport.
 */
export async function fetchBoundaryProperties(
  regionType: RegionType,
  id: number,
): Promise<Record<string, unknown> | null> {
  const config = boundarySourceConfig[regionType]
  if (!config) {
    return null
  }

  const layer = await getParsedLayer(config)
  if (!layer) {
    return null
  }

  for (let i = 0; i < layer.length; i++) {
    const feature = layer.feature(i)
    if (feature.properties[config.filterProp] === id) {
      return feature.properties as Record<string, unknown>
    }
  }

  return null
}

// When dedup=true (default), one entry per slug is returned (first wins).
// Pass dedup=false to return all entries including duplicates — used by
// useRegionOptions to do watershed-aware deduplication downstream.
export async function fetchAllBoundaryFeatures(
  regionType: 'country' | 'region',
  dedup = true,
): Promise<RegionOption[]> {
  const config = boundarySourceConfig[regionType]
  if (!config) {
    return []
  }

  const labelProp = regionType === 'country' ? 'TERRITORY1' : 'REALM'
  const idProp = config.filterProp
  const extents = regionType === 'country' ? COUNTRY_EXTENTS_BY_TERRITORY : REGION_EXTENTS

  try {
    const layer = await getParsedLayer(config)
    if (!layer) {
      return []
    }

    const seen = new Set<string>()
    const results: RegionOption[] = []
    for (let i = 0; i < layer.length; i++) {
      const feature = layer.feature(i)
      const props = feature.properties
      const label = props[labelProp]
      if (typeof label !== 'string' || label.length === 0) {
        continue
      }
      if (regionType === 'country' && typeof props['total_sed_load_2020'] !== 'number') {
        continue
      }
      const id = slugify(label)
      if (dedup && seen.has(id)) {
        continue
      }
      seen.add(id)
      const bandId = props[idProp] as number
      const extent = extents[label]
      results.push({
        id,
        regionType,
        label,
        bandId,
        ...(extent ? { extent } : {}),
      })
    }
    return results
  } catch {
    return []
  }
}

export async function fetchWatershedSedLoadValues(
  year: number,
  realmId?: number,
  countryId?: number,
  extent?: [number, number, number, number],
): Promise<number[]> {
  try {
    const field = `total_sed_load_${year}`
    const seen = new Set<number>()
    const values: number[] = []
    // With an extent, fetch detail-zoom tiles so small island countries are covered.
    // Without an extent (global scope), fall back to z=0.
    const tilesToFetch = extent
      ? bboxToTiles(extent, WATERSHED_DETAIL_ZOOM)
      : ([[0, 0, 0]] as Tile[])
    await Promise.all(
      tilesToFetch.map(([z, x, y]) =>
        getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data', z, x, y })
          .then((layer) => {
            if (!layer) {
              return
            }
            for (let i = 0; i < layer.length; i++) {
              const props = layer.feature(i).properties
              if (realmId !== undefined && props['REALM_ID'] !== realmId) {
                continue
              }
              if (countryId !== undefined && props['COUNTRY_ID'] !== countryId) {
                continue
              }
              const id = props['watershed_id']
              if (typeof id === 'number') {
                if (seen.has(id)) {
                  continue
                }
                seen.add(id)
              }
              const val = props[field]
              if (typeof val === 'number' && val > 0) {
                values.push(val)
              }
            }
          })
          .catch(() => {}),
      ),
    )
    return values
  } catch {
    return []
  }
}

// Returns all [z, x, y] slippy-map tiles that cover the given [west, south, east, north] extent
// at zoom level z. toX uses the standard (lon+180)/360*n formula, normalised via modulo so
// longitudes > 180 (antimeridian crossing) wrap correctly. toY uses the Web Mercator projection
// formula from the OSM wiki. When the bbox crosses the antimeridian, x1 < x0, so two x-ranges
// are produced: [x0 → n-1] and [0 → x1].
function bboxToTiles(extent: [number, number, number, number], z: number): Tile[] {
  const n = Math.pow(2, z)
  const toX = (lon: number) =>
    Math.min(n - 1, Math.floor((((((lon + 180) % 360) + 360) % 360) / 360) * n))
  const toY = (lat: number) => {
    const r = (lat * Math.PI) / 180
    return Math.min(
      n - 1,
      Math.max(0, Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n)),
    )
  }
  const [west, south, east, north] = extent
  const x0 = toX(west),
    x1 = toX(east)
  const y0 = toY(north),
    y1 = toY(south)
  // x1 < x0 means the bbox crosses the antimeridian
  const xRanges: [number, number][] =
    x1 < x0
      ? [
          [x0, n - 1],
          [0, x1],
        ]
      : [[x0, x1]]
  const tiles: Tile[] = []
  for (const [xa, xb] of xRanges) {
    for (let x = xa; x <= xb; x++) {
      for (let y = y0; y <= y1; y++) {
        tiles.push([z, x, y])
      }
    }
  }
  return tiles
}

export async function fetchWatershedIdsForRegion(
  realmId?: number,
  countryId?: number,
  extent?: [number, number, number, number],
): Promise<number[]> {
  try {
    const seen = new Set<number>()

    // With an extent, fetch detail-zoom tiles in parallel — gives a complete feature set (~4–20 tiles per country).
    // Without an extent, fall back to the z=0 overview tile.
    const tilesToFetch = extent ? bboxToTiles(extent, WATERSHED_DETAIL_ZOOM) : [[0, 0, 0] as Tile]
    await Promise.all(
      tilesToFetch.map(([z, x, y]) =>
        getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data', z, x, y })
          .then((layer) => {
            if (!layer) {
              return
            }
            for (let i = 0; i < layer.length; i++) {
              const props = layer.feature(i).properties
              if (realmId !== undefined && props['REALM_ID'] !== realmId) {
                continue
              }
              if (countryId !== undefined && props['COUNTRY_ID'] !== countryId) {
                continue
              }
              const id = props['watershed_id']
              if (typeof id === 'number') {
                seen.add(id)
              }
            }
          })
          .catch(() => {}),
      ),
    )

    return [...seen]
  } catch {
    return []
  }
}

/**
 * Aggregates all country features from the countries PMTiles into a single flat
 * properties object in the same key format as individual country features.
 * Used to generate global chart data without hardcoded placeholder values.
 *
 * Absolute fields (sed load, ecosystem extent) are summed.
 * Land-use percentage fields are area-weighted using each country's total_area_ha.
 */
export async function fetchGlobalBoundaryProperties(): Promise<Record<string, unknown> | null> {
  const config = boundarySourceConfig['country']
  if (!config) {
    return null
  }

  try {
    const layer = await getParsedLayer(config)
    if (!layer) {
      return null
    }

    const sums: Record<string, number> = {}
    const weightedPctNumerators: Record<string, number> = {}
    const weightedPctDenominators: Record<string, number> = {}

    for (let i = 0; i < layer.length; i++) {
      const props = layer.feature(i).properties
      const areaHa = typeof props['total_area_ha'] === 'number' ? props['total_area_ha'] : 0

      for (const key of Object.keys(props)) {
        const val = props[key]
        if (typeof val !== 'number') {
          continue
        }

        if (ABSOLUTE_FIELD_PREFIXES.some((p) => key.startsWith(p))) {
          sums[key] = (sums[key] ?? 0) + val
        } else if (PCT_FIELD_PREFIXES.some((p) => key.startsWith(p))) {
          weightedPctNumerators[key] = (weightedPctNumerators[key] ?? 0) + val * areaHa
          weightedPctDenominators[key] = (weightedPctDenominators[key] ?? 0) + areaHa
        }
      }
    }

    const result: Record<string, unknown> = { ...sums }
    for (const key of Object.keys(weightedPctNumerators)) {
      const denom = weightedPctDenominators[key]
      result[key] = denom > 0 ? weightedPctNumerators[key] / denom : 0
    }

    return result
  } catch {
    return null
  }
}

// Collects COUNTRY_ID → REALM_ID pairs from the given tiles, optionally restricted to
// `onlyCountryIds`. Tiles are fetched in parallel; one that fails to fetch or decode is skipped.
async function collectCountryRealmsFromTiles(
  tiles: Tile[],
  map: Record<number, number[]>,
  onlyCountryIds?: Set<number>,
): Promise<void> {
  await Promise.all(
    tiles.map(([z, x, y]) =>
      getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data', z, x, y })
        .then((layer) => {
          if (!layer) {
            return
          }
          for (let i = 0; i < layer.length; i++) {
            const { COUNTRY_ID, REALM_ID } = layer.feature(i).properties
            if (typeof COUNTRY_ID !== 'number' || typeof REALM_ID !== 'number') {
              continue
            }
            if (onlyCountryIds && !onlyCountryIds.has(COUNTRY_ID)) {
              continue
            }
            const realmIds = (map[COUNTRY_ID] ??= [])
            if (!realmIds.includes(REALM_ID)) {
              realmIds.push(REALM_ID)
            }
          }
        })
        .catch(() => {}),
    ),
  )
}

function uniqueTiles(tiles: Tile[]): Tile[] {
  return [...new Map(tiles.map((tile) => [tile.join('/'), tile])).values()]
}

/**
 * Returns COUNTRY_ID → [REALM_ID] from the watershed PMTiles.
 * Pass 1 scans the overview tiles. Pass 2 probes detail tiles over the extent of each country
 * still unmapped, attributing realms only to those countries.
 */
export async function fetchCountryRegionMap(
  countries: RegionOption[],
): Promise<Record<number, number[]>> {
  const map: Record<number, number[]> = {}

  const n = 2 ** WATERSHED_OVERVIEW_ZOOM
  const overviewTiles: Tile[] = []
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      overviewTiles.push([WATERSHED_OVERVIEW_ZOOM, x, y])
    }
  }
  await collectCountryRealmsFromTiles(overviewTiles, map)
  // An empty overview means the archive is unreachable, not that every country is a small island.
  if (Object.keys(map).length === 0) {
    return map
  }

  const unmapped = countries.filter((c) => c.bandId !== undefined && map[c.bandId] === undefined)
  const unmappedIds = new Set(unmapped.map((c) => c.bandId as number))
  const detailTiles = uniqueTiles(
    unmapped.flatMap((c) => (c.extent ? bboxToTiles(c.extent, WATERSHED_DETAIL_ZOOM) : [])),
  )
  await collectCountryRealmsFromTiles(detailTiles, map, unmappedIds)

  return map
}
