import { LngLat } from '@maptiler/sdk'

export interface RegionOption {
  regionType: RegionType
  label: string
  centerCoord: LngLat //[number, number]
  zoomLevel: number
}
type RegionType = 'global' | 'watershed' | 'country' | 'region'
