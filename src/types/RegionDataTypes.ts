export type GroupKey = 'global' | 'countries_with_coral' | 'coral_reef_regions'

export interface RegionOption {
  groupKey: GroupKey
  regionType: RegionType
  label: string
}
type RegionType = 'global' | 'watershed' | 'country' | 'region'

export const defaultOption: RegionOption = {
  groupKey: 'global',
  regionType: 'global',
  label: 'Global',
}

/** MVP: Starts with just the two countries & one region */
export const regionOptions: RegionOption[] = [
  { groupKey: 'global', regionType: 'global', label: 'Global' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Fiji' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Solomon Islands' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Central Indo-Pacific' },
]
