import { useEffect, useRef, useState } from 'react'
import { IconButton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import ChartCard from '../ChartCard/ChartCard'
import { RegionOption } from '../../types/RegionDataTypes'
import { ChartProperties, ChartSeriesName } from '../../types/ChartDataTypes'
import { tempGlobalChartSeriesData } from '../../data/tempGlobalChartSeriesData'
import { SelectedFeatureContext } from '../../contexts/SelectedFeatureContext'
import { MapGeoJSONFeature } from 'maplibre-gl'
import {
  buildChartDataFromProperties,
  updateChartData,
  updatePlumeChartData,
} from '../../utils/chartUtils'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { chartsByRegionType } from '../../data/chartSeriesData'
import { fetchBoundaryProperties } from '../../utils/pmtilesUtils'

interface TrendsDrawerProps {
  selectedRegion: RegionOption
  selectedYear: number
}

export default function TrendsDrawer({ selectedRegion, selectedYear }: TrendsDrawerProps) {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const openDrawer = () => setOpen(true)
  const closeDrawer = () => setOpen(false)
  const [chartConfigData, setChartConfigData] = useState<ChartProperties[] | null>(
    tempGlobalChartSeriesData,
  )
  const [isChartDataLoading, setIsChartDataLoading] = useState(false)

  const selectedFeature = useSelectedFeatureStore((s) => s.selectedFeature)
  const selectedPlumeWatershedStats = useSelectedFeatureStore((s) => s.selectedPlumeWatershedStats)

  // Tracks the latest fetch so earlier, slower responses don't overwrite newer ones.
  const requestIdRef = useRef(0)
  useEffect(() => {
    const { regionType, label } = selectedRegion

    if (regionType === 'global') {
      setIsChartDataLoading(false)
      setChartConfigData(tempGlobalChartSeriesData)
      return
    }

    // Watershed: selectedFeature from map click takes priority
    if (selectedFeature) {
      setIsChartDataLoading(true)
      updateChartData(selectedFeature as MapGeoJSONFeature, setChartConfigData)
      setIsChartDataLoading(false)
      return
    }

    if (selectedPlumeWatershedStats) {
      setIsChartDataLoading(false)
      updatePlumeChartData(selectedPlumeWatershedStats, setChartConfigData)
      return
    }

    // Region/country: fetch directly from PMTiles
    if (regionType === 'region' || regionType === 'country') {
      const requestId = ++requestIdRef.current
      setIsChartDataLoading(true)

      fetchBoundaryProperties(regionType, label).then((properties) => {
        if (requestId !== requestIdRef.current) {
          return
        }
        const data = properties ? buildChartDataFromProperties(properties) : null
        setChartConfigData(data)
        setIsChartDataLoading(false)
      })
      return
    }

    setIsChartDataLoading(false)
    setChartConfigData(null)
  }, [selectedFeature, selectedRegion, selectedPlumeWatershedStats])

  // When a feature is selected via map click, derive the region type from
  // its source rather than selectedRegion (which stays as the parent country).
  const effectiveRegionType =
    selectedFeature?.source === 'watershed_src' ? 'watershed' : selectedRegion.regionType
  const allowedCharts = chartsByRegionType[effectiveRegionType]
  const filteredChartData = chartConfigData?.filter((chart) =>
    allowedCharts.includes(chart.chartName as ChartSeriesName),
  )

  let drawerTitle = selectedRegion.label
  if (effectiveRegionType === 'global') {
    drawerTitle = 'global_trends'
  } else if (effectiveRegionType === 'watershed') {
    drawerTitle = 'watershed_information'
  }

  return (
    <StyledSwipeableDrawer
      anchor={isMobileWidth ? 'bottom' : 'right'}
      open={open}
      onOpen={openDrawer}
      onClose={closeDrawer}
      swipeAreaWidth={100}
    >
      <div className={styles['drawer-header']}>
        {open && <h2 style={{ marginTop: '4px' }}>{t(drawerTitle)}</h2>}
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
