import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { LayerInfo, parentLayerTitles } from '../../data/mapData'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'

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

const mapToggleChange = (layers: LayerInfo[], layerId: string, checked: boolean) => {
  return layers.map((layer) => {
    return layer.layerId === layerId
      ? { ...layer, isLayerOn: checked } // Create new object with updated property
      : layer // Keep other layers unchanged
  })
}

export default function LayersDrawer({ mapLayers, setMapLayers, selectedYear }: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const [activeRasterLayerId, setActiveRasterLayerId] = useState<string | null>(null)

  const toggleLayer = useCallback(
    (layerId: string, checked: boolean) => {
      const isRasterLayer = rasterLayers.indexOf(layerId) > -1

      let updatedLayers = mapToggleChange(mapLayers, layerId, checked)
      if (isRasterLayer) {
        if (activeRasterLayerId && activeRasterLayerId !== layerId) {
          updatedLayers = mapToggleChange(updatedLayers, activeRasterLayerId, false)
        }
        if (checked) {
          setActiveRasterLayerId(layerId)
        } else {
          setActiveRasterLayerId(null)
        }
      }
      setMapLayers(updatedLayers)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeRasterLayerId, setMapLayers],
  )

  //currently only applies to sed_export & sublayers
  const toggleSubLayer = (subLayerId: string, checked: boolean) => {}
  // const toggleSubLayer = useCallback((subLayerId: string, checked: boolean) => {
  // if (subLayerId === 'sed_export_watershed') {}
  //todo: get map reference
  // map.removeLayer(subLayerId)
  // map.addLayer(sedExportWatershedLayer, { before: 'label_airport' })
  // })

  const getLayersByParentGroup = (parentGroup, toggleLayer) => {
    const groupedLayers = mapLayers.filter((l) => l.parentLayerType === parentGroup)

    let mappedLayers
    if (groupedLayers.length > 0) {
      mappedLayers = groupedLayers.map((layer, index) => {
        if (layer.year && layer.year !== selectedYear) {
          return null
        }
        return (
          <LayerToggleCard
            layer={layer}
            toggleLayer={toggleLayer}
            toggleSubLayer={toggleSubLayer}
            selectedYear={selectedYear}
            key={`layertoggle-${layer.sourceId}-${index}`}
          />
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
