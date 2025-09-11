import { Dispatch, SetStateAction, useCallback } from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { defaultOption, RegionOption, regionOptions } from '../../types/RegionDataTypes'
import _ from 'lodash'

interface RegionSelectProps {
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
}

export default function RegionSelect({ selectedRegion, setSelectedRegion }: RegionSelectProps) {
  const { t } = useTranslation()
  const noCountriesMatchText = t('regions.no_countries_match')
  const noRegionsMatchText = t('regions.no_regions_match')
  const muiFilterOptions = createFilterOptions<RegionOption>({ ignoreAccents: true, trim: true })

  const createEmptyFilterOptions = useCallback((): RegionOption[] => {
    return [
      {
        regionType: 'country',
        label: noCountriesMatchText,
      },
      {
        regionType: 'region',
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
        options={regionOptions}
        groupBy={(option) => {
          if (option.regionType === 'country') {
            return t('regions.countries_with_coral')
          } else if (option.regionType === 'region') {
            return t('regions.coral_reef_regions')
          } else {
            return t('regions.global')
          }
        }}
        getOptionLabel={(option) => option.label}
        getOptionDisabled={(option) =>
          option.label === noCountriesMatchText || option.label === noRegionsMatchText
        }
        aria-label={t('select_region')}
        value={selectedRegion}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) =>
          option.label === value.label && option.regionType === value.regionType
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
              key={_.kebabCase(key)}
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
          <li key={_.kebabCase(params.key)}>
            <div className={styles['group-header']}>{t(params.group)}</div>
            <ul className={styles['group-list']}>{params.children}</ul>
          </li>
        )}
      />
    </div>
  )
}
