import { useTranslation } from 'react-i18next'
import styles from './Legend.module.scss'
import { Typography } from '@mui/material'
import { graphChartConfig } from '../../data/graphData'

// interface LegendProps {}

export default function Legend() {
  const { t } = useTranslation()
  const getItems = () => {
    const graphLegendColors = Object.entries(
      graphChartConfig['graphs.land_use_historical'].legendColors,
    )
    return graphLegendColors.map(([key, value]) => {
      return (
        <div className={styles['legend__row']} key={key}>
          <Typography>{t(`land_types.${key}`)}</Typography>
          <div className={styles['legend-item']} style={{ backgroundColor: `${value}` }} />
        </div>
      )
    })
  }
  return <div className={styles['Legend-root']}>{getItems()}</div>
}
