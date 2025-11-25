import { useTranslation } from 'react-i18next'
import styles from './LayerToggleLegend.module.scss'
import { Switch, Typography } from '@mui/material'
import { SubLayerInfo } from '../../types/MapDataTypes'
import { atlasBenthicColors } from '../../data/mapData'

interface LayerToggleLegendProps {
  mapSubLayers: SubLayerInfo[]
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}

export default function LayerToggleLegend({
  mapSubLayers,
  toggleSubLayer,
}: LayerToggleLegendProps) {
  const { t } = useTranslation()
  const legendTextPrefix = 'benthic_map_layers'
  const getItems = () => {
    return mapSubLayers.map(({ layerId, isLayerOn }) => {
      return (
        <div className={styles['LayerToggleLegend__row']} key={layerId}>
          <Typography>{t(`${legendTextPrefix}.${layerId}`)}</Typography>
          <div className={styles['LayerToggleLegend__item-row']}>
            <div
              className={styles['LayerToggleLegend__item']}
              style={{ backgroundColor: `${atlasBenthicColors[layerId]}` }}
            />
            <Switch
              className={styles['MuiSwitch-root']}
              id={layerId}
              checked={isLayerOn && layerId !== 'reef_extent'} //reef_extent is temp disabled and off until data is resolved
              disabled={layerId === 'reef_extent'}
              onChange={toggleSubLayer}
            />
          </div>
        </div>
      )
    })
  }
  return <div className={styles['LayerToggleLegend']}>{getItems()}</div>
}
