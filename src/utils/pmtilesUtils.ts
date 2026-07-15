import { PMTiles, FetchSource } from 'pmtiles'
import Pbf from 'pbf'
import { VectorTile, VectorTileLayer } from '@mapbox/vector-tile'
import { REGIONS_PMTILES_URL, COUNTRIES_PMTILES_URL, WATERSHED_PMTILES_URL } from '../constants'
import { RegionOption, RegionType } from '../types/RegionDataTypes'
import { COUNTRY_EXTENTS } from '../data/countryExtents'
import { REGION_EXTENTS } from '../data/regionExtents'
import { ABSOLUTE_FIELD_PREFIXES, PCT_FIELD_PREFIXES } from '../data/mapData'

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
}): Promise<VectorTileLayer | null> {
  const pm = getPMTiles(config.url)
  const tileData = await pm.getZxy(0, 0, 0)
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
// The new watershed schema no longer includes TERRITORY1/REALM text fields — only numeric IDs.
export async function fetchCountryRegionMap(): Promise<Record<number, number[]>> {
  try {
    const layer = await getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data' })
    if (!layer) {
      return {}
    }

    const map: Record<number, number[]> = {}
    for (let i = 0; i < layer.length; i++) {
      const { COUNTRY_ID, REALM_ID } = layer.feature(i).properties
      if (typeof COUNTRY_ID !== 'number' || typeof REALM_ID !== 'number') {
        continue
      }
      if (!map[COUNTRY_ID]) {
        map[COUNTRY_ID] = []
      }
      if (!map[COUNTRY_ID].includes(REALM_ID)) {
        map[COUNTRY_ID].push(REALM_ID)
      }
    }
    return map
  } catch {
    return {}
  }
}
