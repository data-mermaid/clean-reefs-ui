import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo } from '../../data/mapData'

interface LayersDrawerProps {
  layersOn: LayerInfo[]
  setLayersOn: Dispatch<SetStateAction<LayerInfo[]>>
}

export default function LayersDrawer({ layersOn, setLayersOn }: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const toggleLayer = (event: React.ChangeEvent<HTMLInputElement>) => {
    const layerToToggle = event.target.id
    const layerChecked: boolean = event.target.checked
    const updatedLayers = layersOn.map(
      (layer) =>
        layer.id === layerToToggle
          ? { ...layer, isLayerOn: layerChecked } // Create new object with updated property
          : layer, // Keep other layers unchanged
    )
    setLayersOn(updatedLayers)
  }

  return (
    <div className={styles['LayersDrawer-root']}>
      <StyledIconButtonWithTooltip
        tooltipText={t('buttons.open_menu')}
        handleOnClick={toggleDrawer(true)}
        className={styles['layer-toggle-button']}
      >
        <LayersIcon />
      </StyledIconButtonWithTooltip>
      <StyledSwipeableDrawer
        open={open}
        anchor="left"
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <h2 style={{ padding: '8px' }}>{t('pollution_layers')}</h2>

        {/*List of collapsible layer toggles go inside here*/}
        {/*TODO: Map out the map layers for cleaner code*/}
        <Card className={styles['layer-card']}>
          <Typography sx={{ display: 'inline-block' }}>PMTiles layer</Typography>
          <Switch
            id="0-regions"
            key={0}
            sx={{ display: 'inline-block' }}
            checked={layersOn[0].isLayerOn}
            onChange={toggleLayer}
          />
        </Card>

        <Card className={styles['layer-card']}>
          <Typography sx={{ display: 'inline-block' }}>{t('map_layers.land_use_cover')}</Typography>
          <Switch
            id="1-lulc"
            key={1}
            sx={{ display: 'inline-block' }}
            checked={layersOn[1].isLayerOn}
            onChange={toggleLayer}
          />
        </Card>
        {/* End temp code */}
      </StyledSwipeableDrawer>
    </div>
  )
}
