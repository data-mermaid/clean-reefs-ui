import { create } from 'zustand'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { ZonalStatsBand } from '../types/MapDataTypes'

type MinimalFeature = {
  id: string | number
  source?: string
  properties?: Record<string, unknown>
}

type PlumeWatershedStats = Record<number, ZonalStatsBand>

type SelectedFeatureState = {
  selectedFeature: MinimalFeature | null
  setSelectedFeature: (feature: MapGeoJSONFeature | null) => void
  selectedPlumeWatershedStats: PlumeWatershedStats | null
  setSelectedPlumeWatershedStats: (stats: PlumeWatershedStats | null) => void
  clearSelectedFeature: () => void
  clearSelectedPlumeWatershedStats: () => void
}

export const useSelectedFeatureStore = create<SelectedFeatureState>((set) => ({
  selectedFeature: null,
  selectedPlumeWatershedStats: null,
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
  clearSelectedFeature: () => set({ selectedFeature: null }),
  clearSelectedPlumeWatershedStats: () => set({ selectedPlumeWatershedStats: null }),
}))
