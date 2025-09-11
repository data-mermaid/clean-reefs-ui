export interface RegionOption {
  regionType: RegionType
  label: string
}
type RegionType = 'global' | 'watershed' | 'country' | 'region'

export const defaultOption: RegionOption = {
  regionType: 'global',
  label: 'Global',
}

/** MVP: Starts with just the two countries & one region */
export const regionOptions: RegionOption[] = [
  { regionType: 'global', label: 'Global' },
  { regionType: 'country', label: 'Fiji' },
  { regionType: 'country', label: 'Solomon Islands' },
  { regionType: 'region', label: 'Central Indo-Pacific' },
]
