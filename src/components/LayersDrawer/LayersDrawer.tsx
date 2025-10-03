import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo } from '../../data/mapData'

interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
}

export default function LayersDrawer({ mapLayers, setMapLayers }: LayersDrawerProps) {
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
        <h2 style={{ padding: '8px' }}>{t('pollution_layers')}</h2>

        {/*List of collapsible layer toggles go inside here*/}
        {mapLayers.map((layer) => {
          return (
            <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
              <Typography sx={{ display: 'inline-block' }}>{t(layer.title)}</Typography>
              <Switch id={layer.layerId} checked={layer.isLayerOn} onChange={toggleLayer} />
            </Card>
          )
        })}
        <h2 style={{ padding: '8px' }}>{t('boundaries')}</h2>
      </StyledSwipeableDrawer>
    </div>
  )
}
