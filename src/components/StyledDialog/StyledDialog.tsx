import * as React from 'react'

import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import type { DialogProps } from '@mui/material'

interface StyledDialogProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
  maxWidth?: DialogProps['maxWidth']
  fullWidth?: boolean
}

export default function StyledDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}: StyledDialogProps) {
  const titleId = React.useId()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
