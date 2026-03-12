import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LoadingState.module.scss'

interface LoadingStateProps {
  isOverlay: boolean
  height?: number
}

export default function LoadingState({ isOverlay }: LoadingStateProps) {
  const { t } = useTranslation()

  return (
    <div className={isOverlay ? styles['LoadingState--overlay'] : styles['LoadingState--root']}>
      <Typography style={{ textAlign: 'center' }}>{t('loading')}...</Typography>
      <CircularProgress className={styles['CircularProgress--root']} />
    </div>
  )
}
