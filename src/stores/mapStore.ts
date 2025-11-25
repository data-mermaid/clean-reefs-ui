import { create } from 'zustand'
import { atlasBenthicColors, sedExportColorMapping } from '../data/mapData'
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
  toggleSedExportSubLayerFills: () => void
  setSedExportWatershedLayer: () => void
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
  toggleSedExportSubLayerFills: () => {
    const state = get()
    const map = state.mapReference?.getMap()
    if (!map) {
      return
    }
    const pixelLayer = map.getLayer('sed_export')
    const watershedLayer = map.getLayer('sed_export_watershed')
    if (!pixelLayer) {
      return
    }
    if (!watershedLayer) {
      state.setSedExportWatershedLayer()
      state.toggleSedExportSubLayerFills()
      return
    }
    const isPixelLayerOn = map.getLayoutProperty('sed_export', 'visibility') === 'visible'
    const isWatershedLayerOn =
      map.getLayoutProperty('sed_export_watershed', 'visibility') === 'visible'

    map.setPaintProperty('sed_export', 'fill-opacity', isPixelLayerOn ? 0 : 1)
    map.setPaintProperty('sed_export_watershed', 'fill-opacity', isWatershedLayerOn ? 0 : 1)
  },

  // export_threshold_country_2010
  // export_threshold_region_2010
  setSedExportWatershedLayer: () => {
    const state = get()
    const map = state.mapReference?.getMap()
    if (!map) {
      return
    }
    //TEMP consts
    const regionLevel = 'country'
    const selectedYear = 2020

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
      'rgba(0,0,0,0)', // default transparent
    ])
    map.setLayoutProperty('watershed', 'visibility', false)
  },
}))
