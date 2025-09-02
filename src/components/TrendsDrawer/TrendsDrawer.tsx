import { IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'
import * as React from 'react'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import GraphCard from '../GraphCard/GraphCard'
import { ChartedData } from '../../utils/updateGraph'
import { mockGraphData } from '../GraphCard/GraphCard.stories'

interface TrendsDrawerProps {
  // layersOn: LayerInfo[] //todo: show graphs available based on layers on
  lulcGraphData: ChartedData[] | null
}

export default function TrendsDrawer({ lulcGraphData }: TrendsDrawerProps) {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  return (
    <StyledSwipeableDrawer
      anchor={isMobileWidth ? 'bottom' : 'right'}
      open={open}
      onOpen={toggleDrawer}
      onClose={toggleDrawer}
      swipeAreaWidth={100}
    >
      <div className={styles['drawer-header']}>
        {open && <h2 style={{ marginTop: '4px' }}>{t('global_trends')}</h2>}
        {open && isMobileWidth && (
          <IconButton aria-label={t('buttons.close')} onClick={toggleDrawer}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} />
          </IconButton>
        )}
      </div>

      <div className={styles[`graphs-container--${open ? 'open' : 'closed'}`]}>
        {/*TODO: map out possible graphs from data list*/}
        <GraphCard
          open={open}
          {...(isMobileWidth ? { onClick: toggleDrawer } : {})}
          graphName={'graphs.land_use_historical'}
          graphData={lulcGraphData}
        />
        <GraphCard
          open={open}
          {...(isMobileWidth ? { onClick: toggleDrawer } : {})}
          graphName={'graphs.ecosystem_extent_exposed'}
          graphData={mockGraphData}
        />
        <GraphCard
          open={open}
          {...(isMobileWidth ? { onClick: toggleDrawer } : {})}
          graphName={'graphs.sediment_exposure_historical'}
          graphData={mockGraphData}
        />
      </div>
    </StyledSwipeableDrawer>
  )
}
