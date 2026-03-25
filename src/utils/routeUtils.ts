import {
  availableYears,
  defaultLayersToShow,
  defaultYear,
  urlControlledLayerIds,
} from '../data/mapData'
import { defaultGlobalRegionOption, regionOptions } from '../data/regionData'
import { RegionOption } from '../types/RegionDataTypes'

export function getValidRegion(regionFromSearchParam: string | null): RegionOption {
  if (!regionFromSearchParam) {
    return defaultGlobalRegionOption
  }
  const found = regionOptions.find((option) => option.id === regionFromSearchParam)

  return found ?? defaultGlobalRegionOption
}

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
