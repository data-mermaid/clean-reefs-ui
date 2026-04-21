import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { RegionOption } from '../../types/RegionDataTypes'
import _ from 'lodash'
import { defaultGlobalRegionOption, regionGroups, regionOptions } from '../../data/regionData'
import { ListSubheader, MenuItem, Select } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import { useMapStore } from '../../stores/mapStore'

const getRegionById = (regionId: string) => regionOptions.find((opt) => opt.id === regionId)

interface RegionSelectProps {
  breadcrumb: RegionOption[]
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  selectedRegion: RegionOption
  onRegionChange: (region: RegionOption) => void
}

export default function RegionSelect({
  breadcrumb,
  setBreadcrumb,
  selectedRegion,
  onRegionChange,
}: RegionSelectProps) {
  const { t } = useTranslation()
  const mapRef = useMapStore((s) => s.mapReference)

  const prepBreadcrumb = (region: RegionOption) => {
    const selectedOptions = [region]
    if (region.regionType !== 'global') {
      selectedOptions.unshift(defaultGlobalRegionOption)
    }
    setBreadcrumb(selectedOptions)
  }
  const jumpToRegion = (region: RegionOption) => {
    // no jump on global click
    if (region.regionType !== 'global') {
      if (mapRef && mapRef.getMap) {
        mapRef.getMap().jumpTo({
          center: region.centerCoord,
          zoom: region.zoomLevel,
          bearing: 0,
        })
      }
    }
  }

  const getBreadcrumbs = () => {
    let items
    if (breadcrumb.length > 0) {
      items = breadcrumb.map((crumb, idx) => {
        const isNotLastBreadcrumb = idx !== breadcrumb.length - 1
        return (
          <span key={_.kebabCase(crumb.label)} className={styles['breadcrumb']}>
            <button
              value={crumb.id}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                if (isNotLastBreadcrumb) {
                  updateRegion(crumb)
                }
              }}
            >
              <span className={isNotLastBreadcrumb ? styles['mobile-ellipses'] : ''}>
                {crumb.label}
              </span>
            </button>
            {isNotLastBreadcrumb && <ChevronRightIcon />}
          </span>
        )
      })
    }

    return <span className={styles['breadcrumbs-container']}>{items}</span>
  }

  const handleSelect = (event) => {
    const selectedOption = getRegionById(event.target?.value) || defaultGlobalRegionOption
    updateRegion(selectedOption)
  }

  const updateRegion = (region: RegionOption) => {
    if (region.regionType !== 'global') {
      jumpToRegion(region)
    }
    onRegionChange(region)
    prepBreadcrumb(region)
  }

  return (
    <Box className={styles['RegionSelect-root']}>
      {breadcrumb.length > 0 && getBreadcrumbs()}
      <Select<string>
        size="small"
        aria-label={t('regions.select_region')}
        value={selectedRegion.id}
        onChange={handleSelect}
        renderValue={() => ''}
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
        }}
      >
        {/* For each group, emit a header followed by its options as menu items.
            flatMap keeps them as direct children of <Select> (required by MUI). */}
        {regionGroups.flatMap(({ type, label }) => [
          <ListSubheader key={`group-${type}`} className={styles['group-header']}>
            {label}
          </ListSubheader>,
          ...regionOptions
            .filter((opt) => opt.regionType === type)
            .map((option) => (
              <MenuItem
                className={styles['MuiMenuItem-root']}
                key={_.kebabCase(option.label)}
                value={option.id}
              >
                {option.label}
              </MenuItem>
            )),
        ])}
      </Select>
    </Box>
  )
}
