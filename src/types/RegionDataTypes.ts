import { LngLat } from '@maptiler/sdk'

export interface RegionOption {
  regionType: RegionType
  label: string
  centerCoord: LngLat //[number, number]
  zoomLevel: number
}
type RegionType = 'global' | 'watershed' | 'country' | 'region'

export const defaultOption: RegionOption = {
  regionType: 'global',
  label: 'Global',
  centerCoord: new LngLat(160.414413, -5.578193),
  zoomLevel: 6,
}

/** MVP: Starts with just the two countries & one region */
export const regionOptions: RegionOption[] = [
  defaultOption,
  {
    regionType: 'country',
    label: 'Fiji',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
  },
  {
    regionType: 'country',
    label: 'Solomon Islands',
    centerCoord: new LngLat(160.156194, -9.64571),
    zoomLevel: 8,
  },
  {
    regionType: 'region',
    label: 'Central Indo-Pacific',
    centerCoord: new LngLat(150.95132012291594, -0.5972317458082159),
    zoomLevel: 3,
  },
]
