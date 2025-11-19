import { useTranslation } from 'react-i18next'
import styles from './Legend.module.scss'
import { Typography } from '@mui/material'
import { chartSeriesConfig } from '../../data/chartSeriesData'
import { atlasBenthicCategories } from '../../data/mapData'

export default function Legend({ variant }) {
  const { t } = useTranslation()
  const getItems = () => {
    const legendKeyColors =
      variant === 'lulc'
        ? chartSeriesConfig['charts.land_use_historical'].legendColors
        : atlasBenthicCategories
    const legendTextPrefix = variant === 'lulc' ? 'land_types' : 'benthic_map_layers'
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
