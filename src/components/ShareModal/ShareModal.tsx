import * as React from 'react'

import { Box, Button, TextField, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'

import StyledDialog from '../StyledDialog/StyledDialog'
import styles from './ShareModal.module.scss'

interface ShareModalProps {
  open: boolean
  onClose: () => void
}

type CopyStatus = 'idle' | 'copied' | 'error'

const COPIED_FEEDBACK_DURATION_MS = 2000

export default function ShareModal({ open, onClose }: ShareModalProps) {
  const { t } = useTranslation()
  const [url, setUrl] = React.useState('')
  const [status, setStatus] = React.useState<CopyStatus>('idle')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const timerRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    if (open) {
      setUrl(window.location.href)
      setStatus('idle')
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const flashStatus = (next: CopyStatus) => {
    setStatus(next)
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_DURATION_MS)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      flashStatus('copied')
    } catch (error) {
      console.error('Failed to copy URL', error)
      inputRef.current?.select()
      flashStatus('error')
    }
  }

  const statusMessage =
    status === 'copied'
      ? t('share_view.copied')
      : status === 'error'
        ? t('share_view.copy_failed')
        : ''

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      title={t('share_view.title')}
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
          inputRef={inputRef}
          slotProps={{ input: { readOnly: true } }}
        />
        <Button onClick={handleCopy} variant="contained" startIcon={<ContentCopyIcon />}>
          {status === 'copied' ? t('share_view.copied') : t('buttons.copy')}
        </Button>
      </Box>
      {status === 'error' && (
        <Typography variant="body2" color="error" className={styles['error-message']}>
          {statusMessage}
        </Typography>
      )}
      <Box role="status" aria-live="polite" className={styles['visually-hidden']}>
        {statusMessage}
      </Box>
    </StyledDialog>
  )
}
