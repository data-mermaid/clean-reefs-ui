import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LayerToggleLegend.module.scss'
import { IconButton, Switch, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { SubLayerInfo } from '../../types/MapDataTypes'
import { atlasBenthicColors } from '../../data/mapData'
import InfoPanel from '../InfoPanel/InfoPanel'

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
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className={styles['LayerToggleLegend']}>
      <div className={styles['LayerToggleLegend__row']}>
        <div className={styles['LayerToggleLegend__title-row']}>
          <Typography className={styles['LayerToggleLegend__all-label']}>
            {t(`${legendTextPrefix}.all`)}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setInfoOpen((v) => !v)}
            aria-label={t('read_more')}
            aria-expanded={infoOpen}
          >
            <InfoOutlined sx={{ fontSize: '1rem' }} />
          </IconButton>
        </div>
        <div className={styles['LayerToggleLegend__item-row']}>
          <Switch
            className={styles['MuiSwitch-root']}
            checked={anySubLayerOn}
            onChange={(e) => toggleAllSubLayers(e.target.checked)}
            aria-label={t(`${legendTextPrefix}.all`)}
          />
        </div>
      </div>
      <InfoPanel isOpen={infoOpen} textKey="info_text.benthic" />
      {mapSubLayers.map(({ layerId, isLayerOn }) => (
        <div className={styles['LayerToggleLegend__row']} key={layerId}>
          <Typography className={styles['LayerToggleLegend__layer-label']}>
            {t(`${legendTextPrefix}.${layerId}`)}
          </Typography>
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
