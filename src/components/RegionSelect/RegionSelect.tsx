import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './RegionSelect.module.scss'
import { RegionOption } from '../../types/RegionDataTypes'
import _ from 'lodash'
import { defaultGlobalRegionOption, GLOBAL_DATA_BOUNDS, regionOptions } from '../../data/regionData'
import { mapFitBoundsDesktopConfig, mapFitBoundsMobileConfig } from '../../constants'
import useResponsive from '../../hooks/useResponsive'
import { MenuItem, Select } from '@mui/material'
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
  const { isDesktopWidth } = useResponsive()

  const prepBreadcrumb = (region: RegionOption) => {
    const selectedOptions = [region]
    if (region.grouping > 0) {
      selectedOptions.unshift(defaultGlobalRegionOption)
    }
    setBreadcrumb(selectedOptions)
  }
  const jumpToRegion = (region: RegionOption) => {
    if (!mapRef?.getMap) {
      return
    }
    const map = mapRef.getMap()

    if (region.grouping === 0) {
      const config = isDesktopWidth ? mapFitBoundsDesktopConfig : mapFitBoundsMobileConfig
      map.fitBounds(GLOBAL_DATA_BOUNDS, {
        padding: config.padding,
        maxZoom: config.maxZoom,
        duration: 800,
      })
    } else {
      map.jumpTo({
        center: region.centerCoord,
        zoom: region.zoomLevel,
        bearing: 0,
      })
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
    jumpToRegion(region)
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
  )
}
