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

/**
 * Basic format check only — returns trimmed string or null.
 * Full validation (does this ID exist?) happens after the map loads
 * by querying the vector tile source.
 */
export function getValidWatershed(watershedFromSearchParam: string | null): string | null {
  if (!watershedFromSearchParam || watershedFromSearchParam.trim() === '') {
    return null
  }
  return watershedFromSearchParam.trim()
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

export function getValidZoom(zoomFromSearchParam: string | null): number | null {
  if (!zoomFromSearchParam) {
    return null
  }
  const zoom = parseFloat(zoomFromSearchParam)
  if (isNaN(zoom) || zoom < 0 || zoom > 24) {
    return null
  }
  return zoom
}

export function getValidLatLng(
  latFromSearchParam: string | null,
  lngFromSearchParam: string | null,
): { lat: number | null; lng: number | null } {
  const lat = latFromSearchParam ? parseFloat(latFromSearchParam) : null
  const lng = lngFromSearchParam ? parseFloat(lngFromSearchParam) : null

  const isLatValid = lat !== null && !isNaN(lat) && lat >= -90 && lat <= 90
  const isLngValid = lng !== null && !isNaN(lng) && lng >= -180 && lng <= 180

  if (!isLatValid || !isLngValid) {
    return { lat: null, lng: null }
  }

  return { lat, lng }
}
