import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

import styles from './RegionSelect.module.scss'
import { useTranslation } from 'react-i18next'

/** TODO: Replace with actual country data */
type CountryOption = {
  group: 'All Data' | 'Countries with Coral Reefs'
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
]
/** End of mock data */

export default function RegionSelect() {
  const { t } = useTranslation()
  const [selectedValue, setSelectedValue] = useState<CountryOption | null>(DEFAULT_OPTION)

  const sortedOptions = countryOptions.sort((a, b) => {
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group)
    }
    return a.label.localeCompare(b.label)
  })

  const handleChange = (_, newValue: CountryOption | null) => {
    setSelectedValue(newValue || DEFAULT_OPTION)
  }

  const isOptionEqual = (option: CountryOption, value: CountryOption) => {
    return option.label === value.label && option.group === value.group
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <Autocomplete
        size="small"
        options={sortedOptions}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option.label}
        aria-label={t('select_region')}
        value={selectedValue}
        onChange={handleChange}
        isOptionEqualToValue={isOptionEqual}
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
