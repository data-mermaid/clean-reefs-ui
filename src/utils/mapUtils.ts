import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../data/mapData'
import { regionOptions } from '../data/regionData'
import { Map, MapGeoJSONFeature, MapLayerMouseEvent, LngLatBounds } from 'maplibre-gl'
import { RefObject } from 'react'

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

// export_threshold_country_2010
// export_threshold_region_2010
// export const createSedExportWatershedLayer = () => {
//   //todo: get selectedRegion
//   //if not country or region, default to country
//
//   const regionLevel = ['country', 'region'].includes(selectedRegion.regionType)
//     ? selectedRegion.regionType
//     : 'country'

//todo: get map instance /ref
// map.setPaintProperty('watershed', 'fill-color', [
//             'match',
//             ['get', `export_threshold_${regionLevel}_${selectedYear}`],
//             '0',
//             sedExportColorMapping['0'],
//             '1-10',
//             sedExportColorMapping['1-10'],
//             '10-20',
//             sedExportColorMapping['10-20'],
//             '20-50',
//             sedExportColorMapping['20-50'],
//             '50-75',
//             sedExportColorMapping['50-75'],
//             '75-90',
//             sedExportColorMapping['75-90'],
//             '90-100',
//             sedExportColorMapping['90-100'],
//             'rgba(0,0,0,0)', // default transparent
//           ],)
// }

export function mapRegionSelected(feature: MapGeoJSONFeature): RegionOption {
  const matchingRegion = regionOptions.find(
    (region) => region.label === feature.properties.TERRITORY1,
  )
  if (matchingRegion && feature.layer.id === 'watershed') {
    return { ...matchingRegion, regionType: 'watershed' }
  }
  return matchingRegion || regionOptions[0]
}
