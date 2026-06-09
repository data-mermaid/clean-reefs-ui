import { useEffect, useRef, useState } from 'react'
import { IconButton, Typography } from '@mui/material'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import { getUpOneLevelLabel } from '../../utils/chartUtils'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import UpOneLevelIcon from '../../assets/up-one-level.svg'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import ChartCard from '../ChartCard/ChartCard'
import { RegionOption, RegionType } from '../../types/RegionDataTypes'
import { ChartProperties, ChartSeriesName } from '../../types/ChartDataTypes'
import { tempGlobalChartSeriesData } from '../../data/tempGlobalChartSeriesData'
import { SelectedFeatureContext } from '../../contexts/SelectedFeatureContext'
import { MapGeoJSONFeature } from 'maplibre-gl'

import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { chartsByRegionType } from '../../data/chartSeriesData'
import { TRENDS_DRAWER_PEEK_HEIGHT } from '../../constants'
import { fetchBoundaryProperties } from '../../utils/pmtilesUtils'
import {
  buildChartDataFromProperties,
  getDrawerTitle,
  getEffectiveRegionType,
  getRegionLabel,
  updateChartData,
  updateDispersalChartData,
} from '../../utils/chartUtils'

interface TrendsDrawerProps {
  selectedRegion: RegionOption
  selectedYear: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpOneLevelChange: (regionType: RegionType) => void
}

export default function TrendsDrawer({
  selectedRegion,
  selectedYear,
  open,
  onOpenChange,
  onUpOneLevelChange,
}: TrendsDrawerProps) {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const openDrawer = () => onOpenChange(true)
  const closeDrawer = () => onOpenChange(false)
  const [chartConfigData, setChartConfigData] = useState<ChartProperties[] | null>(
    tempGlobalChartSeriesData,
  )
  const [isChartDataLoading, setIsChartDataLoading] = useState(false)

  const selectedFeature = useSelectedFeatureStore((s) => s.selectedFeature)
  const selectedDispersalWatershedStats = useSelectedFeatureStore(
    (s) => s.selectedDispersalWatershedStats,
  )

  // Tracks the latest fetch so earlier, slower responses don't overwrite newer ones.
  const requestIdRef = useRef(0)
  useEffect(() => {
    setIsChartDataLoading(true)
    const { regionType } = selectedRegion

    if (selectedDispersalWatershedStats) {
      updateDispersalChartData(selectedDispersalWatershedStats, setChartConfigData)
      setIsChartDataLoading(false)
      return
    }

    if (regionType === 'global') {
      setChartConfigData(tempGlobalChartSeriesData)
      setIsChartDataLoading(false)
      return
    }

    // Watershed: selectedFeature from map click takes priority
    if (selectedFeature) {
      updateChartData(selectedFeature as MapGeoJSONFeature, setChartConfigData)
      setIsChartDataLoading(false)
      return
    }

    // Region/country: fetch directly from PMTiles
    if (regionType === 'region' || regionType === 'country') {
      const { bandId } = selectedRegion
      if (bandId == null) {
        setChartConfigData(null)
        setIsChartDataLoading(false)
        return
      }

      const requestId = ++requestIdRef.current

      fetchBoundaryProperties(regionType, bandId).then((properties) => {
        if (requestId !== requestIdRef.current) {
          return
        }
        const data = properties ? buildChartDataFromProperties(properties) : null
        setChartConfigData(data)
        setIsChartDataLoading(false)
      })
      return
    }

    setChartConfigData(null)
    setIsChartDataLoading(false)
  }, [selectedFeature, selectedRegion, selectedDispersalWatershedStats])

  // When a feature is selected via map click, derive the region type from
  // its source rather than selectedRegion (which stays as the parent country).
  const effectiveRegionType = getEffectiveRegionType(
    selectedDispersalWatershedStats,
    selectedFeature?.source,
    selectedRegion.regionType,
  )

  const drawerTitle = getDrawerTitle(effectiveRegionType, selectedRegion.label)
  const allowedCharts = chartsByRegionType[effectiveRegionType]
  const filteredChartData = chartConfigData?.filter((chart) =>
    allowedCharts.includes(chart.chartName as ChartSeriesName),
  )

  return (
    <StyledSwipeableDrawer
      anchor={isMobileWidth ? 'bottom' : 'right'}
      open={open}
      onOpen={openDrawer}
      onClose={closeDrawer}
      swipeAreaWidth={TRENDS_DRAWER_PEEK_HEIGHT}
    >
      <div className={styles['drawer-header']}>
        {open && (
          <div className={styles['drawer-header__title']}>
            {effectiveRegionType !== 'global' && (
              <StyledIconButtonWithTooltip
                aria-label={t('buttons.up_one_level')}
                tooltipText={getUpOneLevelLabel(effectiveRegionType, selectedRegion)}
                tooltipPlacement="top"
                onClick={() => onUpOneLevelChange(effectiveRegionType)}
              >
                <img src={UpOneLevelIcon} alt="" />
              </StyledIconButtonWithTooltip>
            )}
            <h2>{t(drawerTitle)}</h2>
          </div>
        )}
        {open && isMobileWidth && (
          <IconButton aria-label={t('buttons.close')} onClick={closeDrawer}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} />
          </IconButton>
        )}
      </div>

      <div className={styles[`charts-container--${open ? 'open' : 'closed'}`]}>
        {filteredChartData?.length ? (
          filteredChartData.map((chart) => {
            return (
              <SelectedFeatureContext.Provider
                key={chart.chartName}
                value={selectedFeature as MapGeoJSONFeature}
              >
                <ChartCard
                  key={chart.chartName}
                  open={open}
                  {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
                  regionType={effectiveRegionType}
                  regionLabel={getRegionLabel(
                    effectiveRegionType,
                    selectedRegion,
                    selectedFeature as MapGeoJSONFeature | null,
                  )}
                  selectedYear={selectedYear}
                  chartConfigData={chart}
                  isChartDataLoading={isChartDataLoading}
                />
              </SelectedFeatureContext.Provider>
            )
          })
        ) : (
          <Typography className={styles['chart-card__no-data-label']}>
            {t('charts.no_data_available')}
          </Typography>
        )}
      </div>
    </StyledSwipeableDrawer>
  )
}
