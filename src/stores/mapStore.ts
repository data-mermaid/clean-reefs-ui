import { create } from 'zustand'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import {
  buildSedExportWatershedExpression,
  buildWatershedMatchExpression,
  getUpdatedBenthicColor,
} from '../utils/mapUtils'

export type BasemapStyle = 'satellite' | 'light' | 'dark' | 'basic'

type MapState = {
  mapReference: MapRef | null
  benthicMapSubLayerColors: Record<string, string>
  sedExportMapSubLayerColors: Record<string, string>
  topWatershedIds: number[]
  sedExportMode: 'pixel' | 'watershed' | null
  sedExportYear: number
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setSedExportMapSubLayerColors: (colors: Record<string, string>) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
  toggleSedExportSubLayerFills: (
    subLayerToggledOn: 'pixel' | 'watershed',
    selectedYear: number,
  ) => void
  turnOffSedExportSubLayerFills: () => void
  setTopPolygonsFill: (layerId: string, polygonIds: number[]) => void
  setTopWatershedIds: (polygonIds: number[]) => void
  clearTopPolygonsFill: (layerId: string) => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  benthicMapSubLayerColors: atlasBenthicColors,
  sedExportMapSubLayerColors: sedExportColorMapping,
  topWatershedIds: [],
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

    const baseFillExpression =
      subLayerToggledOn === 'watershed'
        ? buildSedExportWatershedExpression(selectedYear)
        : transparent

    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(state.topWatershedIds, baseFillExpression),
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

    map.setPaintProperty(
      'watershed',
      'fill-color',
      buildWatershedMatchExpression(state.topWatershedIds, transparent),
    )
  },
  setTopWatershedIds: (polygonIds) => {
    set({ topWatershedIds: polygonIds })
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
  setTopPolygonsFill: (layerId, polygonIds) => {
    const state = get()
    const map = state.mapReference?.getMap()

    if (!map) {
      return
    }

    // Use the active watershed choropleth as the fallback so non-highlighted
    // watersheds keep their sed-export colour while the top polygons are shown.
    const baseFillExpression =
      state.sedExportMode === 'watershed'
        ? buildSedExportWatershedExpression(state.sedExportYear)
        : transparent

    set({ topWatershedIds: polygonIds })
    map.setPaintProperty(
      layerId,
      'fill-color',
      buildWatershedMatchExpression(polygonIds, baseFillExpression),
    )
  },
}))
