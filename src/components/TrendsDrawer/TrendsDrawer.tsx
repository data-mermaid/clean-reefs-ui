import * as React from 'react'
import { useState } from 'react'
import { IconButton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import GraphCard from '../GraphCard/GraphCard'
import { RegionOption } from '../../types/RegionDataTypes'
import { GraphChartConfig } from '../../types/GraphDataTypes'

interface TrendsDrawerProps {
  selectedRegion: RegionOption
  graphData: GraphChartConfig[] | null
}

export default function TrendsDrawer({ selectedRegion, graphData }: TrendsDrawerProps) {
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

      <div className={styles[`graphs-container--${open ? 'open' : 'closed'}`]}>
        {graphData ? (
          graphData?.map((graph) => {
            return (
              <GraphCard
                key={graph.graphType}
                open={open}
                {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
                region={selectedRegion.regionType}
                graphData={graph}
              />
            )
          })
        ) : (
          <Typography className={styles['graph-card__no-data-label']}>
            {t('graphs.no_data_available')}
          </Typography>
        )}
      </div>
    </StyledSwipeableDrawer>
  )
}
