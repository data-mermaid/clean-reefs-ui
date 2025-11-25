import { create } from 'zustand'
import { atlasBenthicColors } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import { getUpdatedBenthicColor } from '../components/LayersDrawer/LayersDrawer'

//map state
type MapState = {
  mapReference: MapRef | null
  benthicMapSubLayerColors: Record<string, string>
}
//map actions
type MapActions = {
  setMapRef: (map: MapRef) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
}

//should this be part of MapApi, or should it just be in MapStore?
//Which one is binding the mapref?
// type MapApi = {
//   toggleSubLayerFillColor: (map: Map, toggledProperty: string) => void
// } | null
//
// interface MapStore {
//   mapApi: MapApi
//   setMapApi: (api: MapApi) => void
//   benthicMapSubLayerColors: Record<string, string>
//   setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
//   toggleSubLayerFillColor: (map: Map, toggledProperty: string) => void
// }

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
    // state.setBenthicMapSubLayerColors(updatedFillColors)
  },
}))
