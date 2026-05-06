import { create } from 'zustand'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import {
  buildSedExportWatershedExpression,
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
  isBasemapChanging: boolean
  isLabelChanging: boolean
  topWatershedIds: number[]
  benthicMapSubLayerColors: Record<string, string>
  sedExportMapSubLayerColors: Record<string, string>
  sedExportMode: 'pixel' | 'watershed' | null
  sedExportYear: number
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBasemapBeforeId: (id: string | undefined) => void
  setTopWatershedIds: (polygonIds: number[]) => void
  applyLabelVisibility: (show: boolean) => void
  prepareBasemapChange: (showLabels: boolean) => void
  restoreActiveSelection: (watershedLayer: LayerInfo | null) => void
  setSedExportMapSubLayerColors: (colors: Record<string, string>) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
  toggleSedExportSubLayerFills: (
    subLayerToggledOn: 'pixel' | 'watershed',
    selectedYear: number,
  ) => void
  turnOffSedExportSubLayerFills: () => void
  setTopPolygonsFill: (layerId: string, polygonIds: number[]) => void
  clearTopPolygonsFill: (layerId: string) => void
  jumpToRegion: (region: RegionOption) => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  basemapBeforeId: undefined,
  setBasemapBeforeId: (id) => set({ basemapBeforeId: id }),
  isBasemapChanging: false,
  isLabelChanging: false,
  topWatershedIds: [],
  setTopWatershedIds: (polygonIds) => set({ topWatershedIds: polygonIds }),
  applyLabelVisibility: (show) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }

    set({ isLabelChanging: true })

    const visibility = show ? 'visible' : 'none'
    map
      .getStyle()
      ?.layers.filter((layer) => layer.type === 'symbol')
      .forEach((layer) => map.setLayoutProperty(layer.id, 'visibility', visibility))

    map.once('idle', () => set({ isLabelChanging: false }))
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
  restoreActiveSelection: (watershedLayer) => {
    console.log('restoreActiveSelection')
    const state = get()
    const map = state.mapReference?.getMap()

    if (!map) {
      return
    }

    map.once('idle', () => {
      const { selectedFeature } = useSelectedFeatureStore.getState()
      const { topWatershedIds, setTopPolygonsFill } = get()

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
  sedExportMapSubLayerColors: sedExportColorMapping,
  sedExportMode: null,
  sedExportYear: 0,
  setBenthicMapSubLayerColors: (colors) => set({ benthicMapSubLayerColors: colors }),
  setSedExportMapSubLayerColors: (colors) => set({ sedExportMapSubLayerColors: colors }),
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
  toggleSedExportSubLayerFills: (
    subLayerToggledOn: 'pixel' | 'watershed',
    selectedYear: number,
  ) => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds } = state

    if (!map) {
      return
    }

    set({ sedExportMode: subLayerToggledOn, sedExportYear: selectedYear })

    const baseFillExpression =
      subLayerToggledOn === 'watershed'
        ? buildSedExportWatershedExpression(selectedYear)
        : transparent

    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(topWatershedIds, baseFillExpression),
    )
  },
  turnOffSedExportSubLayerFills: () => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds } = state

    if (!map) {
      return
    }

    set({ sedExportMode: null })

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
      state.sedExportMode === 'watershed'
        ? buildSedExportWatershedExpression(state.sedExportYear)
        : transparent

    set({ topWatershedIds: [] })
    map.setPaintProperty(layerId, 'fill-color', baseFillExpression)
  },
  jumpToRegion: (region) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }
    map.jumpTo({
      center: region.centerCoord,
      zoom: region.zoomLevel,
      bearing: 0,
    })
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
      state.sedExportMode === 'watershed'
        ? buildSedExportWatershedExpression(state.sedExportYear)
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
