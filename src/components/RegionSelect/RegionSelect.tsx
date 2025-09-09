import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { GroupKey, RegionOption, defaultOption } from '../../types/RegionDataTypes'

/** TODO: Replace with actual country data */

const groupOrders: GroupKey[] = ['global', 'countries_with_coral', 'coral_reef_regions']

const regionOptions: RegionOption[] = [
  { groupKey: 'global', label: 'Global' },
  {
    groupKey: 'countries_with_coral',
    label: 'Antigua and Barbuda',
  },
  { groupKey: 'countries_with_coral', label: 'Australia' },
  { groupKey: 'countries_with_coral', label: 'Bahamas' },
  { groupKey: 'countries_with_coral', label: 'Barbados' },
  { groupKey: 'countries_with_coral', label: 'Belize' },
  { groupKey: 'countries_with_coral', label: 'Dominica' },
  { groupKey: 'countries_with_coral', label: 'Fiji' },
  { groupKey: 'countries_with_coral', label: 'Grenada' },
  { groupKey: 'countries_with_coral', label: 'Jamaica' },
  { groupKey: 'countries_with_coral', label: 'Malaysia' },

  {
    groupKey: 'countries_with_coral',
    label: 'New Zealand',
  },
  {
    groupKey: 'countries_with_coral',
    label: 'Saint Kitts',
  },
  { groupKey: 'coral_reef_regions', label: 'Great Barrier Reef' },
  { groupKey: 'coral_reef_regions', label: 'Caribbean Sea' },
  { groupKey: 'coral_reef_regions', label: 'Red Sea' },
  { groupKey: 'coral_reef_regions', label: 'Indo-Pacific' },
  { groupKey: 'coral_reef_regions', label: 'Coral Triangle' },
  { groupKey: 'coral_reef_regions', label: 'Mesoamerican Reef' },
  {
    groupKey: 'coral_reef_regions',
    label: 'Hawaiian Archipelago',
  },
  { groupKey: 'coral_reef_regions', label: 'Ningaloo Reef' },
]
/** End of mock data */

interface RegionSelectProps {
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
}

export default function RegionSelect({ selectedRegion, setSelectedRegion }: RegionSelectProps) {
  const { t } = useTranslation()
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

  const muiFilterOptions = createFilterOptions<RegionOption>({ ignoreAccents: true, trim: true })

  const createEmptyFilterOptions = useCallback((): RegionOption[] => {
    return [
      {
        groupKey: 'countries_with_coral',
        label: noCountriesMatchText,
      },
      {
        groupKey: 'coral_reef_regions',
        label: noRegionsMatchText,
      },
    ]
  }, [noCountriesMatchText, noRegionsMatchText])

  const handleChange = (_: unknown, newValue: RegionOption | null) => {
    setSelectedRegion(newValue || defaultOption)
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <Autocomplete<RegionOption>
        size="small"
        options={sortedOptions}
        groupBy={(option) => t(option.groupKey)}
        getOptionLabel={(option) => option.label}
        getOptionDisabled={(option) =>
          option.label === noCountriesMatchText || option.label === noRegionsMatchText
        }
        aria-label={t('select_region')}
        value={selectedRegion}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) =>
          option.label === value.label && option.groupKey === value.groupKey
        }
        noOptionsText=""
        filterOptions={(options, state) => {
          const filtered = muiFilterOptions(options, state)
          return filtered.length ? filtered : createEmptyFilterOptions()
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
