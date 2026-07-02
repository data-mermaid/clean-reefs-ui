import { useTranslation } from 'react-i18next'
import styles from './LayerToggleLegend.module.scss'
import { Switch, Typography } from '@mui/material'
import { SubLayerInfo } from '../../types/MapDataTypes'
import { atlasBenthicColors } from '../../data/mapData'

interface LayerToggleLegendProps {
  mapSubLayers: SubLayerInfo[]
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>) => void
  toggleAllSubLayers: (checked: boolean) => void
}

export default function LayerToggleLegend({
  mapSubLayers,
  toggleSubLayer,
  toggleAllSubLayers,
}: LayerToggleLegendProps) {
  const { t } = useTranslation()
  const legendTextPrefix = 'benthic_map_layers'
  const anySubLayerOn = mapSubLayers.some((l) => l.isLayerOn)

  return (
    <div className={styles['LayerToggleLegend']}>
      <div className={styles['LayerToggleLegend__row']}>
        <Typography className={styles['LayerToggleLegend__all-label']}>{t(`${legendTextPrefix}.all`)}</Typography>
        <div className={styles['LayerToggleLegend__item-row']}>
          <Switch
            className={styles['MuiSwitch-root']}
            checked={anySubLayerOn}
            onChange={(e) => toggleAllSubLayers(e.target.checked)}
            aria-label={t(`${legendTextPrefix}.all`)}
          />
        </div>
      </div>
      {mapSubLayers.map(({ layerId, isLayerOn }) => (
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
              checked={isLayerOn}
              onChange={toggleSubLayer}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
