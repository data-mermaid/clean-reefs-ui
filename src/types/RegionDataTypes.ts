import { LngLat } from 'maplibre-gl'

export interface RegionOption {
  id: string
  regionType: RegionType
  label: string
  centerCoord: LngLat
  zoomLevel: number
}
export type RegionType = 'global' | 'watershed' | 'country' | 'region' | 'plume'
