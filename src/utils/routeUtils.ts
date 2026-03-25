import {
  availableYears,
  defaultYear,
  defaultLayersToShow,
  urlControlledLayerIds,
} from '../data/mapData'

export function getValidYear(yearFromSearchParam: string | null) {
  const parsedYear = Number(yearFromSearchParam)
  return availableYears.includes(parsedYear) ? parsedYear : defaultYear
}

export function getValidLayers(layersFromSearchParam: string | null) {
  if (!layersFromSearchParam) {
    return defaultLayersToShow
  }

  if (layersFromSearchParam === 'none') {
    return []
  }

  const layers = layersFromSearchParam.split(',').filter(Boolean)

  if (layers.length === 0 || layers.some((layer) => !urlControlledLayerIds.includes(layer))) {
    return defaultLayersToShow
  }

  return layers
}
