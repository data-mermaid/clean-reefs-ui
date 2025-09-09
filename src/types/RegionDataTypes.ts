export type GroupKey = 'global' | 'countries_with_coral' | 'coral_reef_regions'

export interface RegionOption {
  groupKey: GroupKey
  label: string
}
export const defaultOption: RegionOption = {
  groupKey: 'global',
  label: 'Global',
}
// type RegionType = 'global' | 'watershed' | 'country' | 'regions'
