import { Card, IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Plot from 'react-plotly.js'
import * as React from 'react'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'

export default function TrendsDrawer() {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  // Temporary component
  const mockGraphData = [
    {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [20, 14, 23],
      type: 'bar',
    },
  ]
  const GraphCard = (graphName: string) => (
    <Card onClick={open ? () => {} : toggleDrawer} className={styles['graph-card']}>
      {!open ? (
        t(graphName)
      ) : (
        <Plot
          data={mockGraphData}
          className={styles['graph-plots']}
          layout={{ title: { text: t(graphName) } }}
        />
      )}
    </Card>
  )
  //End temporary component

  return (
    <StyledSwipeableDrawer
      anchor={isMobileWidth ? 'bottom' : 'right'}
      open={open}
      onOpen={() => {}}
      onClose={() => {}}
      handleClick={toggleDrawer}
      swipeAreaWidth={100}
      variant={isMobileWidth ? 'persistent' : 'permanent'}
    >
      <div className={styles['drawer-header']}>
        <h2 style={{ marginTop: open ? '4px' : '0' }}>{t('global_trends')}</h2>
        {open && isMobileWidth && (
          <IconButton aria-label={t('buttons.close')}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} onClick={toggleDrawer} />
          </IconButton>
        )}
      </div>

      <div className={styles[`graphs-container--${open ? 'open' : 'closed'}`]}>
        {/*  Temporary components */}
        {GraphCard('graphs.land_use_historical')}
        {GraphCard('graphs.ecosystem_extent_exposed')}
        {GraphCard('graphs.ecosystem_extent_exposed')}
        {GraphCard('graphs.ecosystem_extent_exposed')}
        {GraphCard('graphs.sediment_exposure_historical')}
        {/*  Temporary components */}
      </div>
    </StyledSwipeableDrawer>
  )
}
