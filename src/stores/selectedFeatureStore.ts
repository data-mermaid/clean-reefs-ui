import { create } from 'zustand'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { ZonalStatsBand } from '../types/MapDataTypes'

type MinimalFeature = {
  id: string | number
  source?: string
  properties?: Record<string, unknown>
}

type DispersalWatershedStats = Record<number, ZonalStatsBand>

type SelectedFeatureState = {
  selectedFeature: MinimalFeature | null
  setSelectedFeature: (feature: MapGeoJSONFeature | null) => void
  selectedDispersalWatershedStats: DispersalWatershedStats | null
  setSelectedDispersalWatershedStats: (stats: DispersalWatershedStats | null) => void
  clearSelectedFeature: () => void
  clearSelectedDispersalWatershedStats: () => void
}

export const useSelectedFeatureStore = create<SelectedFeatureState>((set) => ({
  selectedFeature: null,
  selectedDispersalWatershedStats: null,
  setSelectedDispersalWatershedStats: (stats) => set({ selectedDispersalWatershedStats: stats }),
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
  clearSelectedDispersalWatershedStats: () => set({ selectedDispersalWatershedStats: null }),
}))
