import { RegionOption, RegionType } from '../types/RegionDataTypes'
import { COUNTRY_EXTENTS } from './countryExtents'
import { REGION_EXTENTS } from './regionExtents'

export const regionGroups: { type: RegionType; label: string }[] = [
  { type: 'global', label: 'All Data' },
  { type: 'region', label: 'Regions with Coral Reefs' },
  { type: 'country', label: 'Countries with Coral Reefs' },
]

export const defaultGlobalRegionOption: RegionOption = {
  id: 'global',
  regionType: 'global',
  label: 'Global',
  extent: COUNTRY_EXTENTS['Fiji'],
}

export const fallbackRegionOptions: RegionOption[] = [
  defaultGlobalRegionOption,
  {
    id: 'fiji',
    regionType: 'country',
    label: 'Fiji',
    bandId: 54,
    extent: COUNTRY_EXTENTS['Fiji'],
  },
  {
    id: 'solomon-islands',
    regionType: 'country',
    label: 'Solomon Islands',
    bandId: 138,
    extent: COUNTRY_EXTENTS['Solomon Islands'],
  },
  {
    id: 'central-indo-pacific',
    regionType: 'region',
    label: 'Central Indo-Pacific',
    bandId: 2,
    extent: REGION_EXTENTS['Central Indo-Pacific'],
  },
  {
    id: 'watershed',
    regionType: 'watershed',
    label: 'Watershed',
  },
  {
    id: 'plume',
    regionType: 'plume',
    label: 'Plume',
  },
]
