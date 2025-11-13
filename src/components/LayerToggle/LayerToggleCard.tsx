import { Card, Switch, Typography } from '@mui/material'
import GradientLegend from '../GradientLegend/GradientLegend'
import Legend from '../Legend/Legend'
import styles from '../LayersDrawer/LayersDrawer.module.scss'
import { useTranslation } from 'react-i18next'
import { LayerInfo } from '../../data/mapData'

interface LayerToggleCardProps {
  layer: LayerInfo
  toggleLayer: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  selectedYear: number
}

export default function LayerToggleCard({
  layer,
  toggleLayer,
  selectedYear,
}: LayerToggleCardProps) {
  const { t } = useTranslation()
  return (
    <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
      <div className={styles['layer-toggle-header']}>
        <Typography className={styles['layer-card_title']}>{t(layer.title)}</Typography>
        {layer.year && <Typography>{selectedYear}</Typography>}
        {layer.outlineColor ? (
          <div
            className={styles['map-layer-key']}
            style={{ border: `3px solid ${layer.outlineColor}` }}
          />
        ) : (
          <Switch
            className={styles['MuiSwitch-root']}
            id={layer.layerId}
            checked={layer.isLayerOn}
            onChange={toggleLayer}
          />
        )}
      </div>
      {layer.legendType === 'lulc' && layer.isLayerOn && <Legend />}
      {layer.legendType === 'gradient' && layer.isLayerOn && (
        <GradientLegend variation={layer.layerId} title={layer.legendTitle} />
      )}
    </Card>
  )
}
