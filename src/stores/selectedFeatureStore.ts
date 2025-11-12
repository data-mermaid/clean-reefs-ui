import { create } from 'zustand'
import { MapGeoJSONFeature } from 'maplibre-gl'

type MinimalFeature = {
  id: string | number
  source?: string
  properties?: Record<string, unknown>
}

type SelectedFeatureState = {
  selectedFeature: MinimalFeature | null
  setSelectedFeature: (feature: MapGeoJSONFeature | null) => void
  clearSelectedFeature: () => void
}

export const useSelectedFeatureStore = create<SelectedFeatureState>((set) => ({
  selectedFeature: null,
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
}))
