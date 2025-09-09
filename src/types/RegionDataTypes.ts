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

export const groupOrders: GroupKey[] = ['global', 'countries_with_coral', 'coral_reef_regions']

/** TODO: Replace with actual country data */
export const regionOptions: RegionOption[] = [
  { groupKey: 'global', regionType: 'global', label: 'Global' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Antigua and Barbuda' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Australia' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Bahamas' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Barbados' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Belize' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Dominica' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Fiji' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Grenada' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Jamaica' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Malaysia' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'New Zealand' },
  { groupKey: 'countries_with_coral', regionType: 'country', label: 'Saint Kitts' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Great Barrier Reef' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Caribbean Sea' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Red Sea' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Indo-Pacific' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Coral Triangle' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Mesoamerican Reef' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Hawaiian Archipelago' },
  { groupKey: 'coral_reef_regions', regionType: 'region', label: 'Ningaloo Reef' },
]
/** End of mock data */
