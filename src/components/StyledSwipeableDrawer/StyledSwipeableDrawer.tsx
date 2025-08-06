import * as React from 'react'
import styles from './StyledSwipeableDrawer.module.scss'
import { Drawer, DrawerProps } from '@mui/material'

interface SwipeableDrawerProps {
  anchor?: DrawerProps['anchor']
  children?: React.ReactNode
  open: boolean
  // onOpen: () => void
  onClose: () => void
  variant?: DrawerProps['variant']
}

export default function StyledSwipeableDrawer({
  anchor = 'left',
  children,
  open,
  // onOpen,
  onClose,
  variant = 'temporary',
}: SwipeableDrawerProps) {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      // onOpen={onOpen}
      onClose={onClose}
      variant={variant}
      classes={{
        root: styles['MuiDrawer-root'],
        paper: styles['MuiDrawer-paper'],
        modal: styles['MuiDrawer-modal'],
      }}
    >
      {children}
    </Drawer>
  )
}
