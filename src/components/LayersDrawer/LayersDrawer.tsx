import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo } from '../../data/mapData'

interface LayersDrawerProps {
  layersAvailable: LayerInfo[]
  layersOn: []
  setLayersOn: Dispatch<SetStateAction<[]>>
}

export default function LayersDrawer({
  layersAvailable,
  layersOn,
  setLayersOn,
}: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const toggleLayer = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLayers = layersOn
    const layerId: string = event.target.id
    if (layerId) {
      // @ts-expect-error eslint doesn't like event.target.id
      const layerIndex = layersOn.indexOf(layerId)
      if (layerIndex > -1) {
        updatedLayers.splice(layerIndex, 1)
      } else {
        // @ts-expect-error eslint doesn't like event.target.id
        updatedLayers.push(layerId)
      }
      setLayersOn(updatedLayers)
    }
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
        {layersAvailable.map((layer) => {
          return (
            <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
              <Typography sx={{ display: 'inline-block' }}>{t(layer.title)}</Typography>
              <Switch id={layer.layerId} checked={layer.isLayerOn} onChange={toggleLayer} />
            </Card>
          )
        })}
      </StyledSwipeableDrawer>
    </div>
  )
}
