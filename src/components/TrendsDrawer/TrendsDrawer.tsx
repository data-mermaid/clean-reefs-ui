import * as React from 'react'
import { useState } from 'react'
import { IconButton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import ChartCard from '../ChartCard/ChartCard'
import { RegionOption } from '../../types/RegionDataTypes'
import { ChartConfig } from '../../types/ChartDataTypes'

interface TrendsDrawerProps {
  selectedRegion: RegionOption
  chartConfigData: ChartConfig[] | null
}

export default function TrendsDrawer({ selectedRegion, chartConfigData }: TrendsDrawerProps) {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const openDrawer = () => setOpen(true)
  const closeDrawer = () => setOpen(false)

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
              <ChartCard
                key={chart.chartSeriesName}
                open={open}
                {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
                region={selectedRegion.regionType}
                chartConfigData={chart}
              />
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
