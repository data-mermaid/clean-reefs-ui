import { create } from 'zustand'
import maplibregl from 'maplibre-gl'
import { transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import { buildWatershedMatchExpression, resolveBasemapBeforeId } from '../utils/mapUtils'
import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../types/MapDataTypes'
import { useSelectedFeatureStore } from './selectedFeatureStore'

type MapState = {
  mapReference: MapRef | null
  basemapBeforeId: string | undefined
  watershedLayer: LayerInfo | null
  sedExposureBoundaryLayer: LayerInfo | null
  isBasemapChanging: boolean
  topWatershedIds: number[]
  sedLoadMode: 'pixel' | 'watershed' | null
  sedLoadYear: number
  isGeoSearchOpen: boolean
  watershedChoroplethExpression: maplibregl.ExpressionSpecification | string
  watershedSedLoadMin: number | null
  watershedSedLoadMax: number | null
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBasemapBeforeId: (id: string | undefined) => void
  setTopWatershedIds: (polygonIds: number[]) => void
  setWatershedLayer: (layer: LayerInfo | null) => void
  setSedExposureBoundaryLayer: (layer: LayerInfo | null) => void
  applyLabelVisibility: (show: boolean) => void
  prepareBasemapChange: (showLabels: boolean) => void
  restoreActiveSelection: () => void
  toggleSedLoadSubLayerFills: (
    subLayerToggledOn: 'pixel' | 'watershed',
    selectedYear: number,
  ) => void
  turnOffSedLoadSubLayerFills: () => void
  setTopPolygonsFill: (layerId: string, polygonIds: number[]) => void
  clearTopPolygonsFill: (layerId: string) => void
  setWatershedChoroplethExpression: (expr: maplibregl.ExpressionSpecification | string) => void
  setWatershedSedLoadRange: (min: number | null, max: number | null) => void
  jumpToRegion: (region: RegionOption) => void
  openGeoSearch: () => void
  closeGeoSearch: () => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  basemapBeforeId: undefined,
  setBasemapBeforeId: (id) => set({ basemapBeforeId: id }),
  watershedLayer: null,
  setWatershedLayer: (layer) => set({ watershedLayer: layer }),
  sedExposureBoundaryLayer: null,
  setSedExposureBoundaryLayer: (layer) => set({ sedExposureBoundaryLayer: layer }),
  isBasemapChanging: false,
  topWatershedIds: [],
  setTopWatershedIds: (polygonIds) => set({ topWatershedIds: polygonIds }),
  applyLabelVisibility: (show) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }

    const visibility = show ? 'visible' : 'none'
    map
      .getStyle()
      ?.layers.filter((layer) => layer.type === 'symbol')
      .forEach((layer) => map.setLayoutProperty(layer.id, 'visibility', visibility))
  },
  prepareBasemapChange: (showLabels) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }

    set({ isBasemapChanging: true })
    map.once('styledata', () => {
      const layers = map.getStyle()?.layers ?? []
      const nextBeforeId = resolveBasemapBeforeId(layers)

      set({ basemapBeforeId: nextBeforeId })

      const visibility = showLabels ? 'visible' : 'none'
      layers
        .filter((layer) => layer.type === 'symbol')
        .forEach((layer) => map.setLayoutProperty(layer.id, 'visibility', visibility))

      set({ isBasemapChanging: false })
    })
  },

  // Restore whichever active state is present (selected polygon OR top contributing fills)
  // after a basemap change. Uses map.once('idle') so it fires after the new style is fully
  // settled and React has re-added the watershed source/layer.
  restoreActiveSelection: () => {
    const state = get()
    const map = state.mapReference?.getMap()

    if (!map) {
      return
    }

    map.once('idle', () => {
      const { selectedFeature } = useSelectedFeatureStore.getState()
      const {
        topWatershedIds,
        watershedLayer,
        sedExposureBoundaryLayer: plumeLayer,
        setTopPolygonsFill,
      } = get()

      const canRestoreSelectedFeature =
        selectedFeature?.id != null &&
        watershedLayer != null &&
        map.getSource(watershedLayer.sourceId) != null

      if (canRestoreSelectedFeature) {
        map.setFeatureState(
          {
            source: watershedLayer.sourceId,
            sourceLayer: watershedLayer.sourceFileName,
            id: selectedFeature.id,
          },
          { select: true },
        )
        // Re-apply the linked plume outline highlight that gets cleared by the style reload.
        if (plumeLayer && map.getSource(plumeLayer.sourceId) != null) {
          map.setFeatureState(
            {
              source: plumeLayer.sourceId,
              sourceLayer: plumeLayer.sourceFileName,
              id: selectedFeature.id,
            },
            { linkedSelect: true },
          )
        }
        return
      }

      if (topWatershedIds.length > 0) {
        // setFeatureState (used for selectedFeature above) survives layer re-mounts, but
        // setPaintProperty (used inside setTopPolygonsFill) gets overwritten when react-map-gl
        // re-applies the Layer's paint prop after the basemap style change triggers a re-render.
        // A second idle ensures we apply after that re-render has settled.
        map.once('idle', () => {
          setTopPolygonsFill('watershed', topWatershedIds)
        })
      }
    })
  },

  sedLoadMode: null,
  sedLoadYear: 0,
  isGeoSearchOpen: false,
  watershedChoroplethExpression: transparent,
  setWatershedChoroplethExpression: (expr) => set({ watershedChoroplethExpression: expr }),
  watershedSedLoadMin: null,
  watershedSedLoadMax: null,
  setWatershedSedLoadRange: (min, max) =>
    set({ watershedSedLoadMin: min, watershedSedLoadMax: max }),
  openGeoSearch: () => set({ isGeoSearchOpen: true }),
  closeGeoSearch: () => set({ isGeoSearchOpen: false }),
  toggleSedLoadSubLayerFills: (subLayerToggledOn: 'pixel' | 'watershed', selectedYear: number) => {
    set({ sedLoadMode: subLayerToggledOn, sedLoadYear: selectedYear })
  },
  turnOffSedLoadSubLayerFills: () => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds } = state

    if (!map) {
      return
    }

    set({ sedLoadMode: null })

    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(topWatershedIds, transparent),
    )
  },
  clearTopPolygonsFill: (layerId) => {
    const state = get()
    const map = state.mapReference?.getMap()

    if (!map) {
      return
    }

    set({ topWatershedIds: [] })
    map.setPaintProperty(layerId, 'fill-color', state.watershedChoroplethExpression)
  },
  jumpToRegion: (region) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }
    if (region.extent) {
      const [west, south, east, north] = region.extent
      map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        { bearing: 0, padding: 40 },
      )
    } else if (region.centerCoord) {
      map.flyTo({
        center: region.centerCoord,
        zoom: region.zoomLevel,
        bearing: 0,
      })
    }
  },
  setTopPolygonsFill: (layerId, polygonIds) => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds } = state

    if (!map) {
      return
    }

    const baseFillExpression = state.watershedChoroplethExpression

    const hasSameIds =
      topWatershedIds.length === polygonIds.length &&
      topWatershedIds.every((id, index) => id === polygonIds[index])

    if (!hasSameIds) {
      set({ topWatershedIds: polygonIds })
    }

    map.setPaintProperty(
      layerId,
      'fill-color',
      buildWatershedMatchExpression(polygonIds, baseFillExpression),
    )
  },
}))
