import {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Card, IconButton, Switch, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import clsx from 'clsx'
import LayerToggleCard from '../LayerToggleCard/LayerToggleCard'
import InfoPanel from '../InfoPanel/InfoPanel'
import styles from './LayersDrawer.module.scss'
import {
  atlasBenthicColors,
  benthicSubLayers,
  parentLayerTitles,
  urlControlledLayerIds,
  transparent,
} from '../../data/mapData'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
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
  showCoastlines: boolean
  onCoastlinesChange: (show: boolean) => void
  showRivers: boolean
  onRiversChange: (show: boolean) => void
  sedExposureMinValue?: number
  sedExposureMaxValue?: number
  sedExposureLoading?: boolean
  sedLoadMinValue?: number
  sedLoadMaxValue?: number
  sedLoadLoading?: boolean
}

interface BoundaryToggleCardProps {
  layers: LayerInfo[]
  toggleLayer: (event: ChangeEvent<HTMLInputElement>) => void
  showCoastlines: boolean
  onCoastlinesChange: (show: boolean) => void
}

function BoundaryToggleCard({
  layers,
  toggleLayer,
  showCoastlines,
  onCoastlinesChange,
}: BoundaryToggleCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={styles['boundary-legend-card']}>
      {[...layers].sort(sortBoundaryLayers).map((layer) => (
        <div className={styles['boundary-legend-row']} key={layer.sourceId}>
          <Typography id={`${layer.layerId}-title`} className={styles['boundary-layer-title']}>
            {t(layer.title)}
          </Typography>
          <div className={styles['boundary-toggle-right']}>
            <div
              className={styles['boundary-layer-legend']}
              style={{ '--outline-color': layer.outlineColor } as CSSProperties}
            />
            <Switch
              className={styles['MuiSwitch-root']}
              id={layer.layerId}
              checked={layer.isLayerOn}
              onChange={toggleLayer}
              aria-labelledby={`${layer.layerId}-title`}
            />
          </div>
        </div>
      ))}
      <div className={styles['boundary-legend-row']}>
        <Typography id="coastlinesTitle" className={styles['boundary-layer-title']}>
          {t('boundary_map_layers.coastlines')}
        </Typography>
        <div className={styles['boundary-toggle-right']}>
          <div
            className={styles['boundary-layer-legend']}
            style={{ '--outline-color': '#000' } as CSSProperties}
          />
          <Switch
            className={styles['MuiSwitch-root']}
            checked={showCoastlines}
            onChange={(e) => onCoastlinesChange(e.target.checked)}
            aria-labelledby="coastlinesTitle"
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
  showCoastlines,
  onCoastlinesChange,
  showRivers,
  onRiversChange,
  sedExposureMinValue,
  sedExposureMaxValue,
  sedExposureLoading,
  sedLoadMinValue,
  sedLoadMaxValue,
  sedLoadLoading,
}: LayersDrawerProps) {
  const { t } = useTranslation()
  const [boundariesInfoOpen, setBoundariesInfoOpen] = useState(false)

  const mapSubLayers = useMemo(
    () =>
      benthicSubLayers.map((layer) => ({
        ...layer,
        isLayerOn: selectedLayers.includes(layer.layerId),
      })),
    [selectedLayers],
  )

  const toggleSubLayerFillColor = useMapStore((state) => state.toggleSubLayerFillColor)
  const setBenthicMapSubLayerColors = useMapStore((state) => state.setBenthicMapSubLayerColors)

  const toggleBoundaryLayer = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      // Boundary layers are now URL-controlled; isLayerOn is derived from URL via urlSyncedMapLayers
      onLayerToggleChange(toggledLayerId, isChecked)
    },
    [onLayerToggleChange],
  )

  const toggleLayer = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
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
    (event: ChangeEvent<HTMLInputElement>) => {
      const toggledLayerId = event.target.id
      const isChecked = event.target.checked
      toggleSubLayerFillColor(toggledLayerId)
      onLayerToggleChange(toggledLayerId, isChecked)
    },
    [toggleSubLayerFillColor, onLayerToggleChange],
  )

  const toggleAllSubLayers = useCallback(
    (checked: boolean) => {
      const newColors = Object.fromEntries(
        benthicSubLayers.map((l) => [
          l.layerId,
          checked ? atlasBenthicColors[l.layerId] : transparent,
        ]),
      )
      setBenthicMapSubLayerColors(newColors)
      benthicSubLayers.forEach((l) => onLayerToggleChange(l.layerId, checked))
    },
    [setBenthicMapSubLayerColors, onLayerToggleChange],
  )

  const renderBoundaryGroup = useCallback(() => {
    const boundaryLayers = mapLayers.filter(
      (layer) =>
        layer.parentLayerType === 'boundaries' && (!layer.year || layer.year === selectedYear),
    )
    return boundaryLayers.length > 0
      ? [
          <BoundaryToggleCard
            key="boundary-toggle"
            layers={boundaryLayers}
            toggleLayer={toggleBoundaryLayer}
            showCoastlines={showCoastlines}
            onCoastlinesChange={onCoastlinesChange}
          />,
        ]
      : []
  }, [mapLayers, selectedYear, toggleBoundaryLayer, showCoastlines, onCoastlinesChange])

  const renderBaseGroup = useCallback(
    () => [
      <BasemapSwitcher
        key="basemap-switcher"
        showLabels={showLabels}
        selectedBasemap={selectedBasemap}
        onLabelsChange={onLabelsChange}
        onBasemapChange={onBasemapChange}
        showRivers={showRivers}
        onRiversChange={onRiversChange}
      />,
    ],
    [showLabels, selectedBasemap, onLabelsChange, onBasemapChange, showRivers, onRiversChange],
  )

  const renderDataLayerGroup = useCallback(
    (parentGroup: string) =>
      mapLayers
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
            toggleAllSubLayers={toggleAllSubLayers}
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
        )),
    [
      mapLayers,
      selectedYear,
      toggleLayer,
      toggleSubLayer,
      toggleAllSubLayers,
      mapSubLayers,
      subSedLayerValue,
      onSedSubLayerChange,
      sedExposureMinValue,
      sedExposureMaxValue,
      sedExposureLoading,
      sedLoadMinValue,
      sedLoadMaxValue,
      sedLoadLoading,
    ],
  )

  const getLayerNodes = useCallback(
    (key: string) => {
      if (key === 'boundaries') {
        return renderBoundaryGroup()
      }
      if (key === 'base') {
        return renderBaseGroup()
      }
      return renderDataLayerGroup(key)
    },
    [renderBoundaryGroup, renderBaseGroup, renderDataLayerGroup],
  )

  return (
    <aside
      className={clsx(styles['layers-panel'], !open && styles['layers-panel--hidden'])}
      aria-label={t('layers')}
      aria-hidden={!open}
    >
      <div className={styles['layers-panel__content']}>
        {Object.entries(parentLayerTitles).map(([key, value]) => {
          const layerNodes = getLayerNodes(key)

          if (layerNodes.length === 0) {
            return null
          }

          return (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px', gap: '2px' }}>
                <h2 style={{ margin: 0 }}>{t(value)}</h2>
                {key === 'boundaries' && (
                  <IconButton
                    size="small"
                    onClick={() => setBoundariesInfoOpen((v) => !v)}
                    aria-label={t('read_more')}
                    aria-expanded={boundariesInfoOpen}
                  >
                    <InfoOutlined sx={{ fontSize: '1rem' }} />
                  </IconButton>
                )}
              </div>
              {key === 'boundaries' && (
                <div className={styles['boundaries-info-panel']}>
                  <InfoPanel isOpen={boundariesInfoOpen} listKey="info_text.boundaries_items" />
                </div>
              )}
              {layerNodes}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
