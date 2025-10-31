import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../data/mapData'
import { regionOptions } from '../data/regionData'
import i18next from 'i18next'
import { LngLat, MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'

export function getActiveLayers(mapLayers: LayerInfo[]): string[] {
  return mapLayers.filter((layer) => layer.isLayerOn).map((layer) => layer.layerId)
}

export function createPolygonHoverHandler(hoveredRef: RefObject<number | null>) {
  const SOURCE = 'watershed_src'
  const SOURCE_LAYER = 'Fiji+Solomons_watershed_LULC_SDR_v2'

  return (map, e: MapLayerMouseEvent) => {
    if (!e?.features || e.features.length === 0) {
      return
    }

    const featureId = e.features[0].id
    if (!featureId) {
      return
    }

    // no-op if hovering same feature
    if (featureId === hoveredRef.current) {
      return
    }

    if (hoveredRef.current) {
      map.setFeatureState(
        {
          source: SOURCE,
          sourceLayer: SOURCE_LAYER,
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
        source: SOURCE,
        sourceLayer: SOURCE_LAYER,
        id: hoveredRef.current,
      },
      { hover: true },
    )
  }
}

export function createPolygonClickHandler() {}
//todo: mapRegionSelected --> updateRegionSelected
export function mapRegionSelected(
  feature: MapGeoJSONFeature,
  lngLat: [number, number],
  zoomLevel: number,
): RegionOption {
  const regionLayerSelected: RegionOption = {
    regionType: regionOptions[0].regionType,
    label: regionOptions[0].label,
    centerCoord: new LngLat(...lngLat),
    zoomLevel: zoomLevel,
  }
  if (feature.layer.id === 'countries') {
    {
      regionLayerSelected.regionType = 'country'
      regionLayerSelected.label = feature.properties.TERRITORY1
    }
  } else if (feature.layer.id === 'watershed') {
    {
      regionLayerSelected.regionType = 'watershed'
      regionLayerSelected.label = i18next.t('regions.watershed')
    }
  } else if (feature.layer.id === 'regions') {
    regionLayerSelected.regionType = 'region'
    regionLayerSelected.label = feature.properties.name
  }
  return regionLayerSelected
}
