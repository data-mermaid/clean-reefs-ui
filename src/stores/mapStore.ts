import { create } from 'zustand'
import { atlasBenthicColors, sedLoadColorMapping, transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import {
  buildSedLoadWatershedExpression,
  buildWatershedMatchExpression,
  getUpdatedBenthicColor,
  resolveBasemapBeforeId,
} from '../utils/mapUtils'
import { RegionOption } from '../types/RegionDataTypes'
import { LayerInfo } from '../types/MapDataTypes'
import { useSelectedFeatureStore } from './selectedFeatureStore'

type MapState = {
  mapReference: MapRef | null
  basemapBeforeId: string | undefined
  watershedLayer: LayerInfo | null
  isBasemapChanging: boolean
  topWatershedIds: number[]
  benthicMapSubLayerColors: Record<string, string>
  sedLoadMapSubLayerColors: Record<string, string>
  sedLoadMode: 'pixel' | 'watershed' | null
  sedLoadYear: number
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBasemapBeforeId: (id: string | undefined) => void
  setTopWatershedIds: (polygonIds: number[]) => void
  setWatershedLayer: (layer: LayerInfo | null) => void
  applyLabelVisibility: (show: boolean) => void
  prepareBasemapChange: (showLabels: boolean) => void
  restoreActiveSelection: () => void
  setSedLoadMapSubLayerColors: (colors: Record<string, string>) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
  toggleSedLoadSubLayerFills: (
    subLayerToggledOn: 'pixel' | 'watershed',
    selectedYear: number,
  ) => void
  turnOffSedLoadSubLayerFills: () => void
  setTopPolygonsFill: (layerId: string, polygonIds: number[]) => void
  clearTopPolygonsFill: (layerId: string) => void
  jumpToRegion: (region: RegionOption) => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  basemapBeforeId: undefined,
  setBasemapBeforeId: (id) => set({ basemapBeforeId: id }),
  watershedLayer: null,
  setWatershedLayer: (layer) => set({ watershedLayer: layer }),
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
      const { topWatershedIds, watershedLayer, setTopPolygonsFill } = get()

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

  benthicMapSubLayerColors: atlasBenthicColors,
  sedLoadMapSubLayerColors: sedLoadColorMapping,
  sedLoadMode: null,
  sedLoadYear: 0,
  setBenthicMapSubLayerColors: (colors) => set({ benthicMapSubLayerColors: colors }),
  setSedLoadMapSubLayerColors: (colors) => set({ sedLoadMapSubLayerColors: colors }),
  toggleSubLayerFillColor: (toggledProperty) => {
    const state = get()
    const map = state.mapReference?.getMap()
    if (!map) {
      return
    }
    const updatedColor = getUpdatedBenthicColor(toggledProperty, state.benthicMapSubLayerColors)
    const updatedFillColors = {
      ...state.benthicMapSubLayerColors,
      [toggledProperty]: updatedColor,
    }
    set({ benthicMapSubLayerColors: updatedFillColors })
  },
  toggleSedLoadSubLayerFills: (subLayerToggledOn: 'pixel' | 'watershed', selectedYear: number) => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds } = state

    if (!map) {
      return
    }

    set({ sedLoadMode: subLayerToggledOn, sedLoadYear: selectedYear })

    const baseFillExpression =
      subLayerToggledOn === 'watershed'
        ? buildSedLoadWatershedExpression(selectedYear)
        : transparent

    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(topWatershedIds, baseFillExpression),
    )
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

    // Restore the watershed choropleth when in watershed mode so the sed-export
    // coloring remains visible after the top-polygon highlight is cleared.
    const baseFillExpression =
      state.sedLoadMode === 'watershed'
        ? buildSedLoadWatershedExpression(state.sedLoadYear)
        : transparent

    set({ topWatershedIds: [] })
    map.setPaintProperty(layerId, 'fill-color', baseFillExpression)
  },
  jumpToRegion: (region) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }
    if (region.extent) {
      map.fitBounds(region.extent, { bearing: 0, padding: 40 })
    } else if (region.centerCoord) {
      map.jumpTo({
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

    // Use the active watershed choropleth as the fallback so non-highlighted
    // watersheds keep their sed-export colour while the top polygons are shown.
    const baseFillExpression =
      state.sedLoadMode === 'watershed'
        ? buildSedLoadWatershedExpression(state.sedLoadYear)
        : transparent

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
