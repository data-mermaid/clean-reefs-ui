import { LngLat } from 'maplibre-gl'

export interface RegionOption {
  regionType: RegionType
  label: string
  centerCoord: LngLat
  zoomLevel: number
}
type RegionType = 'global' | 'watershed' | 'country' | 'region'
