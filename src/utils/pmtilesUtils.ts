import { PMTiles, FetchSource } from 'pmtiles'
import Pbf from 'pbf'
import { VectorTile } from '@mapbox/vector-tile'
import { REGIONS_PMTILES_URL, COUNTRIES_PMTILES_URL } from '../constants'
import { RegionType } from '../types/RegionDataTypes'

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
  region: { url: REGIONS_PMTILES_URL, sourceLayer: 'data', filterProp: 'name' },
  country: { url: COUNTRIES_PMTILES_URL, sourceLayer: 'data', filterProp: 'TERRITORY1' },
}

/**
 * Fetches feature properties directly from a PMTiles file at z=0.
 * All region and country features exist in the single z=0 tile,
 * so this avoids any dependency on the map viewport.
 */
export async function fetchBoundaryProperties(
  regionType: RegionType,
  label: string,
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
    if (feature.properties[config.filterProp] === label) {
      return feature.properties as Record<string, unknown>
    }
  }

  return null
}
