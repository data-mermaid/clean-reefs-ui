import { availableYears, benthicSubLayers, defaultYear, defaultLayersToShow } from '../data/mapData'

export function getValidYear(yearFromSearchParam: string | null) {
  const parsedYear = Number(yearFromSearchParam)
  return availableYears.includes(parsedYear) ? parsedYear : defaultYear
}

export function getValidLayers(layersFromSearchParam: string | null) {
  if (!layersFromSearchParam) {
    return []
  }

  const benthicLayers = benthicSubLayers.map((layer) => layer?.layerId)
  const availableLayers = ['sed_export', 'lulc', 'sed_dispersal', ...benthicLayers]
  const layers = layersFromSearchParam.split(',').filter(Boolean)

  if (layers.length === 0) {
    return []
  }

  if (layers.some((layer) => !availableLayers.includes(layer))) {
    return defaultLayersToShow
  }

  return layers
}
