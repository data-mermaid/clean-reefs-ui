import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import styles from './LayersDrawer.module.scss'
import { benthicSubLayers, parentLayerTitles, urlControlledLayerIds } from '../../data/mapData'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'
import { mapToggleChange } from '../../utils/mapUtils'
import { sortBoundaryLayers } from '../../utils/sortUtils'

/**
 * Business rule:
 * Only one land raster can be active at a time.
 */
interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
  selectedYear: number
  selectedLayers: string[]
  onLayerToggleChange: (toggledLayerId: string, isChecked: boolean) => void
  onSedSubLayerChange: (subLayerValue: 'pixel' | 'watershed') => void
  subSedLayerValue: 'pixel' | 'watershed'
}
export default function LayersDrawer({
  mapLayers,
  setMapLayers,
  selectedYear,
  selectedLayers,
  onLayerToggleChange,
  onSedSubLayerChange,
  subSedLayerValue,
}: LayersDrawerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }
  const mapSubLayers = useMemo(
    () =>
      benthicSubLayers.map((layer) => ({
        ...layer,
        isLayerOn: selectedLayers.includes(layer.layerId),
      })),
    [selectedLayers],
  )

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)

  const toggleLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      const isUrlControlled = urlControlledLayerIds.includes(toggledLayerId)

      // URL-controlled layers derive isLayerOn from URL; skip local state
      if (!isUrlControlled) {
        setMapLayers((prevMapLayers) =>
          mapToggleChange(prevMapLayers, toggledLayerId, isChecked, selectedYear),
        )
      }

      onLayerToggleChange(toggledLayerId, isChecked)
    },
    [setMapLayers, selectedYear, onLayerToggleChange],
  )

  const toggleSubLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      toggleSubLayerFillColor(toggledLayerId)
      onLayerToggleChange(toggledLayerId, isChecked)
    },
    [toggleSubLayerFillColor, onLayerToggleChange],
  )

  const getLayersByParentGroup = (parentGroup, toggleLayer) => {
    const filteredLayers = mapLayers.filter(
      (layer) =>
        layer.parentLayerType === parentGroup &&
        layer.layerId !== 'reef_extent' &&
        (!layer.year || layer.year === selectedYear),
    )

    if (parentGroup === 'boundaries') {
      filteredLayers.sort(sortBoundaryLayers)
    }

    return filteredLayers.map((layer) => (
      <LayerToggleCard
        layer={layer}
        toggleLayer={toggleLayer}
        toggleSubLayer={toggleSubLayer}
        mapSubLayers={mapSubLayers}
        selectedYear={selectedYear}
        subSedLayerValue={subSedLayerValue}
        onSedSubLayerChange={onSedSubLayerChange}
        key={`layertoggle-${layer.sourceId}`}
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
