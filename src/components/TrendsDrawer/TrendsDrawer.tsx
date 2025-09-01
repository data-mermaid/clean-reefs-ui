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

const mockGraphData = [
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [14, 23, 17, 10, 4],
    name: 'Bare Ground',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'Shrub',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'Surface water',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [3, 8, 10, 15, 17],
    name: 'Built-up',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'High canopy forest',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'Cropland',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'Mixed forest',
    type: 'bar',
    width: 3,
  },
]

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
        <h2 style={{ marginTop: open ? '4px' : '0' }}>{t('global_trends')}</h2>
        {open && isMobileWidth && (
          <IconButton aria-label={t('buttons.close')} onClick={toggleDrawer}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} />
          </IconButton>
        )}
      </div>

      <div className={styles[`graphs-container--${open ? 'open' : 'closed'}`]}>
        {/*TODO: produce graphcards from mapping out possible graphs*/}
        <GraphCard graphName={'graphs.land_use_historical'} graphData={lulcGraphData} />
        {/*<GraphCard graphName={'graphs.ecosystem_extent_exposed'} graphData={mockGraphData} />*/}
        {/*<GraphCard graphName={'graphs.sediment_exposure_historical'} graphData={mockGraphData} />*/}
      </div>
    </StyledSwipeableDrawer>
  )
}
