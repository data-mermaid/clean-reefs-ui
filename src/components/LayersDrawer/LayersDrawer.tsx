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
  const [activeRasterLayerId, setActiveRasterLayerId] = useState<string | null>('sed_export')
  const [mapSubLayers, setMapSubLayers] = useState(benthicSubLayers)

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)

  const toggleLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const toggledLayer = event.target.id
      const isChecked = event.target.checked
      const isRasterLayer = landRasterLayers.includes(toggledLayer)

      setMapLayers((prevMapLayers) => {
        let updatedLayers = mapToggleChange(prevMapLayers, toggledLayer, isChecked, selectedYear)

        // Enforce mutual exclusivity: only one raster layer active at a time
        if (
          isRasterLayer &&
          isChecked &&
          activeRasterLayerId &&
          activeRasterLayerId !== toggledLayer
        ) {
          updatedLayers = mapToggleChange(updatedLayers, activeRasterLayerId, false, selectedYear)
        }

        return updatedLayers
      })

      // Update active raster layer tracker
      if (isRasterLayer) {
        setActiveRasterLayerId(isChecked ? toggledLayer : null)
      }
    },
    [setMapLayers, activeRasterLayerId, selectedYear],
  )

  const toggleSubLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      toggleSubLayerFillColor(toggledLayerId)
      setMapSubLayers((prevMapSubLayers) =>
        mapToggleChange(prevMapSubLayers, toggledLayerId, isChecked, selectedYear),
      )

      if (toggledLayerId === 'reef_extent') {
        setMapLayers((prevMapLayers) =>
          mapToggleChange(prevMapLayers, toggledLayerId, isChecked, selectedYear),
        )
      }
    },
    [selectedYear, setMapLayers, toggleSubLayerFillColor],
  )

  const getLayersByParentGroup = (parentGroup, toggleLayer) => {
    return mapLayers
      .filter(
        (layer) =>
          layer.parentLayerType === parentGroup &&
          layer.layerId !== 'reef_extent' &&
          (!layer.year || layer.year === selectedYear),
      )
      .map((layer, index) => (
        <LayerToggleCard
          layer={layer}
          toggleLayer={toggleLayer}
          toggleSubLayer={toggleSubLayer}
          mapSubLayers={mapSubLayers}
          selectedYear={selectedYear}
          key={`layertoggle-${layer.sourceId}-${index}`}
        />
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
        {Object.entries(parentLayerTitles).map(([key, value]) => {
          const parentGroupLayers = getLayersByParentGroup(key, toggleLayer) ?? []
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
