import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

import styles from './RegionSelect.module.scss'
import { useTranslation } from 'react-i18next'

/** TODO: Replace with actual country data */
type CountryOption = {
  group: 'All Data' | 'Countries with Coral Reefs' | 'Coral reef regions'
  label: string
}

const DEFAULT_OPTION: CountryOption = {
  group: 'All Data',
  label: 'Global',
}

const countryOptions: CountryOption[] = [
  { group: 'All Data', label: 'Global' },
  { group: 'Countries with Coral Reefs', label: 'Antigua and Barbuda' },
  { group: 'Countries with Coral Reefs', label: 'Australia' },
  { group: 'Countries with Coral Reefs', label: 'Bahamas' },
  { group: 'Countries with Coral Reefs', label: 'Barbados' },
  { group: 'Countries with Coral Reefs', label: 'Belize' },
  { group: 'Countries with Coral Reefs', label: 'Dominica' },
  { group: 'Countries with Coral Reefs', label: 'Fiji' },
  { group: 'Countries with Coral Reefs', label: 'Grenada' },
  { group: 'Countries with Coral Reefs', label: 'Jamaica' },
  { group: 'Countries with Coral Reefs', label: 'Malaysia' },
  { group: 'Countries with Coral Reefs', label: 'New Zealand' },
  { group: 'Countries with Coral Reefs', label: 'Saint Kitts' },
  { group: 'Coral reef regions', label: 'Great Barrier Reef' },
  { group: 'Coral reef regions', label: 'Caribbean Sea' },
  { group: 'Coral reef regions', label: 'Red Sea' },
  { group: 'Coral reef regions', label: 'Indo-Pacific' },
  { group: 'Coral reef regions', label: 'Coral Triangle' },
  { group: 'Coral reef regions', label: 'Mesoamerican Reef' },
  { group: 'Coral reef regions', label: 'Hawaiian Archipelago' },
  { group: 'Coral reef regions', label: 'Ningaloo Reef' },
]
/** End of mock data */

export default function RegionSelect() {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState<CountryOption | null>(DEFAULT_OPTION)

  const sortedOptions = countryOptions.sort((a, b) => {
    const groupOrder = [t('all_data'), t('countries_with_coral'), t('coral_reef_regions')]

    if (a.group !== b.group) {
      const aIndex = groupOrder.indexOf(a.group)
      const bIndex = groupOrder.indexOf(b.group)
      return aIndex - bIndex
    }
    return a.label.localeCompare(b.label)
  })

  const handleChange = (_, newValue: CountryOption | null) => {
    setSelectedValue(newValue || DEFAULT_OPTION)
  }

  const isOptionEqual = (option: CountryOption, value: CountryOption) => {
    return option.label === value.label && option.group === value.group
  }

  const createEmptyFilterOptions = (): CountryOption[] => {
    const noDataGroupDisplay = [
      { name: t('countries_with_coral'), label: t('no_countries_match') },
      { name: t('coral_reef_regions'), label: t('no_regions_match') },
    ]
    return noDataGroupDisplay.map((group) => ({
      group: group.name as CountryOption['group'],
      label: group.label,
    }))
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <Autocomplete
        size="small"
        options={sortedOptions}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option.label}
        getOptionDisabled={(option) => option.label.startsWith('No ')}
        aria-label={t('select_region')}
        value={selectedValue}
        onChange={handleChange}
        isOptionEqualToValue={isOptionEqual}
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
        renderOption={(props, option) => (
          <li {...props} style={{ opacity: option.label === 'No data' ? 0.6 : 1 }}>
            {option.label}
          </li>
        )}
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
