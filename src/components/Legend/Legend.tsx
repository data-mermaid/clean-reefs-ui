import { useTranslation } from 'react-i18next'
import styles from './Legend.module.scss'
import { Typography } from '@mui/material'
import { chartSeriesConfig } from '../../data/chartSeriesData'

export default function Legend() {
  const { t } = useTranslation()
  const getItems = () => {
    const legendKeyColors = chartSeriesConfig['charts.land_use_historical'].legendColors
    const legendTextPrefix = 'land_types'
    const chartLegendColors = Object.entries(legendKeyColors)
    return chartLegendColors.map(([key, value]) => {
      return (
        <div className={styles['Legend__row']} key={key}>
          <Typography>{t(`${legendTextPrefix}.${key}`)}</Typography>
          <div className={styles['Legend__item']} style={{ backgroundColor: `${value}` }} />
        </div>
      )
    })
  }
  return <div className={styles['Legend']}>{getItems()}</div>
}
