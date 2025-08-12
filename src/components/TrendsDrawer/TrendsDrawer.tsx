import { Card, IconButton, SwipeableDrawer } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Plot from 'react-plotly.js'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import { styled } from '@mui/material/styles'
import * as React from 'react'

const graphData = [
  {
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    type: 'bar',
    title: { text: 'graphs.contributing_watersheds' },
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
  const [open, setOpen] = useState(false)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const GraphPlaceholder = (graphName: string) => (
    <Card
      onClick={open ? () => {} : toggleDrawer}
      className={styles['graph-card']}
      style={{
        display: open ? 'block' : 'inline-block',
        float: open ? 'none' : 'left',
        width: open ? '' : '300px',
        height: open ? 'auto' : '55px',
        backgroundColor: '#FAFBFC', //TODO
        margin: open ? '0 0 10px 0' : '0 10px 0 0',
        padding: '10px',
      }}
    >
      {!open && graphName}
      {open && (
        <Plot
          data={graphData}
          layout={{ margin: '0 auto', width: '350', title: { text: graphName } }}
        />
      )}
    </Card>
  )

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onOpen={() => {}}
      onClose={() => {}}
      swipeAreaWidth={100}
      variant="persistent"
      disableSwipeToOpen={false}
      keepMounted
      classes={{
        root: styles['MuiDrawer-root'],
        paper: `${styles['MuiDrawer-paper']} ${open && styles['open-drawer']}`,
        modal: styles['MuiDrawer-modal'],
        paperAnchorBottom: styles['MuiDrawer-paperAnchorBottom'],
        paperAnchorDockedBottom: styles['MuiDrawer-paperAnchorDockedBottom'],
      }}
    >
      <div className={styles['drawer-tab']}>
        {!open && <Puller onClick={toggleDrawer} />}
        <h2 style={{ marginTop: open ? '4px' : '0' }}>{t('global_trends')}</h2>
        {open && (
          <IconButton aria-label={t('buttons.close')}>
            <CloseIcon sx={{ fontSize: '35px', lineHeight: 1 }} onClick={toggleDrawer} />
          </IconButton>
        )}
      </div>

      {/*<div*/}
      {/*  style={{*/}
      {/*      // position:'relative',*/}
      {/*      overflow: 'scroll',*/}
      {/*    // overflowX: open ? 'hidden' : 'scroll',*/}
      {/*    // overflowY: open ? 'scroll' : 'hidden',*/}
      {/*      marginTop: '30px',*/}
      {/*      border: '1px solid blue',*/}
      {/*    // marginLeft: open ? '5px' : 'inherit',*/}
      {/*    width: open ? '100%' : 'max-content',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {GraphPlaceholder('Ecosystem extent exposed')}*/}
      {/*  {GraphPlaceholder('Land use through time')}*/}
      {/*  {GraphPlaceholder('Ecosystem')}*/}
      {/*  {GraphPlaceholder('extent exposed')}*/}
      {/*</div>*/}
    </SwipeableDrawer>
  )
}
