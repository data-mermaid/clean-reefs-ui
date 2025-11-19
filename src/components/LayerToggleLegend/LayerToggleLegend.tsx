import { useTranslation } from 'react-i18next'
import styles from './LayerToggleLegend.module.scss'
import { Switch, Typography } from '@mui/material'
import { atlasBenthicLayers } from '../../data/mapData'

interface LayerToggleLegendProps {
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}
export default function LayerToggleLegend({ toggleSubLayer }: LayerToggleLegendProps) {
  const { t } = useTranslation()
  const legendTextPrefix = 'benthic_map_layers'
  const getItems = () => {
    return atlasBenthicLayers.map(({ layerId, legendColor, isLayerOn }) => {
      return (
        <div className={styles['LayerToggleLegend__row']} key={layerId}>
          <Typography>{t(`${legendTextPrefix}.${layerId}`)}</Typography>
          <div className={styles['LayerToggleLegend__item-row']}>
            <div
              className={styles['LayerToggleLegend__item']}
              style={{ backgroundColor: `${legendColor}` }}
            />
            <Switch
              className={styles['MuiSwitch-root']}
              id={`${layerId}-legend-toggle`}
              checked={isLayerOn}
              onChange={toggleSubLayer}
            />
          </div>
        </div>
      )
    })
  }
  return <div className={styles['LayerToggleLegend']}>{getItems()}</div>
}
