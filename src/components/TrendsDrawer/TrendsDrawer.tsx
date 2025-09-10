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
import { RegionOption } from '../../types/RegionDataTypes'
import mockOutputGraphData from '../../tests/mockOutputGraphData.json'

interface TrendsDrawerProps {
  // layerIdsOn: [] //todo: show graphs available based on layers on
  selectedRegion: RegionOption
  lulcGraphData: ChartedData[] | null
}

export default function TrendsDrawer({ selectedRegion, lulcGraphData }: TrendsDrawerProps) {
  const { t } = useTranslation()
  const { isMobileWidth } = useResponsive()
  const [open, setOpen] = useState(!isMobileWidth)
  const openDrawer = () => setOpen(true)
  const closeDrawer = () => setOpen(false)

  let drawerTitle
  if (selectedRegion.regionType === 'global') {
    drawerTitle = 'global_trends'
    // } else if (layerIdsOn.includes('watershed') {
    //   drawerTitle = selectedRegion.label
  } else {
    drawerTitle = selectedRegion.label
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
        {/*TODO: map out possible graphs from data list*/}
        <GraphCard
          open={open}
          {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
          graphName={'graphs.land_use_historical'}
          region={selectedRegion.regionType}
          graphData={lulcGraphData}
        />
        <GraphCard
          open={open}
          {...(isMobileWidth && !open ? { onClick: openDrawer } : {})}
          graphName={'graphs.sediment_exposure_historical'}
          region={selectedRegion.regionType}
          graphData={mockOutputGraphData as ChartedData[]}
        />
      </div>
    </StyledSwipeableDrawer>
  )
}
