import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo, parentLayerTitles } from '../../data/mapData'
import Legend from '../Legend/Legend'

interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
  selectedYear: number
}

export default function LayersDrawer({ mapLayers, setMapLayers, selectedYear }: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  const toggleLayer = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const updatedLayers = mapLayers.map((layer) => {
      return layer.layerId === event.target.id
        ? { ...layer, isLayerOn: checked } // Create new object with updated property
        : layer // Keep other layers unchanged
    })
    setMapLayers(updatedLayers)
  }
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
            {/*Add back in when data layers available*/}
            {/*{layer.legendType === 'gradient' && layer.isLayerOn && <GradientLegend variant={} title={}/>}*/}
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
