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
import LayerToggleLegend from '../LayerToggleLegend/LayerToggleLegend'

interface LayerToggleCardProps {
  layer: LayerInfo
  toggleLayer: (layerId: string, on: boolean) => void
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  selectedYear: number
}

const getLayerToggleDetails = (layer: LayerInfo, toggleSubLayer) => {
  const layerId: string = layer.layerId
  let toggleCardDetails
  switch (layerId) {
    case 'lulc':
      toggleCardDetails = layer.isLayerOn && <Legend />
      break
    case 'sed_export':
      toggleCardDetails = layer.isLayerOn && (
        <>
          <GradientLegend variation={layerId} title={layer.legendTitle} />
          <RadioSelect layerId={layerId} toggleSubLayer={toggleSubLayer} />
        </>
      )
      break
    case 'atlas-benthic':
      toggleCardDetails = layer.isLayerOn && <LayerToggleLegend toggleSubLayer={toggleSubLayer} />
      break
    default:
      toggleCardDetails = null
  }
  return toggleCardDetails
}

const RadioSelect = ({ layerId, toggleSubLayer }) => {
  const [selectedValue, setSelectedValue] = useState(`${layerId}_pixel`)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value) //can this value be used in setPaintProperty
    toggleSubLayer(event.target.value, true)
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
        <FormControlLabel {...radioControlProps(`${layerId}_pixel`)} label={t('pixel_value')} />
        <FormControlLabel
          {...radioControlProps(`${layerId}_watershed`)}
          label={t('regions.watershed')}
        />
      </RadioGroup>
    </FormControl>
  )
}
export default function LayerToggleCard({
  layer,
  toggleLayer,
  toggleSubLayer,
  selectedYear,
}: LayerToggleCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
      {layer.legendType !== 'benthic' && (
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
              onChange={(e, checked) => toggleLayer(e, checked)}
            />
          )}
        </div>
      )}

      {getLayerToggleDetails(layer, toggleSubLayer)}
    </Card>
  )
}
