import { LngLat } from 'maplibre-gl'
import { RegionOption, RegionType } from '../types/RegionDataTypes'

export const regionGroups: { type: RegionType; label: string }[] = [
  { type: 'global', label: 'All Data' },
  { type: 'region', label: 'Regions with Coral Reefs' },
  { type: 'country', label: 'Countries with Coral Reefs' },
]

export const defaultGlobalRegionOption: RegionOption = {
  id: 'global',
  regionType: 'global',
  label: 'Global',
  centerCoord: new LngLat(178.25, -17.5),
  zoomLevel: 8,
}

/** MVP: Starts with just the two countries & one region */
export const regionOptions: RegionOption[] = [
  defaultGlobalRegionOption,
  {
    id: 'fiji',
    regionType: 'country',
    label: 'Fiji',
    bandId: 54,
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
  },
  {
    id: 'solomon-islands',
    regionType: 'country',
    label: 'Solomon Islands',
    centerCoord: new LngLat(160.156194, -9.64571),
    zoomLevel: 8,
  },
  {
    id: 'central-indo-pacific',
    regionType: 'region',
    label: 'Central Indo-Pacific',
    bandId: 2,
    centerCoord: new LngLat(150.95132012291594, -0.5972317458082159),
    zoomLevel: 3,
  },
  {
    id: 'watershed',
    regionType: 'watershed',
    label: 'Watershed',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
  },
  {
    id: 'plume',
    regionType: 'plume',
    label: 'Plume',
    centerCoord: new LngLat(179.414413, -16.578193),
    zoomLevel: 8,
  },
]
