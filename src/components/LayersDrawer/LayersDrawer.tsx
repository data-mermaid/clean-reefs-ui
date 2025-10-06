import { Card, Switch, Typography } from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo, layers, parentLayerTitles } from '../../data/mapData'
import i18next from 'i18next'

interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
}
const getGroupTitle = (groupTitle: string) => {
  return <h2 style={{ padding: '8px' }}>{i18next.t(groupTitle)}</h2>
}
const getLayersByParentGroup = (parentGroup, toggleLayer) => {
  const groupedLayers = layers.filter((l) => l.parentLayerType === parentGroup)

  return groupedLayers.map((layer) => (
    <Card className={styles['layer-card']} key={`${layer.sourceId}-switch`}>
      <Typography sx={{ display: 'inline-block' }}>{i18next.t(layer.title)}</Typography>
      <Switch id={layer.layerId} checked={layer.isLayerOn} onChange={toggleLayer} />
    </Card>
  ))
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

  const getLayers = () => {
    return Object.entries(parentLayerTitles).map(([key, value]) => (
      <div key={key}>
        {getGroupTitle(value)}
        {getLayersByParentGroup(key, toggleLayer)}
      </div>
    ))
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
        {getLayers()}
      </StyledSwipeableDrawer>
    </div>
  )
}
