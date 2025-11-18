import { createContext } from 'react'
import { MapGeoJSONFeature } from 'maplibre-gl'

// typed context for existing ChartCard consumers
export const SelectedFeatureContext = createContext<MapGeoJSONFeature | null>(null)
