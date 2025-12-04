import { create } from 'zustand'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import { MapRef } from 'react-map-gl/maplibre'
import { getUpdatedBenthicColor } from '../utils/mapUtils'

type MapState = {
  mapReference: MapRef | null
  benthicMapSubLayerColors: Record<string, string>
  sedExportMapSubLayerColors: Record<string, string>
}
type MapActions = {
  setMapRef: (map: MapRef) => void
  setSedExportMapSubLayerColors: (colors: Record<string, string>) => void
  setBenthicMapSubLayerColors: (colors: Record<string, string>) => void
  toggleSubLayerFillColor: (toggledProperty: string) => void
  toggleSedExportSubLayerFills: (subLayerToggledOn: 'pixel' | 'watershed') => void
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  mapReference: null,
  setMapRef: (mapRef) => set({ mapReference: mapRef }),
  benthicMapSubLayerColors: atlasBenthicColors,
  sedExportMapSubLayerColors: sedExportColorMapping,
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
  toggleSedExportSubLayerFills: (subLayerToggledOn: 'pixel' | 'watershed') => {
    const state = get()
    const map = state.mapReference?.getMap()
    if (!map) {
      return
    }
    const regionLevel = 'country' //TODO: pass in selected region level
    const selectedYear = 2020

    const pixelLayer = map.getLayer('sed_export')
    if (!pixelLayer) {
      return
    }

    map.setLayoutProperty(
      'sed_export',
      'visibility',
      subLayerToggledOn === 'pixel' ? 'visible' : 'none',
    )

    if (subLayerToggledOn === 'watershed') {
      map.setPaintProperty('watershed', 'fill-color', [
        'match',
        ['get', `export_threshold_${regionLevel}_${selectedYear}`],
        '0',
        sedExportColorMapping['0'],
        '1-10',
        sedExportColorMapping['1-10'],
        '10-20',
        sedExportColorMapping['10-20'],
        '20-50',
        sedExportColorMapping['20-50'],
        '50-75',
        sedExportColorMapping['50-75'],
        '75-90',
        sedExportColorMapping['75-90'],
        '90-100',
        sedExportColorMapping['90-100'],
        transparent, // default
      ])
    } else {
      map.setPaintProperty('watershed', 'fill-color', transparent)
    }
  },
}))
