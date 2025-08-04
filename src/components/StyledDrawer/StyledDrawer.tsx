import { Drawer } from '@mui/material'
import { ReactElement } from 'react'
import styles from './StyledDrawer.module.scss'

interface StyledDrawerProps {
  anchor?: 'bottom' | 'top' | 'left' | 'right'
  children: ReactElement
}

export default function StyledDrawer({ anchor = 'bottom', children }: StyledDrawerProps) {
  return (
    <Drawer
      anchor={anchor}
      open
      variant="persistent"
      classes={{
        root: styles['MuiDrawer-root'],
        paper: styles['MuiDrawer-paper'],
      }}
    >
      {children}
    </Drawer>
  )
}
