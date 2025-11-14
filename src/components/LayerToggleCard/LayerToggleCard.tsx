import {
  Card,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material'
import GradientLegend from '../GradientLegend/GradientLegend'
import Legend from '../Legend/Legend'
import styles from '../LayerToggleCard/LayerToggleCard.module.scss'
import { useTranslation } from 'react-i18next'
import { LayerInfo } from '../../data/mapData'
import { useState } from 'react'

interface LayerToggleCardProps {
  layer: LayerInfo
  toggleLayer: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  selectedYear: number
}

const getLayerToggleDetails = (layer: LayerInfo) => {
  let toggleCardDetails
  switch (layer.layerId) {
    case 'lulc':
      toggleCardDetails = layer.isLayerOn && <Legend />
      break
    case 'sed_export':
      toggleCardDetails = layer.isLayerOn && (
        <>
          <GradientLegend variation={layer.layerId} title={layer.legendTitle} />
          <RadioSelect layerId={layer.layerId} />
        </>
      )
      break
    default:
      toggleCardDetails = null
  }
  return toggleCardDetails
}

const RadioSelect = (layerId) => {
  const [selectedValue, setSelectedValue] = useState(`${layerId}-pixel`)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
  }
  const { t } = useTranslation()

  const radioControlProps = (item: string) =>
    ({
      checked: selectedValue === item,
      onChange: handleChange,
      control: <Radio />,
      value: item,
      labelPlacement: 'start',
    }) as unknown as FormControlLabelProps
  return (
    <FormControl>
      <RadioGroup>
        <FormControlLabel {...radioControlProps(`${layerId}-pixel`)} label={t('pixel_value')} />
        <FormControlLabel
          {...radioControlProps(`${layerId}-watershed`)}
          label={t('regions.watershed')}
        />
      </RadioGroup>
    </FormControl>
  )
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
      {getLayerToggleDetails(layer)}
    </Card>
  )
}
