import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { atlasBenthicLayers, parentLayerTitles } from '../../data/mapData'
import Legend from '../Legend/Legend'
import GradientLegend from '../GradientLegend/GradientLegend'
import LayerToggleLegend from '../LayerToggleLegend/LayerToggleLegend'
import { LayerInfo, SubLayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'

/**
 * Business rule:
 * Only one land raster can be active at a time.
 */
interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
  selectedYear: number
}
const rasterLayers = ['sed_export', 'lulc']

const mapToggleChange = (
  layers: LayerInfo[] | SubLayerInfo[],
  layerId: string,
  checked: boolean,
) => {
  return layers.map((layer) => {
    return layer.layerId === layerId ? { ...layer, isLayerOn: checked } : layer
  })
}

export default function LayersDrawer({ mapLayers, setMapLayers, selectedYear }: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const [activeRasterLayerId, setActiveRasterLayerId] = useState<string | null>(null)
  const [mapSubLayers, setMapSubLayers] = useState(atlasBenthicLayers)

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)

  const toggleLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const toggledLayer = event.target.id
      const isRasterLayer = rasterLayers.indexOf(toggledLayer) > -1

      let updatedLayers = mapToggleChange(mapLayers, toggledLayer, checked)
      if (isRasterLayer) {
        if (activeRasterLayerId && activeRasterLayerId !== toggledLayer) {
          updatedLayers = mapToggleChange(updatedLayers, activeRasterLayerId, false)
        }
        if (checked) {
          setActiveRasterLayerId(toggledLayer)
        } else {
          setActiveRasterLayerId(null)
        }
      }
      setMapLayers(updatedLayers)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeRasterLayerId, setMapLayers],
  )

  const toggleSubLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const toggledLayer = event.target.id
      const updatedLayers = mapToggleChange(mapSubLayers, toggledLayer, checked)
      toggleSubLayerFillColor(toggledLayer)
      setMapSubLayers(updatedLayers)
    },
    [mapSubLayers, toggleSubLayerFillColor],
  )

  const getLayersByParentGroup = (parentGroup, toggleLayer) => {
    const groupedLayers = mapLayers.filter((l) => l.parentLayerType === parentGroup)

    let mappedLayers
    if (groupedLayers.length > 0) {
      mappedLayers = groupedLayers.map((layer) => {
        if (layer.year && layer.year !== selectedYear) {
          return null
        }
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
                    onChange={toggleLayer}
                  />
                )}
              </div>
            )}

            {layer.legendType === 'lulc' && layer.isLayerOn && <Legend />}
            {layer.legendType === 'benthic' && layer.isLayerOn && (
              <LayerToggleLegend mapSubLayers={mapSubLayers} toggleSubLayer={toggleSubLayer} />
            )}
            {layer.legendType === 'gradient' && layer.isLayerOn && (
              <GradientLegend variation={layer.layerId} title={layer.legendTitle} />
            )}
          </Card>
        )
      })
    }
    return mappedLayers
  }

  return (
    <div className={styles['LayersDrawer-root']}>
      {!open && (
        <StyledIconButtonWithTooltip
          tooltipText={t('buttons.open_menu')}
          handleOnClick={toggleDrawer(true)}
          className={styles['layer-toggle-button']}
        >
          <LayersIcon />
        </StyledIconButtonWithTooltip>
      )}
      <StyledSwipeableDrawer
        open={open}
        anchor="left"
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        {Object.entries(parentLayerTitles).map(([key, value]) => (
          <div key={key}>
            <h2 style={{ padding: '8px' }}>{t(value)}</h2>
            {getLayersByParentGroup(key, toggleLayer)}
          </div>
        ))}
      </StyledSwipeableDrawer>
    </div>
  )
}
