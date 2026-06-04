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
import { LayerInfo, SubLayerInfo } from '../../types/MapDataTypes'
import LayerToggleLegend from '../LayerToggleLegend/LayerToggleLegend'

interface LayerToggleCardProps {
  layer: LayerInfo
  toggleLayer: (event: React.ChangeEvent<HTMLInputElement>) => void
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>) => void
  mapSubLayers?: SubLayerInfo[]
  selectedYear: number
  subSedLayerValue: 'pixel' | 'watershed'
  onSedSubLayerChange: (subLayerValue: 'pixel' | 'watershed') => void
  sedExposureMinValue?: number
  sedExposureMaxValue?: number
  sedExposureLoading?: boolean
  sedLoadMinValue?: number
  sedLoadMaxValue?: number
  sedLoadLoading?: boolean
}

const getLayerToggleDetails = (
  layer: LayerInfo,
  toggleSubLayer: (event: React.ChangeEvent<HTMLInputElement>) => void,
  subSedLayerValue: 'pixel' | 'watershed',
  onSedSubLayerChange: (subLayerValue: 'pixel' | 'watershed') => void,
  mapSubLayers?: SubLayerInfo[],
  sedExposureMinValue?: number,
  sedExposureMaxValue?: number,
  sedExposureLoading?: boolean,
  sedLoadMinValue?: number,
  sedLoadMaxValue?: number,
  sedLoadLoading?: boolean,
) => {
  const layerId: string = layer.layerId
  let toggleCardDetails
  switch (layerId) {
    case 'lulc':
      toggleCardDetails = layer.isLayerOn && <Legend />
      break
    case 'sed_exposure':
      toggleCardDetails = layer.isLayerOn && (
        <GradientLegend
          variation={layerId}
          title={layer.legendTitle}
          minValue={sedExposureMinValue}
          maxValue={sedExposureMaxValue}
          isLoading={sedExposureLoading}
        />
      )
      break
    case 'sed_load':
      toggleCardDetails = layer.isLayerOn && (
        <>
          <GradientLegend
            variation={layerId}
            minValue={sedLoadMinValue}
            maxValue={sedLoadMaxValue}
            isLoading={sedLoadLoading}
          />
          <RadioSelect
            subSedLayerValue={subSedLayerValue}
            onSedSubLayerChange={onSedSubLayerChange}
          />
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

//if not country or region, disable watershed option
const RadioSelect = ({
  subSedLayerValue,
  onSedSubLayerChange,
}: {
  subSedLayerValue: 'pixel' | 'watershed'
  onSedSubLayerChange: (subLayerValue: 'pixel' | 'watershed') => void
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toggledOnItem = event.target.value as 'pixel' | 'watershed'
    onSedSubLayerChange(toggledOnItem)
  }

  const { t } = useTranslation()
  const radioControlProps = (item: string) =>
    ({
      checked: item === subSedLayerValue,
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
  subSedLayerValue,
  onSedSubLayerChange,
  sedExposureMinValue,
  sedExposureMaxValue,
  sedExposureLoading,
  sedLoadMinValue,
  sedLoadMaxValue,
  sedLoadLoading,
}: LayerToggleCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
      <div className={styles['layer-toggle-header']}>
        {layer.layerId !== 'benthic' && (
          <>
            <Typography className={styles['layer-card_title']}>
              {layer.layerId === 'sed_load' ? t(layer.legendTitle) : t(layer.title)}
            </Typography>
            {layer.year && <Typography>{selectedYear}</Typography>}
            <Switch
              className={styles['MuiSwitch-root']}
              id={layer.layerId}
              checked={layer.isLayerOn}
              onChange={toggleLayer}
            />
          </>
        )}
      </div>
      {getLayerToggleDetails(
        layer,
        toggleSubLayer,
        subSedLayerValue,
        onSedSubLayerChange,
        mapSubLayers,
        sedExposureMinValue,
        sedExposureMaxValue,
        sedExposureLoading,
        sedLoadMinValue,
        sedLoadMaxValue,
        sedLoadLoading,
      )}
    </Card>
  )
}
