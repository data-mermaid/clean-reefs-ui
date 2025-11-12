import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../data/mapData'
import { regionOptions } from '../data/regionData'
import { MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'

export function getActiveLayers(mapLayers: LayerInfo[]): string[] {
  return mapLayers.filter((layer) => layer.isLayerOn).map((layer) => layer.layerId)
}

export function createPolygonHoverHandler(hoveredRef: RefObject<string | number | null>) {
  return (map, e: MapLayerMouseEvent, mapDataLayer) => {
    if (!e?.features || e.features.length === 0) {
      return
    }

    const featureId = e.features[0].id
    if (!featureId) {
      return
    }

    if (featureId === hoveredRef.current) {
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
  onSelect?: (feature: MapGeoJSONFeature | null) => void,
) {
  return (map, e: MapLayerMouseEvent, mapDataLayer) => {
    if (!e?.features || e.features.length === 0) {
      return
    }

    const featureId = e.features[0].id
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
      { select: true },
    )

    if (onSelect) {
      onSelect(e.features[0] as MapGeoJSONFeature)
    }
  }
}

export function mapRegionSelected(feature: MapGeoJSONFeature): RegionOption {
  const matchingRegion = regionOptions.find(
    (region) => region.label === feature.properties.TERRITORY1,
  )
  if (matchingRegion && feature.layer.id === 'watershed') {
    Object.defineProperty(matchingRegion, 'regionType', { value: 'watershed' })
  }
  return matchingRegion || regionOptions[0]
}
