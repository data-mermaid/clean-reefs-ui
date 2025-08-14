import * as React from 'react'
import { styled } from '@mui/material/styles'
import styles from './StyledSwipeableDrawer.module.scss'
import { DrawerProps, SwipeableDrawer } from '@mui/material'
import useResponsive from "../../hooks/useResponsive";

interface SwipeableDrawerProps {
  anchor?: DrawerProps['anchor']
  children?: React.ReactNode
  open: boolean
  onOpen: () => void
  onClose: () => void
  handleClick: () => void
  variant?: DrawerProps['variant'],
    testId?: string,
    swipeAreaWidth?: number
}

// const Puller = styled('div')(() => ({
//   width: 30,
//   height: 6,
//   backgroundColor: 'grey',
//   borderRadius: 3,
//   position: 'absolute',
//   top: 8,
//   left: 'calc(50% - 15px)',
// }))

export default function StyledSwipeableDrawer({
  anchor = 'left',
  children,
  open,
  onOpen,
  onClose,
  handleClick,
  variant = undefined,
    testId = '',
    swipeAreaWidth,
}: SwipeableDrawerProps) {
    const {isMobileWidth} = useResponsive()

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
      variant={variant}
    >
      {!open && variant === 'persistent' && isMobileWidth &&  <div className={styles['drawer-puller']}  data-testid={`${testId}-drawer-puller`}/>}
      {children}
    </SwipeableDrawer>
  )
}
