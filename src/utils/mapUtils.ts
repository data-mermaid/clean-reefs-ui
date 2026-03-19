import { RegionOption } from '../types/RegionDataTypes'
import { regionOptions } from '../data/regionData'
import { LngLatBounds, Map, MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'
import { LayerInfo, SubLayerInfo } from '../types/MapDataTypes'
import { atlasBenthicColors, transparent } from '../data/mapData'
import { BASE_ZONAL_STATS_API, SEDIMENT_EXPOSURE_2000_URL } from '../constants'

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

export const setPolygonFill = (layerId, polygonIds, fillColors, map) => {
  //get map, or pass
  map.setPaintProperty(layerId, 'fill-color', [
    'match',
    ['get', 'watershed_id'],
    polygonIds[0],
    fillColors[0],
    polygonIds[1],
    fillColors[1],
    polygonIds[2],
    fillColors[2],
    transparent, // default
  ])
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

    if (polygonClickedRef.current) {
      map.setFeatureState(
        {
          source: mapDataLayer.sourceId,
          sourceLayer: mapDataLayer.sourceFileName,
          id: polygonClickedRef.current,
        },
        { select: false },
      )
      if (polygonClickedRef.current === featureId) {
        polygonClickedRef.current = null
        if (onSelect) {
          onSelect(null)
        }
        return
      }
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
    throw new Error(`HTTP error: ${err}`)
  }
}

export async function prepareZonalStatsCall(lngLat) {
  const { lat, lng } = lngLat
  //todo: check if selected year has available exposure url

  const basePayload = {
    aoi: { type: 'Point', coordinates: [lng, lat] },
    url: SEDIMENT_EXPOSURE_2000_URL, //todo: use year as parameter
    bands: [1, 2, 3, 4, 5, 6, 7],
    stats: ['majority'],
  }
  return await postZonalStats(basePayload)
}
