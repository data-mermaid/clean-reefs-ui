import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import LayersIcon from '@mui/icons-material/Layers'
import { useTranslation } from 'react-i18next'
import { Card, Typography } from '@mui/material'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'
import styles from './LayersDrawer.module.scss'
import { benthicSubLayers, parentLayerTitles, urlControlledLayerIds } from '../../data/mapData'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
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

interface BoundaryLegendCardProps {
  layers: LayerInfo[]
}

function BoundaryLegendCard({ layers }: BoundaryLegendCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles['boundary-legend-card']}>
      {[...layers].sort(sortBoundaryLayers).map((layer) => (
        <div className={styles['boundary-legend-row']} key={layer.sourceId}>
          <Typography className={styles['boundary-layer-title']}>{t(layer.title)}</Typography>
          <div
            className={styles['boundary-layer-legend']}
            style={{ '--outline-color': layer.outlineColor } as React.CSSProperties}
          />
        </div>
      ))}
    </Card>
  )
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

  const renderLayerGroup = useCallback(
    (parentGroup: string): React.ReactNode[] => {
      if (parentGroup === 'boundaries') {
        const boundaryLayers = mapLayers.filter((layer) => layer.parentLayerType === 'boundaries')
        return boundaryLayers.length > 0
          ? [<BoundaryLegendCard key="boundary-legend" layers={boundaryLayers} />]
          : []
      }

      return mapLayers
        .filter(
          (layer) =>
            layer.parentLayerType === parentGroup &&
            layer.layerId !== 'reef_extent' &&
            (!layer.year || layer.year === selectedYear),
        )
        .map((layer) => (
          <LayerToggleCard
            key={`layertoggle-${layer.sourceId}`}
            layer={layer}
            toggleLayer={toggleLayer}
            toggleSubLayer={toggleSubLayer}
            mapSubLayers={mapSubLayers}
            selectedYear={selectedYear}
            subSedLayerValue={subSedLayerValue}
            onSedSubLayerChange={onSedSubLayerChange}
          />
        ))
    },
    [
      mapLayers,
      selectedYear,
      toggleLayer,
      toggleSubLayer,
      mapSubLayers,
      subSedLayerValue,
      onSedSubLayerChange,
    ],
  )

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
          const layerNodes = renderLayerGroup(key)
          if (layerNodes.length === 0) {
            return null
          }

          return (
            <div key={key}>
              <h2 style={{ padding: '8px' }}>{t(value)}</h2>
              {layerNodes}
            </div>
          )
        })}
      </StyledSwipeableDrawer>
    </div>
  )
}
