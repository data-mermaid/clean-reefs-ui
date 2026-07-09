import { PMTiles, FetchSource } from 'pmtiles'
import Pbf from 'pbf'
import { VectorTile, VectorTileLayer } from '@mapbox/vector-tile'
import { REGIONS_PMTILES_URL, COUNTRIES_PMTILES_URL, WATERSHED_PMTILES_URL } from '../constants'
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

export async function fetchAllBoundaryFeatures(
  regionType: 'country' | 'region',
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
      const id = slugify(label)
      if (seen.has(id)) {
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

// TODO: replace 'total_sed_load_2020.x' with the correct field name once the data team fixes the join artifact
const TEMP_SED_LOAD_FIELD = 'total_sed_load_2020.x'

export async function fetchWatershedSedLoadValues(
  realmId?: number,
  countryId?: number,
): Promise<number[]> {
  try {
    const layer = await getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data' })
    if (!layer) {
      return []
    }
    const values: number[] = []
    for (let i = 0; i < layer.length; i++) {
      const props = layer.feature(i).properties
      if (realmId !== undefined && props['REALM_ID'] !== realmId) {
        continue
      }
      if (countryId !== undefined && props['COUNTRY_ID'] !== countryId) {
        continue
      }
      const val = props[TEMP_SED_LOAD_FIELD]
      if (typeof val === 'number' && val > 0) {
        values.push(val)
      }
    }
    return values
  } catch {
    return []
  }
}

export async function fetchCountryRegionMap(): Promise<Record<string, string[]>> {
  try {
    const layer = await getParsedLayer({ url: WATERSHED_PMTILES_URL, sourceLayer: 'data' })
    if (!layer) {
      return {}
    }

    const map: Record<string, string[]> = {}
    for (let i = 0; i < layer.length; i++) {
      const { TERRITORY1, REALM } = layer.feature(i).properties
      if (typeof TERRITORY1 !== 'string' || typeof REALM !== 'string') {
        continue
      }
      const countryId = slugify(TERRITORY1)
      const realmId = slugify(REALM)
      if (!map[countryId]) {
        map[countryId] = []
      }
      if (!map[countryId].includes(realmId)) {
        map[countryId].push(realmId)
      }
    }
    return map
  } catch {
    return {}
  }
}
