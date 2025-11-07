import { Typography } from '@mui/material'
import styles from './GradientLegend.module.scss'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

interface GradientLegendProps {
  variation: string //'sed_export' | 'sediment-concentration' | 'reef-ecosystem-exposure'
  title?: string
}

export default function GradientLegend({ variation, title }: GradientLegendProps) {
  const { t } = useTranslation()
  return (
    <div className={styles['GradientLegend']}>
      {title && (
        <Typography variant="h6" component="h3">
          {t(title)}
        </Typography>
      )}
      <div className={styles['GradientLegend__legend']}>
        <Typography>{t('scale_low')}</Typography>
        <Typography>{t('scale_high')}</Typography>
      </div>
      <div className={clsx(styles['GradientLegend__scale'], styles[variation])}></div>
    </div>
  )
}
