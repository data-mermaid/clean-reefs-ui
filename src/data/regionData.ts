import { LngLat } from 'maplibre-gl'
import { RegionOption } from '../types/RegionDataTypes'

export const defaultGlobalRegionOption: RegionOption = {
  id: 'global',
  regionType: 'global',
  label: 'Global',
  centerCoord: new LngLat(160.414413, -5.578193),
  zoomLevel: 6,
  grouping: 0,
}

/** MVP: Starts with just the two countries & one region */
export const regionOptions: RegionOption[] = [
  defaultGlobalRegionOption,
  {
    id: 'fiji',
    regionType: 'country',
    label: 'Fiji',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
    grouping: 2,
  },
  {
    id: 'solomon-islands',
    regionType: 'country',
    label: 'Solomon Islands',
    centerCoord: new LngLat(160.156194, -9.64571),
    zoomLevel: 8,
    grouping: 2,
  },
  {
    id: 'central-indo-pacific',
    regionType: 'region',
    label: 'Central Indo-Pacific',
    centerCoord: new LngLat(150.95132012291594, -0.5972317458082159),
    zoomLevel: 3,
    grouping: 1,
  },
  {
    id: 'watershed',
    regionType: 'watershed',
    label: 'Watershed',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
    grouping: 3,
  },
  {
    id: 'plume',
    regionType: 'plume',
    label: 'Plume',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
    grouping: 3,
  },
]
