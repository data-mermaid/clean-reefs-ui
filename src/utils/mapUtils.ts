import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { Feature, Polygon, MultiPolygon } from 'geojson'
import { RegionOption } from '../types/RegionDataTypes'
import {
  FilterSpecification,
  LngLatBounds,
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapSourceDataEvent,
} from 'maplibre-gl'
import { RefObject } from 'react'
import { BaseMapStyleUrl, LayerInfo, SubLayerInfo } from '../types/MapDataTypes'
import { transparent } from '../data/mapData'
import { defaultGlobalRegionOption } from '../data/regionData'
import {
  BASE_ZONAL_STATS_API,
  SEDIMENT_EXPOSURE_2000_URL,
  SEDIMENT_EXPOSURE_2005_URL,
  SEDIMENT_EXPOSURE_2010_URL,
  SEDIMENT_EXPOSURE_2015_URL,
  SEDIMENT_EXPOSURE_2020_URL,
  SATELLITE_STYLE,
  LIGHT_STYLE,
  DARK_STYLE,
  topContributingWatershedColorFills,
} from '../constants'

export function getActiveLayers(mapLayers: LayerInfo[]): string[] {
  return mapLayers.filter((layer) => layer.isLayerOn).map((layer) => layer.layerId)
}


export function calculateFeatureBounds(feature: MapGeoJSONFeature): LngLatBounds {
  const geometry = feature.geometry
  const bounds = new LngLatBounds()

  if (geometry.type === 'Polygon') {
    geometry.coordinates[0].forEach(([lng, lat]) => {
      bounds.extend([lng, lat])
    })
  }

  return bounds
}

export type PolygonFeatureStateKey = 'hover' | 'select' | 'linkedHover' | 'linkedSelect'

export function setPolygonFeatureState(
  map: Map,
  ref: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
  featureId: string | number,
  stateKey: PolygonFeatureStateKey,
) {
  ref.current = featureId
  map.setFeatureState(
    {
      source: mapDataLayer.sourceId,
      sourceLayer: mapDataLayer.sourceFileName,
      id: featureId,
    },
    { [stateKey]: true },
  )
}

export function clearPolygonFeatureState(
  map: Map,
  ref: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
  stateKey: PolygonFeatureStateKey,
) {
  if (ref.current) {
    map.setFeatureState(
      {
        source: mapDataLayer.sourceId,
        sourceLayer: mapDataLayer.sourceFileName,
        id: ref.current,
      },
      { [stateKey]: false },
    )
    ref.current = null
  }
}

export function clearPolygonHover(
  map: Map,
  hoveredRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
) {
  clearPolygonFeatureState(map, hoveredRef, mapDataLayer, 'hover')
}

export function clearPolygonSelect(
  map: Map,
  clickRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
) {
  clearPolygonFeatureState(map, clickRef, mapDataLayer, 'select')
}

export function setPolygonSelect(
  map: Map,
  clickRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
  featureId: string | number,
) {
  setPolygonFeatureState(map, clickRef, mapDataLayer, featureId, 'select')
}

export function createPolygonHoverHandler(hoveredRef: RefObject<string | number | null>) {
  return (map: Map, e: MapLayerMouseEvent, mapDataLayer: LayerInfo) => {
    if (!e.features || e.features.length === 0 || !e.features[0].id) {
      return
    }

    const featureId = e.features[0].id

    // If the polygon is already selected, do not apply hover state
    const selectedRef = map.getFeatureState({
      source: mapDataLayer.sourceId,
      sourceLayer: mapDataLayer.sourceFileName,
      id: featureId,
    })

    if (featureId === hoveredRef.current || selectedRef?.select) {
      return
    }

    clearPolygonHover(map, hoveredRef, mapDataLayer)

    // set hover on new feature
    hoveredRef.current = featureId
    map.setFeatureState(
      {
        source: mapDataLayer.sourceId,
        sourceLayer: mapDataLayer.sourceFileName,
        id: hoveredRef.current,
      },
      { hover: true },
    )
  }
}

export function createPolygonClickHandler(
  polygonClickedRef: RefObject<string | number | null>,
  onSelect?: (feature: MapGeoJSONFeature | null, bounds?: LngLatBounds) => void,
) {
  return (map: Map, e: MapLayerMouseEvent, mapDataLayer: LayerInfo) => {
    if (!e.features || e.features.length === 0) {
      return
    }

    const feature = e.features[0]
    const featureId = feature.id

    if (!featureId) {
      return
    }

    // Clicking an already-selected watershed recenters the map on it
    if (polygonClickedRef.current === featureId) {
      if (onSelect) {
        const bounds = calculateFeatureBounds(feature)
        onSelect(feature, bounds)
      }
      return
    }

    // Deselect the previously selected watershed (user clicked a different one)
    if (polygonClickedRef.current) {
      map.setFeatureState(
        {
          source: mapDataLayer.sourceId,
          sourceLayer: mapDataLayer.sourceFileName,
          id: polygonClickedRef.current,
        },
        { select: false },
      )
    }

    polygonClickedRef.current = featureId
    map.setFeatureState(
      {
        source: mapDataLayer.sourceId,
        sourceLayer: mapDataLayer.sourceFileName,
        id: polygonClickedRef.current,
      },
      { select: true, hover: false },
    )

    if (onSelect) {
      const bounds = calculateFeatureBounds(feature)
      onSelect(feature, bounds)
    }
  }
}

export const mapToggleChange = (
  layers: LayerInfo[] | SubLayerInfo[],
  layerId: string,
  checked: boolean,
  year: number,
) => {
  return layers.map((layer) => {
    const layerMatch = layer.layerId === layerId
    const yearMatch = layer.year === undefined || layer.year === year
    return layerMatch && yearMatch ? { ...layer, isLayerOn: checked } : layer
  })
}

/**
 * Queries a vector tile source for a feature, retrying as tiles load.
 * Calls onResult with the feature once found, or null on timeout.
 * Returns a cancel function (suitable as useEffect cleanup).
 * Reusable for any vector source that needs async feature lookup (watershed, dispersal, etc.).
 */
export function querySourceFeatureWhenReady(
  map: Map,
  sourceId: string,
  sourceLayer: string,
  filter: FilterSpecification,
  onResult: (feature: MapGeoJSONFeature | null) => void,
  timeoutMs = 10_000,
): () => void {
  let settled = false

  const tryQuery = (): MapGeoJSONFeature | null => {
    const features = map.querySourceFeatures(sourceId, { sourceLayer, filter })
    return features.length > 0 ? (features[0] as MapGeoJSONFeature) : null
  }

  const settle = (result: MapGeoJSONFeature | null) => {
    if (settled) {
      return
    }
    settled = true
    map.off('sourcedata', onSourceData)
    clearTimeout(timeoutId)
    onResult(result)
  }

  // Try immediately
  const immediate = tryQuery()
  if (immediate) {
    settled = true
    onResult(immediate)
    return () => {}
  }

  // Retry on each sourcedata event as tiles stream in
  const onSourceData = (e: { sourceId?: string }) => {
    if (settled || e.sourceId !== sourceId) {
      return
    }
    const feature = tryQuery()
    if (feature) {
      settle(feature)
    }
  }
  map.on('sourcedata', onSourceData)

  const timeoutId = setTimeout(() => settle(null), timeoutMs)

  return () => settle(null)
}

/**
 * Queries a vector tile source for a polygon feature spatially containing `point`,
 * retrying as tiles stream in. Viewport-independent (uses querySourceFeatures).
 * Calls onResult with the first matching feature, or null if the timeout expires.
 * Returns a cancel function suitable as useEffect cleanup.
 */
export function querySourceFeatureAtPointWhenReady(
  map: Map,
  sourceId: string,
  sourceLayer: string,
  point: { lng: number; lat: number },
  onResult: (feature: MapGeoJSONFeature | null) => void,
  timeoutMs = 10_000,
): () => void {
  const findContainingFeature = (): MapGeoJSONFeature | null => {
    const features = map.querySourceFeatures(sourceId, { sourceLayer })
    const match = features.find(
      (f) =>
        (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') &&
        booleanPointInPolygon([point.lng, point.lat], f as Feature<Polygon | MultiPolygon>),
    )
    return (match as MapGeoJSONFeature | undefined) ?? null
  }

  // Resolve immediately: either a match was found, or all tiles are loaded with no match.
  const initial = findContainingFeature()
  if (initial || map.isSourceLoaded(sourceId)) {
    onResult(initial)
    return () => {}
  }

  // Source is still streaming — retry on each new tile batch.
  let settled = false

  const settle = (result: MapGeoJSONFeature | null) => {
    if (settled) {
      return
    }
    settled = true
    map.off('sourcedata', onSourceData)
    map.off('sourcedataabort', onSourceDataAbort)
    clearTimeout(timeoutId)
    onResult(result)
  }

  const onSourceData = (e: MapSourceDataEvent) => {
    if (settled || e.sourceId !== sourceId) {
      return
    }
    const feature = findContainingFeature()
    // Settle as soon as a match is found, or all tiles are loaded with no match.
    if (feature || e.isSourceLoaded) {
      settle(feature)
    }
  }

  // Fired when tile requests for this source are aborted (e.g. network drop, source removed).
  const onSourceDataAbort = (e: MapSourceDataEvent) => {
    if (e.sourceId === sourceId) {
      settle(null)
    }
  }

  map.on('sourcedata', onSourceData)
  map.on('sourcedataabort', onSourceDataAbort)

  const timeoutId = setTimeout(() => settle(null), timeoutMs)

  return () => settle(null)
}

/**
 * Builds a MapLibre `case` expression that maps benthic class_name values to fill colours.
 */
export function buildBenthicFillExpression(colors: Record<string, string>): unknown[] {
  return [
    'case',
    ['==', ['get', 'class_name'], 'Coral/Algae'],
    colors['coral_algae'],
    ['==', ['get', 'class_name'], 'Benthic Microalgae'],
    colors['microalgal_mats'],
    ['==', ['get', 'class_name'], 'Rock'],
    colors['rock'],
    ['==', ['get', 'class_name'], 'Rubble'],
    colors['rubble'],
    ['==', ['get', 'class_name'], 'Sand'],
    colors['sand'],
    ['==', ['get', 'class_name'], 'Seagrass'],
    colors['seagrass'],
    transparent,
  ]
}

/**
 * Builds a MapLibre `match` expression that assigns a colour to each watershed ID.
 * Falls back to `fallback` for any ID not in the list, or when `ids` is empty.
 */
export function buildWatershedMatchExpression(
  ids: number[],
  fallback: string | readonly unknown[],
): unknown {
  if (ids.length === 0) {
    return fallback
  }
  const pairs = ids.flatMap((id, i) => [id, topContributingWatershedColorFills[i]])
  return ['match', ['get', 'watershed_id'], ...pairs, fallback]
}


export function mapRegionSelected(
  feature: MapGeoJSONFeature,
  regionOptions: RegionOption[],
): RegionOption {
  const countryId = feature.properties.COUNTRY_ID
  if (countryId == null) {
    return regionOptions[0]
  }
  const matchingRegion = regionOptions.find((region) => region.bandId === countryId)
  if (matchingRegion && feature.layer.id === 'watershed') {
    return { ...matchingRegion, regionType: 'watershed' }
  }
  return matchingRegion || regionOptions[0]
}

export async function postZonalStats(payload) {
  try {
    const response = await fetch(BASE_ZONAL_STATS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    throw new Error('Zonal stats request failed', { cause: err })
  }
}

export async function prepareZonalStatsCall(lngLat, year) {
  const { lat, lng } = lngLat
  const exposureUrls: Record<number, string> = {
    2000: SEDIMENT_EXPOSURE_2000_URL,
    2005: SEDIMENT_EXPOSURE_2005_URL,
    2010: SEDIMENT_EXPOSURE_2010_URL,
    2015: SEDIMENT_EXPOSURE_2015_URL,
    2020: SEDIMENT_EXPOSURE_2020_URL,
  }

  const resolvedUrl = exposureUrls[year]
  if (!resolvedUrl) {
    throw new Error(`No sediment exposure URL available for year: ${year}`)
  }

  const basePayload = {
    aoi: { type: 'Point', coordinates: [lng, lat] },
    url: resolvedUrl,
    bands: [1, 2, 3, 4, 5, 6, 7],
    stats: ['majority'],
  }
  return await postZonalStats(basePayload)
}

export async function getAllYearZonalStats(lngLat) {
  const years = [2000, 2005, 2010, 2015, 2020]

  const zonalStatsPromises = years.map(async (year) => {
    try {
      const stats = await prepareZonalStatsCall(lngLat, year)
      return { [year]: stats }
    } catch {
      return { [year]: {} }
    }
  })

  const results = await Promise.all(zonalStatsPromises)
  return Object.assign({}, ...results)
}

type LayerWithIdAndType = {
  id: string
  type?: string
}

export const basemapOptions = {
  satellite: SATELLITE_STYLE,
  light: LIGHT_STYLE,
  dark: DARK_STYLE,
}

export type Basemap = keyof typeof basemapOptions
export const VALID_BASEMAPS = Object.keys(basemapOptions) as Array<Basemap>

// Find the first symbol (label) layer that sits above the last opaque/blocking layer.
// Some basemaps insert symbol layers early in the stack and continue adding fills/hillshade
// afterwards; anchoring overlays to the *first* symbol would bury them under those later fills.
export const resolveBasemapBeforeId = (layers: LayerWithIdAndType[]): string | undefined => {
  const BLOCKING_TYPES = new Set(['fill', 'fill-extrusion', 'hillshade', 'raster'])

  let lastBlockingIndex = -1
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type && BLOCKING_TYPES.has(layers[i].type as string)) {
      lastBlockingIndex = i
    }
  }

  for (let i = lastBlockingIndex + 1; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      return layers[i].id
    }
  }

  // Fallback: first symbol anywhere in the stack
  const firstSymbol = layers.find((layer) => layer.type === 'symbol')
  if (firstSymbol) {
    return firstSymbol.id
  }

  // Last resort: first non-background layer
  return layers.find((layer) => layer.type !== 'background')?.id
}

export function getBasemapStyleUrl(selectedBasemap: Basemap, apiKey: string): BaseMapStyleUrl {
  const styleBase = basemapOptions[selectedBasemap] ?? SATELLITE_STYLE

  return `${styleBase}?key=${apiKey}` as BaseMapStyleUrl
}

export function buildBreadcrumbFromRegion(
  region: RegionOption,
  regionOptions: RegionOption[],
  parentRegion?: RegionOption,
): RegionOption[] {
  if (region.regionType === 'global') {
    return [region]
  }
  if (region.regionType === 'country') {
    const parent =
      parentRegion ??
      regionOptions.find((r) => r.regionType === 'region' && r.id === region.parentRegionIds?.[0])
    return [defaultGlobalRegionOption, ...(parent ? [parent] : []), region]
  }
  return [defaultGlobalRegionOption, region]
}

export function buildBreadcrumbFromFeature(
  featureProperties: Record<string, unknown> | null | undefined,
  subRegion: RegionOption,
  regionOptions: RegionOption[],
  selectedRegion?: RegionOption,
): { breadcrumb: RegionOption[]; addtlRegion: RegionOption | undefined } {
  const countryId = featureProperties?.COUNTRY_ID as number | undefined
  const realmId = featureProperties?.REALM_ID as number | undefined
  const country = countryId !== undefined ? regionOptions.find((r) => r.bandId === countryId) : undefined

  const parentRegionIds = country?.parentRegionIds ?? []

  // The active region context from selectedRegion:
  // - region scope → use it directly
  // - country scope → parentRegionIds[0] carries the WIP/CIP choice from the dropdown
  const currentRegionId =
    selectedRegion?.regionType === 'region' ? selectedRegion.id : selectedRegion?.parentRegionIds?.[0]

  // Resolve the region for the breadcrumb in priority order:
  // 1. Current scope region, if it's a valid parent of this country
  // 2. Country's first known parent region
  // 3. Feature's own REALM_ID as last resort
  let region: RegionOption | undefined
  if (currentRegionId && parentRegionIds.includes(currentRegionId)) {
    region = regionOptions.find((r) => r.regionType === 'region' && r.id === currentRegionId)
  }
  region ??= regionOptions.find((r) => r.regionType === 'region' && r.id === parentRegionIds[0])
  if (!region && realmId !== undefined) {
    region = regionOptions.find((r) => r.regionType === 'region' && r.bandId === realmId)
  }

  // Resolve addtlRegion — synced to URL via onRegionChange to keep scope context:
  // - country scope: return current selectedRegion as-is (preserves WIP/CIP from dropdown)
  // - region scope with context mismatch: return country with currentRegionId moved to front
  // - otherwise: plain country, or region if no country found
  let addtlRegion: RegionOption | undefined
  if (selectedRegion?.regionType === 'country') {
    addtlRegion = selectedRegion
  } else if (country && currentRegionId && country.parentRegionIds?.[0] !== currentRegionId) {
    addtlRegion = {
      ...country,
      parentRegionIds: [currentRegionId, ...(country.parentRegionIds ?? []).filter((id) => id !== currentRegionId)],
    }
  } else {
    addtlRegion = country ?? region
  }

  const breadcrumb: RegionOption[] = [defaultGlobalRegionOption]
  if (region) {
    breadcrumb.push(region)
  }
  if (country) {
    breadcrumb.push(country)
  }
  breadcrumb.push(subRegion)
  return { breadcrumb, addtlRegion }
}
