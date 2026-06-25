import { useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import styles from './TrendsDrawer.module.scss'
import ChartCard from '../ChartCard/ChartCard'
import ChartCardSkeleton from '../ChartCard/ChartCardSkeleton'
import { RegionOption } from '../../types/RegionDataTypes'
import { ChartProperties, ChartSeriesName } from '../../types/ChartDataTypes'
import { tempGlobalChartSeriesData } from '../../data/tempGlobalChartSeriesData'
import { SelectedFeatureContext } from '../../contexts/SelectedFeatureContext'
import { MapGeoJSONFeature } from 'maplibre-gl'

import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { chartsByRegionType } from '../../data/chartSeriesData'
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
}

export default function TrendsDrawer({
  selectedRegion,
  selectedYear,
  open,
}: TrendsDrawerProps) {
  const { t } = useTranslation()
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
  // Enforces a minimum 500ms skeleton display so the user sees the transition.
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (skeletonTimerRef.current) {clearTimeout(skeletonTimerRef.current)}
    }
  }, [])

  const stopLoading = () => {
    if (skeletonTimerRef.current) {clearTimeout(skeletonTimerRef.current)}
    skeletonTimerRef.current = setTimeout(() => setIsChartDataLoading(false), 500)
  }

  useEffect(() => {
    setIsChartDataLoading(true)
    const { regionType } = selectedRegion

    if (selectedDispersalWatershedStats) {
      updateDispersalChartData(selectedDispersalWatershedStats, setChartConfigData)
      stopLoading()
      return
    }

    if (regionType === 'global') {
      setChartConfigData(tempGlobalChartSeriesData)
      stopLoading()
      return
    }

    // Watershed: selectedFeature from map click takes priority
    if (selectedFeature) {
      updateChartData(selectedFeature as MapGeoJSONFeature, setChartConfigData)
      stopLoading()
      return
    }

    // Region/country: fetch directly from PMTiles
    if (regionType === 'region' || regionType === 'country') {
      const { bandId } = selectedRegion
      if (bandId == null) {
        setChartConfigData(null)
        stopLoading()
        return
      }

      const requestId = ++requestIdRef.current

      fetchBoundaryProperties(regionType, bandId).then((properties) => {
        if (requestId !== requestIdRef.current) {
          return
        }
        setChartConfigData(properties ? buildChartDataFromProperties(properties) : null)
        stopLoading()
      })
      return
    }

    setChartConfigData(null)
    stopLoading()
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
    <section
      className={clsx(styles['trends-panel'], !open && styles['trends-panel--hidden'])}
      aria-label={t(drawerTitle)}
      aria-hidden={!open}
    >
      <div className={styles['trends-panel__content']}>
        <div className={styles['panel-header']}>
          <h2>{t(drawerTitle)}</h2>
        </div>

        <div className={styles['charts-container']}>
          {isChartDataLoading ? (
            <>
              <ChartCardSkeleton />
              <ChartCardSkeleton />
            </>
          ) : filteredChartData?.length ? (
            filteredChartData.map((chart) => (
              <SelectedFeatureContext.Provider
                key={chart.chartName}
                value={selectedFeature as MapGeoJSONFeature}
              >
                <ChartCard
                  regionType={effectiveRegionType}
                  regionLabel={getRegionLabel(
                    effectiveRegionType,
                    selectedRegion,
                    selectedFeature as MapGeoJSONFeature | null,
                  )}
                  selectedYear={selectedYear}
                  chartConfigData={chart}
                  isChartDataLoading={isChartDataLoading}
                  isVisible={open}
                />
              </SelectedFeatureContext.Provider>
            ))
          ) : (
            <Typography className={styles['no-data-label']}>
              {t('charts.no_data_available')}
            </Typography>
          )}
        </div>
      </div>
    </section>
  )
}
