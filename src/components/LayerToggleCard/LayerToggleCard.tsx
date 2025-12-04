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
import { useState } from 'react'
import { LayerInfo, SubLayerInfo } from '../../types/MapDataTypes'
import LayerToggleLegend from '../LayerToggleLegend/LayerToggleLegend'
import { useMapStore } from '../../stores/mapStore'

interface LayerToggleCardProps {
  layer: LayerInfo
  toggleLayer: (event: React.ChangeEvent<HTMLInputElement>, on: boolean) => void
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>, on: boolean) => void
  mapSubLayers?: SubLayerInfo[]
  selectedYear: number
}

const getLayerToggleDetails = (
  layer: LayerInfo,
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>, on: boolean) => void,
  mapSubLayers?: SubLayerInfo[],
) => {
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
          <RadioSelect />
        </>
      )
      break
    case 'benthic':
      toggleCardDetails = layer.isLayerOn && mapSubLayers && (
        <LayerToggleLegend mapSubLayers={mapSubLayers} toggleSubLayer={toggleSubLayer} />
      )
      break
    default:
      toggleCardDetails = null
  }
  return toggleCardDetails
}

//TODO: restrict based on selected region (add to mapstore?)
//if not country or region, disable watershed option

const RadioSelect = () => {
  const [selectedValue, setSelectedValue] = useState<'pixel' | 'watershed'>('pixel')
  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toggledOnItem = event.target.value as 'pixel' | 'watershed'
    toggleSedExportSubLayerFills(toggledOnItem)
    setSelectedValue(toggledOnItem)
  }

  const { t } = useTranslation()
  const radioControlProps = (item: string) =>
    ({
      checked: item === selectedValue,
      onChange: handleChange,
      control: <Radio />,
      value: item,
      labelPlacement: 'start',
    }) as unknown as FormControlLabelProps
  return (
    <FormControl classes={{ root: styles['MuiFormControl-root'] }}>
      <RadioGroup>
        <FormControlLabel
          {...radioControlProps(`pixel`)}
          classes={{
            root: styles['MuiFormControlLabel-root'],
          }}
          label={t('pixel_value')}
        />
        <FormControlLabel
          {...radioControlProps(`watershed`)}
          classes={{
            root: styles['MuiFormControlLabel-root'],
          }}
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
  mapSubLayers,
}: LayerToggleCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
      <div className={styles['layer-toggle-header']}>
        {layer.layerId !== 'benthic' && (
          <>
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
          </>
        )}
      </div>
      {getLayerToggleDetails(layer, toggleSubLayer, mapSubLayers)}
    </Card>
  )
}
