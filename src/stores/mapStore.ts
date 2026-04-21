import { create } from 'zustand'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import {
  buildSedExportWatershedExpression,
  buildWatershedMatchExpression,
  getUpdatedBenthicColor,
} from '../utils/mapUtils'
import { LayerInfo } from '../types/MapDataTypes'
import { useSelectedFeatureStore } from './selectedFeatureStore'

type MapState = {
  mapReference: MapRef | null
  basemapBeforeId: string | undefined
  benthicMapSubLayerColors: Record<string, string>
  sedExportMapSubLayerColors: Record<string, string>
  sedExportMode: 'pixel' | 'watershed' | null
  sedExportYear: number
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBasemapBeforeId: (id: string | undefined) => void
  prepareBasemapChange: (showLabels: boolean) => void
  restoreActiveSelection: () => void
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
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  basemapBeforeId: undefined,
  setBasemapBeforeId: (id) => set({ basemapBeforeId: id }),
  // Register a once style.load listener before the URL update triggers react-map-gl's setStyle.
  // This ensures beforeId and label visibility are resolved on the new style's first load,
  // with no dep-array race condition.
  prepareBasemapChange: (showLabels) => {
    const map = get().mapReference?.getMap()
    if (!map) {
      return
    }

    map.once('style.load', () => {
      const layers = map.getStyle()?.layers ?? []
      const symbolLayers = layers.filter((layer) => layer.type === 'symbol')

      if (symbolLayers.length === 0) {
        return
      }

      set({ basemapBeforeId: symbolLayers[0].id })

      const visibility = showLabels ? 'visible' : 'none'
      for (const layer of symbolLayers) {
        map.setLayoutProperty(layer.id, 'visibility', visibility)
      }
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
      const { selectedFeature, topWatershedIds, watershedLayer } =
        useSelectedFeatureStore.getState()

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
        state.setTopPolygonsFill('watershed', topWatershedIds)
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

    if (!map) {
      return
    }

    set({ sedExportMode: subLayerToggledOn, sedExportYear: selectedYear })

    const pixelLayer = map.getLayer('sed_export')

    if (pixelLayer) {
      map.setLayoutProperty(
        'sed_export',
        'visibility',
        subLayerToggledOn === 'pixel' ? 'visible' : 'none',
      )
    }

    const { topWatershedIds } = useSelectedFeatureStore.getState()
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
    if (!map) {
      return
    }

    set({ sedExportMode: null })

    const pixelLayer = map.getLayer('sed_export')

    if (pixelLayer) {
      map.setLayoutProperty('sed_export', 'visibility', 'none')
    }

    const { topWatershedIds } = useSelectedFeatureStore.getState()
    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(topWatershedIds, transparent),
    )
  },
  clearTopPolygonsFill: (layerId) => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { setTopWatershedIds } = useSelectedFeatureStore.getState()

    if (!map) {
      return
    }

    // Restore the watershed choropleth when in watershed mode so the sed-export
    // coloring remains visible after the top-polygon highlight is cleared.
    const baseFillExpression =
      state.sedExportMode === 'watershed'
        ? buildSedExportWatershedExpression(state.sedExportYear)
        : transparent

    setTopWatershedIds([])
    map.setPaintProperty(layerId, 'fill-color', baseFillExpression)
  },
  setTopPolygonsFill: (layerId, polygonIds) => {
    const state = get()
    const map = state.mapReference?.getMap()
    const { topWatershedIds, setTopWatershedIds } = useSelectedFeatureStore.getState()

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
      setTopWatershedIds(polygonIds)
    }

    map.setPaintProperty(
      layerId,
      'fill-color',
      buildWatershedMatchExpression(polygonIds, baseFillExpression),
    )
  },
}))
