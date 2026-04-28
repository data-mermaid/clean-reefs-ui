import * as React from 'react'

import { Box, Button, TextField } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'

import StyledDialog from '../StyledDialog/StyledDialog'
import styles from './ShareModal.module.scss'

interface ShareModalProps {
  open: boolean
  onClose: () => void
}

const COPIED_FEEDBACK_DURATION_MS = 2000

export default function ShareModal({ open, onClose }: ShareModalProps) {
  const { t } = useTranslation()
  const [url, setUrl] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    if (open) {
      setUrl(window.location.href)
      setCopied(false)
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_DURATION_MS)
    } catch (error) {
      console.error('Failed to copy URL', error)
    }
  }

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      title={t('share_view_title')}
      actions={
        <Button onClick={onClose} variant="outlined">
          {t('buttons.close')}
        </Button>
      }
    >
      <Box className={styles['url-row']}>
        <TextField
          value={url}
          fullWidth
          onFocus={(e) => e.currentTarget.select()}
          onMouseUp={(e) => e.preventDefault()}
          slotProps={{ input: { readOnly: true } }}
        />
        <Button onClick={handleCopy} variant="contained" startIcon={<ContentCopyIcon />}>
          {copied ? t('buttons.copied') : t('buttons.copy')}
        </Button>
      </Box>
    </StyledDialog>
  )
}
