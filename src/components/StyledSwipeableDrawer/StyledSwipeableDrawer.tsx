import * as React from 'react'
import { styled } from '@mui/material/styles'
import styles from './StyledSwipeableDrawer.module.scss'
import { DrawerProps, SwipeableDrawer } from '@mui/material'

interface SwipeableDrawerProps {
  anchor?: DrawerProps['anchor']
  children?: React.ReactNode
  open: boolean
  onOpen: () => void
  onClose: () => void
  handleClick: () => void
  variant?: DrawerProps['variant']
}

const Puller = styled('div')(() => ({
  width: 30,
  height: 6,
  backgroundColor: 'grey',
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}))

export default function StyledSwipeableDrawer({
  anchor = 'left',
  children,
  open,
  onOpen,
  onClose,
  handleClick,
  variant = undefined,
}: SwipeableDrawerProps) {
  const swipeArea = 100
  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      // swipeAreaWidth={swipeArea}
      classes={{
        root: styles['MuiDrawer-root'],
        paper: styles['MuiDrawer-paper'],
        modal: styles['MuiDrawer-modal'],
        paperAnchorBottom: styles['MuiDrawer-paperAnchorBottom'],
        paperAnchorDockedBottom: styles['MuiDrawer-paperAnchorDockedBottom'],
        anchorLeft: styles['MuiDrawer-anchorLeft'],
      }}
      allowSwipeInChildren
      variant={variant}
    >
      {variant === 'persistent' && <Puller onClick={handleClick} />}
      {children}
    </SwipeableDrawer>
  )
}
