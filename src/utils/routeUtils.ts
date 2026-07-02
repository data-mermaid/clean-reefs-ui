import {
  FALLBACK_AVAILABLE_YEARS,
  FALLBACK_LATEST_YEAR,
  defaultLayersToShow,
  urlControlledLayerIds,
} from '../data/mapData'
import { defaultGlobalRegionOption, fallbackRegionOptions } from '../data/regionData'
import { RegionOption } from '../types/RegionDataTypes'
import { VALID_BASEMAPS, Basemap } from './mapUtils'

export function getValidRegion(
  regionFromSearchParam: string | null,
  regionOptions: RegionOption[] = fallbackRegionOptions,
): RegionOption {
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

export function getValidYear(
  yearFromSearchParam: string | null,
  years: number[] = FALLBACK_AVAILABLE_YEARS,
  fallback: number = FALLBACK_LATEST_YEAR,
): number {
  const parsedYear = Number(yearFromSearchParam)
  return years.includes(parsedYear) ? parsedYear : fallback
}

export function getValidLayers(layersFromSearchParam: string | null) {
  if (!layersFromSearchParam) {
    return defaultLayersToShow
  }

  if (layersFromSearchParam === 'none') {
    return []
  }

  const layers = layersFromSearchParam
    .split(',')
    .filter((l) => l && urlControlledLayerIds.includes(l))

  return layers.length > 0 ? layers : defaultLayersToShow
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

export function getValidDispersalPoint(
  dispersalPointSearchParam: string | null,
): { lat: number; lng: number } | null {
  if (!dispersalPointSearchParam) {
    return null
  }

  const parts = dispersalPointSearchParam.split(',')
  if (parts.length !== 2) {
    return null
  }

  const { lat, lng } = getValidLatLng(parts[0], parts[1])
  return lat !== null && lng !== null ? { lat, lng } : null
}

export function getValidLabels(labelsFromSearchParam: string | null): boolean {
  return labelsFromSearchParam !== 'false'
}

export function getValidCoastlines(param: string | null): boolean {
  return param !== 'false'
}

export function getValidRivers(param: string | null): boolean {
  return param !== 'false'
}

export function getValidBasemap(basemapFromSearchParam: string | null): Basemap {
  if (basemapFromSearchParam && VALID_BASEMAPS.includes(basemapFromSearchParam as never)) {
    return basemapFromSearchParam as Basemap
  }

  return 'satellite'
}
