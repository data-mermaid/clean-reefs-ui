import { PMTiles, FetchSource } from 'pmtiles'
import Pbf from 'pbf'
import { VectorTile } from '@mapbox/vector-tile'
import { REGIONS_PMTILES_URL, COUNTRIES_PMTILES_URL } from '../constants'
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

  const pm = getPMTiles(config.url)
  const tileData = await pm.getZxy(0, 0, 0)
  if (!tileData?.data) {
    return null
  }

  const pbf = new Pbf(new Uint8Array(tileData.data))
  const vt = new VectorTile(pbf)
  const layer = vt.layers[config.sourceLayer]
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
    const pm = getPMTiles(config.url)
    const tileData = await pm.getZxy(0, 0, 0)
    if (!tileData?.data) {
      return []
    }

    const pbf = new Pbf(new Uint8Array(tileData.data))
    const vt = new VectorTile(pbf)
    const layer = vt.layers[config.sourceLayer]
    if (!layer) {
      return []
    }

    const results: RegionOption[] = []
    for (let i = 0; i < layer.length; i++) {
      const feature = layer.feature(i)
      const props = feature.properties
      if (props['reef_exposed_2020'] == null) {
        continue
      }
      const label = props[labelProp] as string
      const bandId = props[idProp] as number
      const extent = extents[label]
      results.push({
        // NFD splits accented chars into base + combining mark; strip marks, remove non-alphanumeric, collapse spaces to hyphens for ASCII-safe URL slugs
        id: label
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-'),
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
