import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../data/mapData'
import { regionOptions } from '../data/regionData'
import i18next from 'i18next'
import { LngLat, MapGeoJSONFeature } from 'maplibre-gl'

export function getActiveLayers(mapLayers: LayerInfo[]): string[] {
  return mapLayers.filter((layer) => layer.isLayerOn).map((layer) => layer.layerId)
}

export function checkRegionSelected(
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
