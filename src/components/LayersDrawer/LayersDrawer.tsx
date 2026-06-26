import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Switch, Typography } from '@mui/material'
import clsx from 'clsx'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'
import styles from './LayersDrawer.module.scss'
import { benthicSubLayers, parentLayerTitles, urlControlledLayerIds } from '../../data/mapData'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import React from 'react'
import { mapToggleChange, Basemap } from '../../utils/mapUtils'
import { sortBoundaryLayers } from '../../utils/sortUtils'
import BasemapSwitcher from '../BaseMapSwitcher/BaseMapSwitcher'

/**
 * Business rule:
 * Only one land raster can be active at a time.
 */
interface LayersDrawerProps {
  mapLayers: LayerInfo[]
  setMapLayers: Dispatch<SetStateAction<LayerInfo[]>>
  selectedYear: number
  selectedLayers: string[]
  selectedBasemap: Basemap
  onLayerToggleChange: (toggledLayerId: string, isChecked: boolean) => void
  onSedSubLayerChange: (subLayerValue: 'pixel' | 'watershed') => void
  subSedLayerValue: 'pixel' | 'watershed'
  open: boolean
  showLabels: boolean
  onLabelsChange: (show: boolean) => void
  onBasemapChange: (basemap: Basemap) => void
  sedExposureMinValue?: number
  sedExposureMaxValue?: number
  sedExposureLoading?: boolean
  sedLoadMinValue?: number
  sedLoadMaxValue?: number
  sedLoadLoading?: boolean
}

interface BoundaryToggleCardProps {
  layers: LayerInfo[]
  toggleLayer: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function BoundaryToggleCard({ layers, toggleLayer }: BoundaryToggleCardProps) {
  const { t } = useTranslation()
  const showCoastlines = useMapStore((s) => s.showCoastlines)
  const setShowCoastlines = useMapStore((s) => s.setShowCoastlines)

  return (
    <Card className={styles['boundary-legend-card']}>
      {[...layers].sort(sortBoundaryLayers).map((layer) => (
        <div className={styles['boundary-legend-row']} key={layer.sourceId}>
          <Typography className={styles['boundary-layer-title']}>{t(layer.title)}</Typography>
          <div className={styles['boundary-toggle-right']}>
            <div
              className={styles['boundary-layer-legend']}
              style={{ '--outline-color': layer.outlineColor } as React.CSSProperties}
            />
            <Switch
              className={styles['MuiSwitch-root']}
              id={layer.layerId}
              checked={layer.isLayerOn}
              onChange={toggleLayer}
            />
          </div>
        </div>
      ))}
      <div className={styles['boundary-legend-row']}>
        <Typography className={styles['boundary-layer-title']}>
          {t('boundary_map_layers.coastlines')}
        </Typography>
        <div className={styles['boundary-toggle-right']}>
          <div
            className={styles['boundary-layer-legend']}
            style={{ '--outline-color': '#000' } as React.CSSProperties}
          />
          <Switch
            className={styles['MuiSwitch-root']}
            checked={showCoastlines}
            onChange={(e) => setShowCoastlines(e.target.checked)}
          />
        </div>
      </div>
    </Card>
  )
}

export default function LayersDrawer({
  mapLayers,
  setMapLayers,
  selectedYear,
  selectedLayers,
  selectedBasemap,
  onLayerToggleChange,
  onSedSubLayerChange,
  subSedLayerValue,
  open,
  showLabels,
  onLabelsChange,
  onBasemapChange,
  sedExposureMinValue,
  sedExposureMaxValue,
  sedExposureLoading,
  sedLoadMinValue,
  sedLoadMaxValue,
  sedLoadLoading,
}: LayersDrawerProps) {
  const { t } = useTranslation()

  const mapSubLayers = useMemo(
    () =>
      benthicSubLayers.map((layer) => ({
        ...layer,
        isLayerOn: selectedLayers.includes(layer.layerId),
      })),
    [selectedLayers],
  )

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)

  const toggleBoundaryLayer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      setMapLayers((prevMapLayers) =>
        mapToggleChange(prevMapLayers, toggledLayerId, isChecked, selectedYear),
      )
    },
    [setMapLayers, selectedYear],
  )

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
        const boundaryLayers = mapLayers.filter(
          (layer) =>
            layer.parentLayerType === 'boundaries' &&
            (!layer.year || layer.year === selectedYear),
        )
        return boundaryLayers.length > 0
          ? [
              <BoundaryToggleCard
                key="boundary-toggle"
                layers={boundaryLayers}
                toggleLayer={toggleBoundaryLayer}
              />,
            ]
          : []
      }

      if (parentGroup === 'base') {
        return [
          <BasemapSwitcher
            key="basemap-switcher"
            showLabels={showLabels}
            selectedBasemap={selectedBasemap}
            onLabelsChange={onLabelsChange}
            onBasemapChange={onBasemapChange}
          />,
        ]
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
            sedExposureMinValue={sedExposureMinValue}
            sedExposureMaxValue={sedExposureMaxValue}
            sedExposureLoading={sedExposureLoading}
            sedLoadMinValue={sedLoadMinValue}
            sedLoadMaxValue={sedLoadMaxValue}
            sedLoadLoading={sedLoadLoading}
          />
        ))
    },
    [
      mapLayers,
      selectedYear,
      toggleBoundaryLayer,
      toggleLayer,
      toggleSubLayer,
      mapSubLayers,
      subSedLayerValue,
      onSedSubLayerChange,
      showLabels,
      onLabelsChange,
      selectedBasemap,
      onBasemapChange,
      sedExposureMinValue,
      sedExposureMaxValue,
      sedExposureLoading,
      sedLoadMinValue,
      sedLoadMaxValue,
      sedLoadLoading,
    ],
  )

  return (
    <aside
      className={clsx(styles['layers-panel'], !open && styles['layers-panel--hidden'])}
      aria-label={t('layers')}
      aria-hidden={!open}
    >
      <div className={styles['layers-panel__content']}>
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
      </div>
    </aside>
  )
}
