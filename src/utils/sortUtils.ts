import { LayerInfo } from '../types/MapDataTypes'

const boundaryLayerRank: Record<string, number> = {
  watershed: 0,
  sed_exposure_boundary: 1,
  regions: 2,
  countries: 3,
}

export const sortBoundaryLayers = (a: LayerInfo, b: LayerInfo): number => {
  const aRank = boundaryLayerRank[a.layerId] ?? Number.POSITIVE_INFINITY
  const bRank = boundaryLayerRank[b.layerId] ?? Number.POSITIVE_INFINITY

  return aRank - bRank
}
