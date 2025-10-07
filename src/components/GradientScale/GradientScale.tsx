import { Typography } from '@mui/material'
import styles from './GradientScale.module.scss'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

interface GradientScaleProps {
  variation: 'sediment-export' | 'sediment-concentration' | 'reef-ecosystem-exposure'
  title?: string
}

export default function GradientScale({ variation, title }: GradientScaleProps) {
  const { t } = useTranslation()
  return (
    <div className={styles['GradientScale-root']}>
      <h3>{t(title)}</h3>
      <div className={styles['GradientScale-legend']}>
        <Typography>{t('scale_low')}</Typography>
        <Typography>{t('scale_high')}</Typography>
      </div>
      <div className={clsx(styles['GradientScale-scale'], styles[variation])}></div>
    </div>
  )
}
