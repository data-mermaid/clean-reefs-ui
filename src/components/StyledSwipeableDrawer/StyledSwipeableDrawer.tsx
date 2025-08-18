import * as React from 'react'
import styles from './StyledSwipeableDrawer.module.scss'
import { DrawerProps, SwipeableDrawer } from '@mui/material'
import useResponsive from '../../hooks/useResponsive'

interface SwipeableDrawerProps {
  anchor?: DrawerProps['anchor']
  children?: React.ReactNode
  open: boolean
  onOpen: () => void
  onClose: () => void
  testId?: string
  swipeAreaWidth?: number
}

export default function StyledSwipeableDrawer({
  anchor = 'left',
  children,
  open,
  onOpen,
  onClose,
  testId = '',
  swipeAreaWidth,
}: SwipeableDrawerProps) {
  const { isMobileWidth } = useResponsive()

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      swipeAreaWidth={swipeAreaWidth}
      classes={{
        root: styles['MuiDrawer-root'],
        paper: `${styles['MuiDrawer-paper']} ${open ? styles['open-drawer'] : styles['closed-drawer']}`,
        paperAnchorBottom: styles['MuiDrawer-paperAnchorBottom'],
        paperAnchorDockedBottom: styles['MuiDrawer-paperAnchorDockedBottom'],
        anchorLeft: styles['MuiDrawer-anchorLeft'],
        modal: styles['MuiDrawer-modal'],
        anchorRight: styles['MuiDrawer-anchorRight'],
        paperAnchorRight: styles['MuiDrawer-paperAnchorRight'],
      }}
      allowSwipeInChildren
    >
      {!open && isMobileWidth && (
        <div className={styles['drawer-puller']} data-testid={`${testId}-drawer-puller`} />
      )}
      {children}
    </SwipeableDrawer>
  )
}
