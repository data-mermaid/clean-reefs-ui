import { LngLat } from 'maplibre-gl'

export interface RegionOption {
  id: string
  regionType: RegionType
  label: string
  centerCoord?: LngLat
  zoomLevel?: number
  bandId?: number // numeric ID: REALM_ID for regions, COUNTRY_ID for countries — used for TiTiler raster mask filtering, PMTiles feature lookup, and map-click resolution
  extent?: [number, number, number, number] // [west, south, east, north] for fitBounds
}
export type RegionType = 'global' | 'watershed' | 'country' | 'region' | 'dispersal'
