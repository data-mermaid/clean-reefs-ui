import { LngLat } from 'maplibre-gl'

export interface RegionOption {
  id: string
  regionType: RegionType
  label: string
  centerCoord: LngLat
  zoomLevel: number
  bandId?: number // numeric raster band ID for TiTiler filtering; omit if no data available
}
export type RegionType = 'global' | 'watershed' | 'country' | 'region' | 'plume'
