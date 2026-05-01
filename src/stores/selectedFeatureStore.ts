import { create } from 'zustand'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { LayerInfo, ZonalStatsBand } from '../types/MapDataTypes'

type MinimalFeature = {
  id: string | number
  source?: string
  properties?: Record<string, unknown>
}

type PlumeWatershedStats = Record<number, ZonalStatsBand>

type SelectedFeatureState = {
  selectedFeature: MinimalFeature | null
  setSelectedFeature: (feature: MapGeoJSONFeature | null) => void
  topWatershedIds: number[]
  watershedLayer: LayerInfo | null
  selectedPlumeWatershedStats: PlumeWatershedStats | null
  setSelectedPlumeWatershedStats: (stats: PlumeWatershedStats | null) => void
  setTopWatershedIds: (polygonIds: number[]) => void
  setWatershedLayer: (layer: LayerInfo) => void
  clearSelectedFeature: () => void
  clearSelectedPlumeWatershedStats: () => void
}

export const useSelectedFeatureStore = create<SelectedFeatureState>((set) => ({
  selectedFeature: null,
  selectedPlumeWatershedStats: null,
  topWatershedIds: [],
  watershedLayer: null,
  setSelectedPlumeWatershedStats: (stats) => set({ selectedPlumeWatershedStats: stats }),
  setSelectedFeature: (feature) => {
    if (!feature) {
      set({ selectedFeature: null })
      return
    }

    const minimal: MinimalFeature = {
      id: feature.id as string | number,
      source: feature.source,
      properties: feature.properties as Record<string, unknown>,
    }

    set({ selectedFeature: minimal })
  },
  setTopWatershedIds: (polygonIds) => {
    set({ topWatershedIds: polygonIds })
  },
  setWatershedLayer: (layer) => set({ watershedLayer: layer }),
  clearSelectedFeature: () => set({ selectedFeature: null }),
  clearSelectedPlumeWatershedStats: () => set({ selectedPlumeWatershedStats: null }),
}))
