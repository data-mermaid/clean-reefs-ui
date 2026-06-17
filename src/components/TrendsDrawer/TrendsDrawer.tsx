import { useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import clsx from 'clsx'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import { getUpOneLevelLabel } from '../../utils/chartUtils'
import { useTranslation } from 'react-i18next'
import UpOneLevelIcon from '../../assets/up-one-level.svg'
import styles from './TrendsDrawer.module.scss'
import ChartCard from '../ChartCard/ChartCard'
import { RegionOption, RegionType } from '../../types/RegionDataTypes'
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
  onUpOneLevelChange: (regionType: RegionType) => void
}

export default function TrendsDrawer({
  selectedRegion,
  selectedYear,
  open,
  onUpOneLevelChange,
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
    <section
      className={clsx(styles['trends-panel'], !open && styles['trends-panel--hidden'])}
      aria-label={t(drawerTitle)}
      aria-hidden={!open}
    >
      <div className={styles['panel-header']}>
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

      <div className={styles['charts-container']}>
        {filteredChartData?.length ? (
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
              />
            </SelectedFeatureContext.Provider>
          ))
        ) : (
          <Typography className={styles['no-data-label']}>
            {t('charts.no_data_available')}
          </Typography>
        )}
      </div>
    </section>
  )
}
