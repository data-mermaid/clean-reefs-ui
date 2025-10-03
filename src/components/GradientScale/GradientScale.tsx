import { Typography } from '@mui/material'
import styles from './GradientScale.module.scss'
import { useTranslation } from 'react-i18next'

export default function GradientScale() {
  const { t } = useTranslation()
  return (
    <div className={styles['GradientScale-root']}>
      <Typography>{t('scale_low')}</Typography>
      <Typography>{t('scale_high')}</Typography>
    </div>
  )
}
