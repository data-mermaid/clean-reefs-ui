import { create } from 'zustand'

type MapApi = {
  setSubLayerOpacity: (layerId: string, otherthing) => void
} | null

interface MapStore {
  mapApi: MapApi
  setMapApi: (api: MapApi) => void
}

export const useMapStore = create<MapStore>((set) => ({
  mapApi: null,
  setMapApi: (api) => set({ mapApi: api }),
}))
