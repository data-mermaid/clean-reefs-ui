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
import { COUNTRY_EXTENTS } from '../data/countryExtents'
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
  filterProp?: string
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
  const extents = regionType === 'country' ? COUNTRY_EXTENTS : REGION_EXTENTS

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
): Promise<number[]> {
  try {
    const layer = await getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data' })
    if (!layer) {
      return []
    }
    const field = `total_sed_load_${year}`
    const values: number[] = []
    for (let i = 0; i < layer.length; i++) {
      const props = layer.feature(i).properties
      if (realmId !== undefined && props['REALM_ID'] !== realmId) {
        continue
      }
      if (countryId !== undefined && props['COUNTRY_ID'] !== countryId) {
        continue
      }
      const val = props[field]
      if (typeof val === 'number' && val > 0) {
        values.push(val)
      }
    }
    return values
  } catch {
    return []
  }
}

function collectWatershedIds(
  tileData: ArrayBuffer,
  realmId: number | undefined,
  countryId: number | undefined,
  into: Set<number>,
): void {
  const layer = new VectorTile(new Pbf(new Uint8Array(tileData))).layers['data']
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
      into.add(id)
    }
  }
}

// Returns all [z, x, y] slippy-map tiles that cover the given [west, south, east, north] extent
// at zoom level z. toX uses the standard (lon+180)/360*n formula, normalised via modulo so
// longitudes > 180 (antimeridian crossing) wrap correctly. toY uses the Web Mercator projection
// formula from the OSM wiki. When the bbox crosses the antimeridian, x1 < x0, so two x-ranges
// are produced: [x0 → n-1] and [0 → x1].
function bboxToTiles(
  extent: [number, number, number, number],
  z: number,
): [number, number, number][] {
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
  const tiles: [number, number, number][] = []
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
    const pm = getPMTiles(WATERSHED_PMTILES_URL)
    const seen = new Set<number>()

    // With an extent, fetch z=6 tiles in parallel — gives a complete feature set (~4–20 tiles per country).
    // Without an extent, fall back to the z=0 overview tile.
    const tilesToFetch = extent ? bboxToTiles(extent, 6) : [[0, 0, 0] as [number, number, number]]
    await Promise.all(
      tilesToFetch.map(([z, x, y]) =>
        pm
          .getZxy(z, x, y)
          .then((tile) => tile?.data && collectWatershedIds(tile.data, realmId, countryId, seen))
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

// Returns COUNTRY_ID → [REALM_ID] mapping using numeric IDs from the watershed PMTiles.
// Reads all 16 z=2 tiles in parallel — small island/coastal countries (e.g. New Caledonia)
// have watersheds too small to appear in the z=0 global tile but are present at z=2.
export async function fetchCountryRegionMap(): Promise<Record<number, number[]>> {
  try {
    const tileCoords: [number, number][] = []
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        tileCoords.push([x, y])
      }
    }

    const settled = await Promise.allSettled(
      tileCoords.map(async ([x, y]) => {
        const fragment: Record<number, number[]> = {}
        const layer = await getParsedLayer({
          url: WATERSHED_PMTILES_URL,
          sourceLayer: 'data',
          z: 2,
          x,
          y,
        })
        if (!layer) {
          return fragment
        }
        for (let i = 0; i < layer.length; i++) {
          const { COUNTRY_ID, REALM_ID } = layer.feature(i).properties
          if (typeof COUNTRY_ID !== 'number' || typeof REALM_ID !== 'number') {
            continue
          }
          if (!fragment[COUNTRY_ID]) {
            fragment[COUNTRY_ID] = []
          }
          if (!fragment[COUNTRY_ID].includes(REALM_ID)) {
            fragment[COUNTRY_ID].push(REALM_ID)
          }
        }
        return fragment
      }),
    )

    const map: Record<number, number[]> = {}
    for (const result of settled) {
      if (result.status !== 'fulfilled') {
        continue
      }
      for (const [countryId, realmIds] of Object.entries(result.value)) {
        const id = Number(countryId)
        if (!map[id]) {
          map[id] = []
        }
        for (const realmId of realmIds) {
          if (!map[id].includes(realmId)) {
            map[id].push(realmId)
          }
        }
      }
    }
    return map
  } catch {
    return {}
  }
}
