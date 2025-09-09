import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LoadingState() {
  const { t } = useTranslation()

  return (
    <div
      style={{
        display: 'block',
        position: 'relative',
        padding: '10px',
      }}
    >
      <Typography style={{ textAlign: 'center' }}>{t('loading')}...</Typography>
      <CircularProgress
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto',
          height: '50px', //rotation causes overflow issues
        }}
      />
    </div>
  )
}
