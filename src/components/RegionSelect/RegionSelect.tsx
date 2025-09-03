import { useState, useMemo, useCallback } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'

import styles from './RegionSelect.module.scss'

/** TODO: Replace with actual country data */
type GroupKey = 'all_data' | 'countries_with_coral' | 'coral_reef_regions'
type GroupName = 'All Data' | 'Countries with Coral Reefs' | 'Coral reef regions'

interface RegionOption {
  groupKey: GroupKey
  groupName: GroupName
  label: string
}

const groupOrders: GroupKey[] = ['all_data', 'countries_with_coral', 'coral_reef_regions']

const defaultOption: RegionOption = {
  groupKey: 'all_data',
  groupName: 'All Data',
  label: 'Global',
}

const regionOptions: RegionOption[] = [
  { groupKey: 'all_data', groupName: 'All Data', label: 'Global' },
  {
    groupKey: 'countries_with_coral',
    groupName: 'Countries with Coral Reefs',
    label: 'Antigua and Barbuda',
  },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Australia' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Bahamas' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Barbados' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Belize' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Dominica' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Fiji' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Grenada' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Jamaica' },
  { groupKey: 'countries_with_coral', groupName: 'Countries with Coral Reefs', label: 'Malaysia' },
  {
    groupKey: 'countries_with_coral',
    groupName: 'Countries with Coral Reefs',
    label: 'New Zealand',
  },
  {
    groupKey: 'countries_with_coral',
    groupName: 'Countries with Coral Reefs',
    label: 'Saint Kitts',
  },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Great Barrier Reef' },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Caribbean Sea' },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Red Sea' },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Indo-Pacific' },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Coral Triangle' },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Mesoamerican Reef' },
  {
    groupKey: 'coral_reef_regions',
    groupName: 'Coral reef regions',
    label: 'Hawaiian Archipelago',
  },
  { groupKey: 'coral_reef_regions', groupName: 'Coral reef regions', label: 'Ningaloo Reef' },
]
/** End of mock data */

export default function RegionSelect() {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState<RegionOption | null>(defaultOption)
  const noCountriesMatchText = t('no_countries_match')
  const noRegionsMatchText = t('no_regions_match')

  const sortedOptions = useMemo(() => {
    return [...regionOptions].sort((a, b) => {
      if (a.groupKey !== b.groupKey) {
        const aIndex = groupOrders.indexOf(a.groupKey)
        const bIndex = groupOrders.indexOf(b.groupKey)
        return aIndex - bIndex
      }
      return a.label.localeCompare(b.label)
    })
  }, [])

  const createEmptyFilterOptions = useCallback((): RegionOption[] => {
    const noDataGroups = [
      {
        groupKey: 'countries_with_coral',
        groupName: 'Countries with Coral Reefs',
        label: noCountriesMatchText,
      },
      {
        groupKey: 'coral_reef_regions',
        groupName: 'Coral reef regions',
        label: noRegionsMatchText,
      },
    ]

    return noDataGroups as RegionOption[]
  }, [noCountriesMatchText, noRegionsMatchText])

  const handleChange = (_: unknown, newValue: RegionOption | null) => {
    setSelectedValue(newValue || defaultOption)
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <Autocomplete<RegionOption>
        size="small"
        options={sortedOptions}
        groupBy={(option) => option.groupName}
        getOptionLabel={(option) => option.label}
        getOptionDisabled={(option) =>
          option.label === noCountriesMatchText || option.label === noRegionsMatchText
        }
        aria-label={t('select_region')}
        value={selectedValue}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) =>
          option.label === value.label && option.groupName === value.groupName
        }
        noOptionsText=""
        filterOptions={(options, { inputValue }) => {
          const filtered = options.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()),
          )

          if (filtered.length === 0) {
            return createEmptyFilterOptions()
          }

          return filtered
        }}
        classes={{
          root: styles['MuiAutocomplete-root'],
          input: styles['MuiAutocomplete-input'],
          clearIndicator: styles['MuiAutocomplete-clearIndicator'],
          popupIndicator: styles['MuiAutocomplete-popupIndicator'],
          option: styles['MuiAutocomplete-option'],
          noOptions: styles['MuiAutocomplete-noOptions'],
        }}
        slotProps={{
          popper: {
            className: styles['custom-autocomplete-popper'],
          },
        }}
        renderInput={(params) => <TextField {...params} />}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props
          return (
            <li
              key={key}
              {...otherProps}
              style={{
                opacity:
                  option.label === noCountriesMatchText || option.label === noRegionsMatchText
                    ? 0.6
                    : 1,
              }}
            >
              {option.label}
            </li>
          )
        }}
        renderGroup={(params) => (
          <li key={params.key}>
            <div className={styles['group-header']}>{params.group}</div>
            <ul className={styles['group-list']}>{params.children}</ul>
          </li>
        )}
      />
    </div>
  )
}
