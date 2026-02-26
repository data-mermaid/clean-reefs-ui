import React, { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { RegionOption } from '../../types/RegionDataTypes'
import _ from 'lodash'
import { defaultRegionOption, regionOptions } from '../../data/regionData'
import { FormControl, Select } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'

interface RegionSelectProps {
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
}

export default function RegionSelect({ selectedRegion, setSelectedRegion }: RegionSelectProps) {
  const { t } = useTranslation()
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>([
    regionOptions[3],
    regionOptions[2],
    regionOptions[4],
  ]) //[selectedRegion]
  const getCrumbles = () => {
    let items
    if (breadcrumb.length > 0) {
      items = breadcrumb.map((crumb, idx) => {
        return (
          <button
            className={styles['crumb-item']}
            key={_.kebabCase(crumb.label)}
            // onClick={(e) => {
            // e.preventDefault()
            // console.log('Hitting')
            //todo:implement jumpzoom to coordinates
            //}}
          >
            <p>{crumb.label}</p>
            {idx !== breadcrumb.length - 1 && <ChevronRightIcon />}
          </button>
        )
      })
    } else {
      items = breadcrumb[0].label
    }

    return <span className={styles['crumbles-container-span']}>{items}</span>
  }

  const handleSelect = (event) => {
    const selections = [event.target.value]
    if (selections[0].grouping > 0) {
      selections.unshift(defaultRegionOption)
    }

    setSelectedRegion(event.target.value || defaultRegionOption)
    setBreadcrumb(selections)
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <FormControl>
        <Box className={styles['crumbles-container']}>
          {breadcrumb.length > 0 && getCrumbles()}
          <Select<RegionOption[]>
            size="small"
            aria-label={t('regions.select_region')}
            value={[selectedRegion]}
            onChange={handleSelect}
            classes={{
              root: styles['MuiSelect-root'],
              select: styles['MuiSelect-select'],
              // clearIndicator: styles['MuiAutocomplete-clearIndicator'],
              // popupIndicator: styles['MuiAutocomplete-popupIndicator'],
              // option: styles['MuiAutocomplete-option'],
              // noOptions: styles['MuiAutocomplete-noOptions'],
            }}
            // renderValue={getCrumbles}
          >
            {regionOptions.map((option) => (
              <li
                className={styles['MuiMenuItem-root']}
                key={_.kebabCase(option.label)}
                // value={option}
              >
                {option.label}
              </li>
            ))}
          </Select>
        </Box>
      </FormControl>
    </div>
  )
}
