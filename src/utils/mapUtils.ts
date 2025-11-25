import { RegionOption } from '../types/RegionDataTypes'
import { regionOptions } from '../data/regionData'
import { Map, MapGeoJSONFeature, MapLayerMouseEvent, LngLatBounds } from 'maplibre-gl'
import { RefObject } from 'react'
import { LayerInfo } from '../types/MapDataTypes'
import { atlasBenthicColors, transparent } from '../data/mapData'

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

export function createPolygonHoverHandler(hoveredRef: RefObject<string | number | null>) {
  return (map: Map, e: MapLayerMouseEvent, mapDataLayer: LayerInfo) => {
    if (!e.features || e.features.length === 0 || !e.features[0].id) {
      return
    }

    const featureId = e.features[0].id

    // If the polygon is already selected, do not apply hover state
    const selectedRef = map.getFeatureState({
      source: mapDataLayer.sourceId,
      sourceLayer: mapDataLayer.sourceName,
      id: featureId,
    })

    if (featureId === hoveredRef.current || selectedRef?.select) {
      return
    }

    if (hoveredRef.current) {
      map.setFeatureState(
        {
          source: mapDataLayer.sourceId,
          sourceLayer: mapDataLayer.sourceName,
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
        sourceLayer: mapDataLayer.sourceName,
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
          sourceLayer: mapDataLayer.sourceName,
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
        sourceLayer: mapDataLayer.sourceName,
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

export function mapRegionSelected(feature: MapGeoJSONFeature): RegionOption {
  const matchingRegion = regionOptions.find(
    (region) => region.label === feature.properties.TERRITORY1,
  )
  if (matchingRegion && feature.layer.id === 'watershed') {
    return { ...matchingRegion, regionType: 'watershed' }
  }
  return matchingRegion || regionOptions[0]
}
