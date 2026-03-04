import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { RegionOption } from '../../types/RegionDataTypes'
import _ from 'lodash'
import { defaultRegionOption, regionOptions } from '../../data/regionData'
import { MenuItem, Select } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import { useMapStore } from '../../stores/mapStore'

const getRegionById = (regionId) => regionOptions.find((opt) => opt.id === regionId)

interface RegionSelectProps {
  breadcrumb: RegionOption[]
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
}

export default function RegionSelect({
  breadcrumb,
  setBreadcrumb,
  selectedRegion,
  setSelectedRegion,
}: RegionSelectProps) {
  const { t } = useTranslation()
  const mapRef = useMapStore((s) => s.mapReference)

  const prepCrumbles = (crumb) => {
    const selectedOptions = [crumb]
    if (crumb.grouping > 0) {
      selectedOptions.unshift(defaultRegionOption)
    }
    setBreadcrumb(selectedOptions)
  }

  const getCrumbles = () => {
    let items
    if (breadcrumb.length > 0) {
      items = breadcrumb.map((crumb, idx) => {
        return (
          <button
            className={styles['crumb-item']}
            key={_.kebabCase(crumb.label)}
            value={crumb.id}
            onClick={(e) => {
              e.preventDefault()
              if (mapRef && mapRef.getMap) {
                mapRef.getMap().jumpTo({
                  center: crumb.centerCoord,
                  zoom: crumb.zoomLevel,
                  bearing: 0,
                })
              }
              setSelectedRegion(crumb)
              prepCrumbles(crumb)
            }}
          >
            {idx !== breadcrumb.length - 1 ? (
              <span className={styles['mobile-ellipses']}>
                {crumb.label}
                <ChevronRightIcon />
              </span>
            ) : (
              crumb.label
            )}
          </button>
        )
      })
    } else {
      items = breadcrumb[0].label
    }

    return <span className={styles['crumbles-container-span']}>{items}</span>
  }

  const handleSelect = (event) => {
    const selectedId = event.target.value
    const selectedOption = getRegionById(selectedId) || defaultRegionOption

    // no jump on global click
    if (selectedOption.grouping > 0) {
      if (mapRef && mapRef.getMap) {
        mapRef.getMap().jumpTo({
          center: selectedOption.centerCoord,
          zoom: selectedOption.zoomLevel,
          bearing: 0,
        })
      }
    }
    setSelectedRegion(selectedOption)
    prepCrumbles(selectedOption)
  }

  return (
    <div className={styles['RegionSelect-root']}>
      <Box className={styles['crumbles-container']}>
        {breadcrumb.length > 0 && getCrumbles()}
        <Select<RegionOption[]>
          size="small"
          aria-label={t('regions.select_region')}
          value={[selectedRegion]}
          onChange={handleSelect}
          variant="outlined"
          MenuProps={{
            classes: {
              paper: styles['MuiPaper-root'],
              list: styles['MuiList-root'],
            },
          }}
          classes={{
            root: styles['MuiSelect-root'],
            select: styles['MuiSelect-select'],
            icon: styles['MuiSelect-icon'],
            outlined: styles['MuiSelect-standard'],
          }}
        >
          {regionOptions.map((option) => {
            return (
              option.grouping <= 2 && (
                <MenuItem
                  className={styles['MuiMenuItem-root']}
                  key={_.kebabCase(option.label)}
                  value={option.id}
                >
                  {option.label}
                </MenuItem>
              )
            )
          })}
        </Select>
      </Box>
    </div>
  )
}
