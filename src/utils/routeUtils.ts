import { availableYears, benthicSubLayers, defaultYear, defaultLayersToShow } from '../data/mapData'

export function getValidYear(yearFromSearchParam: string | null) {
  const parsedYear = Number(yearFromSearchParam)
  return availableYears.includes(parsedYear) ? parsedYear : defaultYear
}

export function getValidLayers(layersFromSearchParam: string | null) {
  const benthicLayers = benthicSubLayers.map((layer) => layer?.layerId)
  const availableLayers = ['sed_export', 'lulc', 'sed_dispersal', ...benthicLayers]
  const sedExportAndLandUseLayers = ['sed_export', 'lulc']

  if (!layersFromSearchParam) {
    return defaultLayersToShow
  }

  const validLayers = layersFromSearchParam
    .split(',')
    .filter((layer) => availableLayers.includes(layer))
  const inValidLayers = layersFromSearchParam
    .split(',')
    .filter((layer) => !availableLayers.includes(layer))

  if (inValidLayers.length > 0) {
    return defaultLayersToShow
  }

  const selectedRasterLayers = validLayers.filter((layer) =>
    sedExportAndLandUseLayers.includes(layer),
  )
  if (selectedRasterLayers.length <= 1) {
    return validLayers
  }

  const chosenRasterLayer = selectedRasterLayers[selectedRasterLayers.length - 1]
  return validLayers.filter(
    (layer) => !sedExportAndLandUseLayers.includes(layer) || layer === chosenRasterLayer,
  )
}
