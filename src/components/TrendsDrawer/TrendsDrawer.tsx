import { Card, IconButton, SwipeableDrawer } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Plot from 'react-plotly.js'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import { styled } from '@mui/material/styles'
import * as React from 'react'
import useResponsive from '../../hooks/useResponsive'

const mockGraphData = [
  {
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar',
  },
]

const Puller = styled('div')(() => ({
  width: 106,
  height: 6,
  backgroundColor: 'grey',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 53px)',
}))

export default function TrendsDrawer() {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const GraphCard = (graphName: string) => (
    <Card onClick={open ? () => {} : toggleDrawer} className={styles['graph-card']}>
      {!open && graphName}
      {open && (
        <Plot
          data={mockGraphData}
          className={styles['graph-plots']}
          layout={{ title: { text: t(graphName) } }}
        />
      )}
    </Card>
  )

  return (
    <SwipeableDrawer
      anchor={isMobileWidth ? 'bottom' : 'right'}
      open={open}
      onOpen={() => {}}
      onClose={() => {}}
      swipeAreaWidth={100}
      variant={isMobileWidth ? 'persistent' : 'permanent'}
      disableSwipeToOpen={false}
      classes={{
        root: styles['MuiDrawer-root'],
        paper: `${styles['MuiDrawer-paper']} ${open ? styles['open-drawer'] : styles['closed-drawer']}`,
        modal: styles['MuiDrawer-modal'],
        anchorRight: styles['MuiDrawer-anchorRight'],
        paperAnchorBottom: styles['MuiDrawer-paperAnchorBottom'],
        paperAnchorRight: styles['MuiDrawer-paperAnchorRight'],
        paperAnchorDockedBottom: styles['MuiDrawer-paperAnchorDockedBottom'],
      }}
    >
      <div className={styles['drawer-tab']}>
        {!open && isMobileWidth && <Puller onClick={toggleDrawer} />}
        <h2 style={{ marginTop: open ? '4px' : '0' }}>{t('global_trends')}</h2>
        {open && isMobileWidth && (
          <IconButton aria-label={t('buttons.close')}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} onClick={toggleDrawer} />
          </IconButton>
        )}
      </div>

      <div className={styles['graphs-container']}>
        {/*  Temporary components */}
        {GraphCard('graphs.land_use_historical')}
        {GraphCard('graphs.ecosystem_extent_exposed')}
        {GraphCard('graphs.sediment_exposure_historical')}
        {/*  Temporary components */}
      </div>
    </SwipeableDrawer>
  )
}
