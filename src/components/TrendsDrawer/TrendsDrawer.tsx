import { IconButton } from '@mui/material'
import { useTranslation } from 'react-i18next'

import * as React from 'react'
import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import styles from './TrendsDrawer.module.scss'
import useResponsive from '../../hooks/useResponsive'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import GraphCard from '../GraphCard/GraphCard'

export default function TrendsDrawer() {
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
