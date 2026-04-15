import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type { Feature, Polygon, MultiPolygon } from 'geojson'
import { RegionOption } from '../types/RegionDataTypes'
import { regionOptions } from '../data/regionData'
import {
  FilterSpecification,
  LngLatBounds,
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
} from 'maplibre-gl'
import { RefObject } from 'react'
import { LayerInfo, SubLayerInfo } from '../types/MapDataTypes'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import {
  BASE_ZONAL_STATS_API,
  SEDIMENT_EXPOSURE_2000_URL,
  SEDIMENT_EXPOSURE_2005_URL,
  SEDIMENT_EXPOSURE_2010_URL,
  SEDIMENT_EXPOSURE_2015_URL,
  SEDIMENT_EXPOSURE_2020_URL,
  topContributingWatershedColorFills,
} from '../constants'

export function getActiveLayers(mapLayers: LayerInfo[]): string[] {
  return mapLayers.filter((layer) => layer.isLayerOn).map((layer) => layer.layerId)
}

export const getUpdatedBenthicColor = (layerId, currentColors) => {
  if (currentColors[layerId] === transparent) {
    return atlasBenthicColors[layerId]
  } else {
    return transparent
  }
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

export function clearPolygonHover(
  map: Map,
  hoveredRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
) {
  if (hoveredRef.current) {
    map.setFeatureState(
      {
        source: mapDataLayer.sourceId,
        sourceLayer: mapDataLayer.sourceFileName,
        id: hoveredRef.current,
      },
      { hover: false },
    )
    hoveredRef.current = null
  }
}

export function clearPolygonSelect(
  map: Map,
  clickRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
) {
  if (clickRef.current) {
    map.setFeatureState(
      {
        source: mapDataLayer.sourceId,
        sourceLayer: mapDataLayer.sourceFileName,
        id: clickRef.current,
      },
      { select: false },
    )
    clickRef.current = null
  }
}

export function setPolygonSelect(
  map: Map,
  clickRef: RefObject<string | number | null>,
  mapDataLayer: LayerInfo,
  featureId: string | number,
) {
  clickRef.current = featureId
  map.setFeatureState(
    {
      source: mapDataLayer.sourceId,
      sourceLayer: mapDataLayer.sourceFileName,
      id: featureId,
    },
    { select: true },
  )
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
 * Reusable for any vector source that needs async feature lookup (watershed, plume, etc.).
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
    clearTimeout(timeoutId)
    onResult(result)
  }

  const onSourceData = (e: { sourceId?: string; isSourceLoaded?: boolean }) => {
    if (settled || e.sourceId !== sourceId) {
      return
    }
    const feature = findContainingFeature()
    // Settle as soon as a match is found, or all tiles are loaded with no match.
    if (feature || e.isSourceLoaded) {
      settle(feature)
    }
  }
  map.on('sourcedata', onSourceData)

  const timeoutId = setTimeout(() => settle(null), timeoutMs)

  return () => settle(null)
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

/**
 * Builds the MapLibre `match` expression for the watershed choropleth
 * (sed-export threshold percentile bands). The region level is currently
 * fixed to 'country' — update when the UI exposes region-level selection.
 */
export function buildSedExportWatershedExpression(selectedYear: number): unknown[] {
  const regionLevel = 'country' // TODO: pass in selected region level
  return [
    'match',
    ['get', `export_threshold_${regionLevel}_${selectedYear}`],
    '0',
    sedExportColorMapping['0'],
    '1-10',
    sedExportColorMapping['1-10'],
    '10-20',
    sedExportColorMapping['10-20'],
    '20-50',
    sedExportColorMapping['20-50'],
    '50-75',
    sedExportColorMapping['50-75'],
    '75-90',
    sedExportColorMapping['75-90'],
    '90-100',
    sedExportColorMapping['90-100'],
    transparent,
  ]
}

export function mapRegionSelected(feature: MapGeoJSONFeature): RegionOption {
  const matchingRegion = regionOptions.find(
    (region) => region.label === feature.properties.TERRITORY1,
  )
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
  //todo: check if selected year has available exposure url
  const exposureUrls = {
    2000: SEDIMENT_EXPOSURE_2000_URL,
    2005: SEDIMENT_EXPOSURE_2005_URL,
    2010: SEDIMENT_EXPOSURE_2010_URL,
    2015: SEDIMENT_EXPOSURE_2015_URL,
    2020: SEDIMENT_EXPOSURE_2020_URL,
  }

  const basePayload = {
    aoi: { type: 'Point', coordinates: [lng, lat] },
    url: exposureUrls[year], //todo: use year as parameter
    bands: [1, 2, 3, 4, 5, 6, 7],
    stats: ['majority'],
  }
  return await postZonalStats(basePayload)
}

export async function getAllYearZonalStats(lngLat) {
  const years = [2000, 2005, 2010, 2015, 2020]
  const availableYears = [2000]

  const zonalStatsPromises = years.map(async (year) => {
    if (!availableYears.includes(year)) {
      return { [year]: {} }
    }
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
