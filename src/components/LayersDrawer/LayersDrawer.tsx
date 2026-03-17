import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { benthicSubLayers, parentLayerTitles } from '../../data/mapData'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'
import { mapToggleChange } from '../../utils/mapUtils'

/**
 * Business rule:
 * Only one land raster can be active at a time.
 */
interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
  selectedYear: number
}
const landRasterLayers = ['sed_export', 'lulc']

export default function LayersDrawer({ mapLayers, setMapLayers, selectedYear }: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const [activeRasterLayerId, setActiveRasterLayerId] = useState<string | null>(null)
  const [mapSubLayers, setMapSubLayers] = useState(benthicSubLayers)

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)

  const toggleLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const toggledLayerId = event.target.id
      const isRasterLayer = landRasterLayers.indexOf(toggledLayerId) > -1

      let updatedLayers = mapToggleChange(mapLayers, toggledLayerId, checked)
      if (isRasterLayer) {
        if (activeRasterLayerId && activeRasterLayerId !== toggledLayerId) {
          updatedLayers = mapToggleChange(updatedLayers, activeRasterLayerId, false)
        }
        if (checked) {
          setActiveRasterLayerId(toggledLayerId)
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
      const toggledLayerId = event.target.id
      const updatedSubLayers = mapToggleChange(mapSubLayers, toggledLayerId, checked)
      toggleSubLayerFillColor(toggledLayerId)
      setMapSubLayers(updatedSubLayers)

      if (toggledLayerId === 'reef_extent') {
        setMapLayers(mapToggleChange(mapLayers, toggledLayerId, checked))
      }
    },
    [mapLayers, mapSubLayers, setMapLayers, toggleSubLayerFillColor],
  )

  const getLayersByParentGroup = (parentGroup, toggleLayer) => {
    const groupedLayers = mapLayers.filter((l) => l.parentLayerType === parentGroup)

    let mappedLayers
    if (groupedLayers.length > 0) {
      mappedLayers = groupedLayers.map((layer, index) => {
        if ((layer.year && layer.year !== selectedYear) || layer.layerId === 'reef_extent') {
          return null
        }
        return (
          <LayerToggleCard
            layer={layer}
            toggleLayer={toggleLayer}
            toggleSubLayer={toggleSubLayer}
            mapSubLayers={mapSubLayers}
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
        {Object.entries(parentLayerTitles).map(([key, value]) => {
          const parentGroupLayers = getLayersByParentGroup(key, toggleLayer)
          if (parentGroupLayers.length > 0) {
            return (
              <div key={key}>
                <h2 style={{ padding: '8px' }}>{t(value)}</h2>
                {parentGroupLayers}
              </div>
            )
          }
          return null
        })}
      </StyledSwipeableDrawer>
    </div>
  )
}
