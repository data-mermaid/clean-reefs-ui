import { LngLat } from 'maplibre-gl'

export interface RegionOption {
  id: string
  regionType: RegionType
  label: string
  centerCoord: LngLat
  zoomLevel: number
  grouping: number //0+, used to denote what level in breadcrumb hierarchy
}
type RegionType = 'global' | 'watershed' | 'country' | 'region' | 'plume'
