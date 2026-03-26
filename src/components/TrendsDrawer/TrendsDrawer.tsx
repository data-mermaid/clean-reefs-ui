import { useEffect, useState } from 'react'
import { IconButton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import ChartCard from '../ChartCard/ChartCard'
import { RegionOption } from '../../types/RegionDataTypes'
import { ChartProperties } from '../../types/ChartDataTypes'
import { tempGlobalChartSeriesData } from '../../data/tempGlobalChartSeriesData'
import { SelectedFeatureContext } from '../../contexts/SelectedFeatureContext'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { updateChartData } from '../../utils/chartUtils'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'

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

  useEffect(() => {
    if (selectedRegion.regionType === 'global') {
      setIsChartDataLoading(false)
      setChartConfigData(tempGlobalChartSeriesData)
      return
    }

    if (!selectedFeature) {
      setIsChartDataLoading(false)
      setChartConfigData(null)
      return
    }

    setIsChartDataLoading(true)
    updateChartData(selectedFeature as MapGeoJSONFeature, setChartConfigData)
    setIsChartDataLoading(false)
  }, [selectedFeature, selectedRegion.regionType])

  let drawerTitle = selectedRegion.label
  if (selectedRegion.regionType === 'global') {
    drawerTitle = 'global_trends'
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
        {chartConfigData ? (
          chartConfigData?.map((chart) => {
            return (
              <SelectedFeatureContext.Provider
                key={chart.chartName}
                value={selectedFeature as MapGeoJSONFeature}
              >
                <ChartCard
                  key={chart.chartName}
                  open={open}
                  {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
                  regionType={selectedRegion.regionType}
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
