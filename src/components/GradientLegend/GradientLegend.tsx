import { Skeleton, Typography } from '@mui/material'
import styles from './GradientLegend.module.scss'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { formatLegendValue } from '../../utils/chartUtils'

interface GradientLegendProps {
  variation: string // active: 'sed_load' | 'sed_exposure' — planned: 'sediment-concentration' | 'reef-ecosystem-exposure'
  title?: string
  minValue?: number
  maxValue?: number
  isLoading?: boolean
}

export default function GradientLegend({
  variation,
  title,
  minValue,
  maxValue,
  isLoading,
}: GradientLegendProps) {
  const { t } = useTranslation()
  const hasValues = minValue !== undefined && maxValue !== undefined

  const renderValue = (value: number | undefined, fallback: string) => {
    if (isLoading) {
      return <Skeleton variant="text" width={36} />
    }
    return <Typography>{hasValues ? formatLegendValue(value!) : fallback}</Typography>
  }

  return (
    <div className={styles['GradientLegend']}>
      {title && (
        <Typography variant="h6" component="h3">
          {t(title)}
        </Typography>
      )}
      <div className={styles['GradientLegend__legend']}>
        {renderValue(minValue, t('scale_low'))}
        {renderValue(maxValue, t('scale_high'))}
      </div>
      <div className={clsx(styles['GradientLegend__scale'], styles[variation])}></div>
    </div>
  )
}
