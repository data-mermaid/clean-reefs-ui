import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LoadingState.module.scss'

interface LoadingStateProps {
  isOverlay: boolean
  height?: number
}

export default function LoadingState({ isOverlay, height = 200 }: LoadingStateProps) {
  const { t } = useTranslation()

  return (
    <div
      style={{
        ...(isOverlay && { height: `${height}px`, paddingTop: height / 2 }),
      }}
      className={isOverlay ? styles['LoadingState--overlay'] : styles['LoadingState--root']}
    >
      <Typography style={{ textAlign: 'center' }}>{t('loading')}...</Typography>
      <CircularProgress className={styles['CircularProgress--root']} />
    </div>
  )
}
