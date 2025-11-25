import { create } from 'zustand'
import { atlasBenthicColors } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import { getUpdatedBenthicColor } from '../utils/mapUtils'

type MapState = {
  mapReference: MapRef | null
  benthicMapSubLayerColors: Record<string, string>
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  benthicMapSubLayerColors: atlasBenthicColors,
  setBenthicMapSubLayerColors: (colors) => set({ benthicMapSubLayerColors: colors }),
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
}))
