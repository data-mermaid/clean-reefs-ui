import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as maptilersdk from '@maptiler/sdk'
import {
  Layer,
  Map as MapGL,
  MapRef,
  NavigationControl,
  ScaleControl,
  Source,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl, {
  ErrorEvent as MapErrorEvent,
  LngLatBounds,
  MapGeoJSONFeature,
} from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import useResponsive from '../../hooks/useResponsive'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import {
  calculateFeatureBounds,
  clearPolygonHover,
  clearPolygonSelect,
  createPolygonClickHandler,
  createPolygonHoverHandler,
  querySourceFeatureWhenReady,
  setPolygonSelect,
} from '../../utils/mapUtils'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'
import { Snackbar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  mapFitBoundsDesktopConfig,
  mapFitBoundsMobileConfig,
  polygonOutlineHoverColor,
  polygonOutlineSelectColor,
} from '../../constants'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import { transparent } from '../../data/mapData'
import { defaultGlobalRegionOption, regionOptions } from '../../data/regionData'

const getRegionByLabel = (regionLabel) => regionOptions.find((opt) => opt.label === regionLabel)

const handleSourceData = (
  e: SourceDataEvent,
  setLayerErrors: Dispatch<SetStateAction<Record<string, string>>>,
) => {
  const shouldClearError =
    e.isSourceLoaded &&
    !!e.sourceId &&
    e.dataType === 'source' &&
    e.sourceDataType === 'metadata' &&
    !e.error &&
    !e.tile

  if (shouldClearError) {
    setLayerErrors((prev) => {
      const newErrors = { ...prev }
      if (e.sourceId && newErrors[e.sourceId]) {
        delete newErrors[e.sourceId]
      }
      return newErrors
    })
  }
}

const handleError = (
  e: MapErrorEvent,
  setLayerErrors: Dispatch<SetStateAction<Record<string, string>>>,
) => {
  setLayerErrors((prev) => ({
    ...prev,
    [e.type]: e.error?.message || 'Failed to load layer',
  }))
}

function WatershedLayers({ layer, index }) {
  return (
    <Source
      id={layer.sourceId}
      key={`${layer.sourceId}-source`}
      type="vector"
      promoteId="watershed_id"
      url={`pmtiles://${layer.link}`}
    >
      <Layer
        id={layer.layerId}
        type="fill"
        key={`${layer.layerId}-fill-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId="label_airport"
        layout={{
          visibility: layer.isLayerOn ? 'visible' : 'none',
        }}
        paint={{
          'fill-color': transparent,
          'fill-outline-color': layer.outlineColor,
        }}
      />
      <Layer
        id={`${layer.layerId}-lines`}
        type="line"
        key={`${layer.layerId}-lines-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId="label_airport"
        layout={{
          visibility: layer.isLayerOn ? 'visible' : 'none',
          'line-sort-key': 5,
        }}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4,
            ['boolean', ['feature-state', 'select'], false],
            4,
            1,
          ],
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            polygonOutlineHoverColor,
            ['boolean', ['feature-state', 'select'], false],
            polygonOutlineSelectColor,
            'rgba(0,0,0,0)',
          ],
        }}
      />
    </Source>
  )
}

function PmTileLayers({ layer, index }) {
  return (
    <Source
      id={layer.sourceId}
      key={`${layer.sourceId}-source`}
      type="vector"
      url={`pmtiles://${layer.link}`}
    >
      <Layer
        id={layer.layerId}
        type="line"
        key={`${layer.layerId}-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId="watershed"
        layout={{
          visibility: layer.isLayerOn ? 'visible' : 'none',
        }}
        paint={{
          'line-color': layer.outlineColor,
          'line-dasharray': layer.outlineStyle ? [0, 2, 5] : [2, 0],
        }}
      />
    </Source>
  )
}

interface BaseMapProps {
  mapLayers: LayerInfo[]
  sedExportSubLayerValue: 'pixel' | 'watershed'
  selectedRegion: RegionOption
  onRegionChange: (region: RegionOption) => void
  onWatershedChange: (id: string | null) => void
  initialWatershedId: string | null
  hasExplicitViewState: boolean
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  showLabels: boolean
  initialViewState: {
    longitude: number
    latitude: number
    zoom: number
  }
  onMapMoveEnd: (viewState: { latitude: number; longitude: number; zoom: number }) => void
}

export default function BaseMap({
  mapLayers,
  sedExportSubLayerValue,
  selectedRegion,
  onRegionChange,
  onWatershedChange,
  initialWatershedId,
  hasExplicitViewState,
  setBreadcrumb,
  showLabels,
  initialViewState,
  onMapMoveEnd,
}: BaseMapProps) {
  const { t } = useTranslation()
  const { isDesktopWidth } = useResponsive()

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const mapRef = useRef<MapRef | null>(useMapStore.getState().mapReference)
  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({})
  const polygonHoverRef = useRef<string | number | null>(null)
  const polygonClickRef = useRef<string | number | null>(null)
  const polygonHoverBoundRef = useRef<((e) => void) | null>(null)
  const polygonClickBoundRef = useRef<((e) => void) | null>(null)

  const mapLayersLoadingError = useMemo(() => {
    return Object.keys(layerErrors).length > 0
  }, [layerErrors])

  const setSelectedFeature = useSelectedFeatureStore((s) => s.setSelectedFeature)

  const handleFeatureSelect = useCallback(
    (
      feature: MapGeoJSONFeature | null,
      bounds?: LngLatBounds,
      options?: { skipFitBounds?: boolean },
    ) => {
      setSelectedFeature(feature)

      if (feature && bounds) {
        const map = mapRef.current?.getMap()

        if (map) {
          // TODO: for plume, use different property lookup
          const countryOrRegion = feature.properties.TERRITORY1 || feature.properties.REALM

          const addtlRegion: RegionOption | undefined = getRegionByLabel(countryOrRegion)
          const subRegionWithUpdatedConfig: RegionOption = {
            id: 'watershed',
            regionType: 'watershed',
            label: 'Watershed',
            centerCoord: bounds.getCenter(),
            zoomLevel: map.getZoom(),
            grouping: 3,
          }

          // Breadcrumb: Global > [Country] > Watershed
          // Country is omitted if it can't be determined from the feature
          const updatedRegions: RegionOption[] = [defaultGlobalRegionOption]
          if (addtlRegion) {
            updatedRegions.push(addtlRegion)
          }
          updatedRegions.push(subRegionWithUpdatedConfig)

          setBreadcrumb(updatedRegions)
          if (addtlRegion) {
            onRegionChange(addtlRegion)
          }

          // Sync watershed ID to URL
          const featureWatershedId = feature.id != null ? String(feature.id) : null
          onWatershedChange(featureWatershedId)

          // Skip fitBounds when restoring from URL with explicit lat/lng/zoom
          if (!options?.skipFitBounds) {
            const config = isDesktopWidth ? mapFitBoundsDesktopConfig : mapFitBoundsMobileConfig
            map.fitBounds(bounds, {
              padding: config.padding,
              maxZoom: config.maxZoom,
              duration: 800,
            })
          }
        }
      }
    },
    [isDesktopWidth, setBreadcrumb, setSelectedFeature, onRegionChange, onWatershedChange],
  )

  const polygonHoverHandler = useMemo(() => createPolygonHoverHandler(polygonHoverRef), [])
  const polygonClickHandler = useMemo(
    () => createPolygonClickHandler(polygonClickRef, handleFeatureSelect),
    [handleFeatureSelect],
  )

  const handleMoveEnd = useCallback(
    (e) => {
      onMapMoveEnd(e.viewState)
    },
    [onMapMoveEnd],
  )

  if (
    !import.meta.env.VITE_MAPTILER_API_KEY ||
    import.meta.env.VITE_MAPTILER_API_KEY.trim() === ''
  ) {
    throw new Error(
      'Missing or empty API key: VITE_MAPTILER_API_KEY. Please set it in your environment variables.',
    )
  }
  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY

  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    maplibregl.addProtocol('cog', cogProtocol)

    return () => {
      maplibregl.removeProtocol('pmtiles')
      maplibregl.removeProtocol('cog')
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current?.getMap()

    const jumpOptions = {
      center: selectedRegion.centerCoord,
      zoom: selectedRegion.zoomLevel,
      bearing: 0,
    }
    map?.jumpTo(jumpOptions)
  }, [selectedRegion])

  useEffect(() => {
    if (!isMapLoaded) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const onError = (e) => handleError(e, setLayerErrors)
    const onSourceData = (e) => handleSourceData(e, setLayerErrors)

    map.on('error', onError)
    map.on('sourcedata', onSourceData)

    // eslint-disable-next-line consistent-return
    return () => {
      map.off('error', onError)
      map.off('sourcedata', onSourceData)
    }
  }, [isMapLoaded])

  // Toggle visibility of all symbol (label) layers in the basemap style when showLabels changes.
  // Re-registers on style.load so the setting survives basemap style switches.
  useEffect(() => {
    if (!isMapLoaded) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const applyLabelVisibility = () => {
      const visibility = showLabels ? 'visible' : 'none'
      map
        .getStyle()
        ?.layers.filter((l) => l.type === 'symbol')
        .forEach((l) => map.setLayoutProperty(l.id, 'visibility', visibility))
    }

    applyLabelVisibility()
    map.on('style.load', applyLabelVisibility)
    // eslint-disable-next-line consistent-return
    return () => {
      map.off('style.load', applyLabelVisibility)
    }
  }, [isMapLoaded, showLabels])

  const watershedIndex = useMemo(
    () => mapLayers.findIndex((l) => l.layerId === 'watershed'),
    [mapLayers],
  )
  const watershedLayer = watershedIndex >= 0 ? mapLayers[watershedIndex] : undefined

  // When selectedFeature is cleared externally (e.g., dropdown region change),
  // remove the visual highlight from the map.
  const selectedFeature = useSelectedFeatureStore((s) => s.selectedFeature)
  useEffect(() => {
    if (!selectedFeature && polygonClickRef.current && isMapLoaded) {
      const map = mapRef.current?.getMap()
      if (map && watershedLayer) {
        clearPolygonSelect(map, polygonClickRef, watershedLayer)
      }
    }
  }, [selectedFeature, isMapLoaded, watershedLayer])

  // Watershed restoration from URL
  useEffect(() => {
    if (!isMapLoaded || !initialWatershedId || !watershedLayer) {
      return undefined
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return undefined
    }

    // watershed_id is numeric in tile data. Parse to number to match
    // the promoted feature ID used by MapLibre for setFeatureState.
    const featureId = isNaN(Number(initialWatershedId))
      ? initialWatershedId
      : Number(initialWatershedId)

    return querySourceFeatureWhenReady(
      map,
      watershedLayer.sourceId,
      watershedLayer.sourceFileName,
      ['==', ['get', 'watershed_id'], Number(initialWatershedId)],
      (feature) => {
        if (!feature) {
          onWatershedChange(null)
          return
        }

        // querySourceFeatures doesn't set 'source' on returned features
        // (unlike click events). Charts need it to identify the data source.
        if (!feature.source) {
          feature.source = watershedLayer.sourceId
        }

        setPolygonSelect(map, polygonClickRef, watershedLayer, featureId)

        const bounds = calculateFeatureBounds(feature)
        handleFeatureSelect(feature, bounds, {
          skipFitBounds: hasExplicitViewState,
        })
      },
    )
    // handleFeatureSelect and onWatershedChange intentionally omitted
    // initialWatershedId is stable (captured once at mount) so this effect only runs once when the map loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, initialWatershedId, watershedLayer, hasExplicitViewState])

  const benthicFillColors = useMapStore((s) => s.benthicMapSubLayerColors)
  const benthicSubLayerFillExpression = useMemo(
    () => [
      'case',
      ['==', ['get', 'class_name'], 'Coral/Algae'],
      benthicFillColors['coral_algae'],
      ['==', ['get', 'class_name'], 'Benthic Microalgae'],
      benthicFillColors['microalgal_mats'],
      ['==', ['get', 'class_name'], 'Rock'],
      benthicFillColors['rock'],
      ['==', ['get', 'class_name'], 'Rubble'],
      benthicFillColors['rubble'],
      ['==', ['get', 'class_name'], 'Sand'],
      benthicFillColors['sand'],
      ['==', ['get', 'class_name'], 'Seagrass'],
      benthicFillColors['seagrass'],
      transparent, // Default / other
    ],
    [benthicFillColors],
  )

  useEffect(() => {
    if (mapRef.current) {
      useMapStore.getState().setMapRef(mapRef.current)
    }
  }, [isMapLoaded])

  const handleMapLoad = () => {
    setIsMapLoaded(true)

    const map = mapRef.current?.getMap()
    if (!map || !watershedLayer) {
      return
    }

    // prevent duplicate firing
    if (polygonHoverBoundRef.current) {
      map.off('mousemove', 'watershed', polygonHoverBoundRef.current)
      polygonHoverBoundRef.current = null
    }
    if (polygonClickBoundRef.current) {
      map.off('click', 'watershed', polygonClickBoundRef.current)
      polygonClickBoundRef.current = null
    }

    const hoverBound = (e) => {
      polygonHoverHandler(map, e, watershedLayer)
    }
    const clickBound = (e) => {
      polygonClickHandler(map, e, watershedLayer)
    }

    polygonHoverBoundRef.current = hoverBound
    polygonClickBoundRef.current = clickBound
    map.on('mousemove', 'watershed', hoverBound)
    map.on('click', 'watershed', clickBound)
    map.on('mouseenter', 'watershed', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'watershed', () => {
      map.getCanvas().style.cursor = ''
      clearPolygonHover(map, polygonHoverRef, watershedLayer)
    })
  }

  return (
    <div className={styles['map-wrap']}>
      {!isMapLoaded && <LoadingState isOverlay={true} />}
      <MapGL
        id="satellite-map"
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialViewState={initialViewState}
        mapStyle={`https://api.maptiler.com/maps/basic/style.json?key=${apiKey}`}
        onLoad={() => handleMapLoad()}
        onMoveEnd={handleMoveEnd}
        attributionControl={false}
      >
        {isDesktopWidth && (
          <>
            <ScaleControl position="bottom-right" />
            <NavigationControl position="bottom-right" showCompass={false} />
          </>
        )}
        {/* Watershed always rendered first so other layers can reference it via beforeId */}
        {isMapLoaded && watershedLayer && (
          <WatershedLayers
            key={`layer-${watershedIndex}`}
            layer={watershedLayer}
            index={watershedIndex}
          />
        )}
        {mapLayers.map((layer: LayerInfo, index) => {
          if (layer.layerId === 'watershed') {
            return null // rendered above, always present
          } else if (layer.dataType === 'pmtiles') {
            return (
              isMapLoaded && <PmTileLayers key={`layer-${index}`} layer={layer} index={index} />
            )
          } else if (layer.dataType === 'cog') {
            const shouldRenderSedExportRaster =
              layer.layerId !== 'sed_export' || sedExportSubLayerValue === 'pixel'

            return (
              isMapLoaded &&
              layer.isLayerOn &&
              shouldRenderSedExportRaster && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}-${index}`}
                  type="raster"
                  url={`cog://${layer.link}`}
                  tileSize={256}
                  maxzoom={16}
                  minzoom={6}
                >
                  <Layer
                    id={layer.layerId}
                    type="raster"
                    key={`${layer.layerId}-${index}`}
                    source={layer.sourceId}
                    beforeId="sed_dispersal"
                  />
                </Source>
              )
            )
          } else if (layer.dataType === 'rastertiles') {
            return (
              isMapLoaded && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}-${index}`}
                  type="raster"
                  tiles={[layer.link]}
                  tileSize={256}
                  maxzoom={16}
                  minzoom={6}
                >
                  <Layer
                    id={layer.layerId}
                    type="raster"
                    key={`${layer.layerId}-${index}`}
                    source={layer.sourceId}
                    beforeId="watershed"
                    layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
                  />
                </Source>
              )
            )
          } else {
            //other should just be 'vectortiles'
            return (
              isMapLoaded && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}-${index}`}
                  type="vector"
                  tiles={[layer.link]}
                  maxzoom={22}
                  minzoom={0}
                >
                  <Layer
                    id={layer.layerId}
                    type="fill"
                    key={`${layer.layerId}-${index}`}
                    source={layer.sourceId}
                    source-layer={layer.sourceFileName}
                    beforeId="watershed"
                    layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
                    paint={{
                      // @ts-expect-error - doesn't like fill-color being a string?
                      'fill-color': benthicSubLayerFillExpression,
                    }}
                  />
                </Source>
              )
            )
          }
        })}
      </MapGL>

      <Snackbar
        open={mapLayersLoadingError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={t('map_layers_did_not_load')}
        action={
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 'normal',
              paddingRight: '10px',
            }}
            onClick={() => window.location.reload()}
          >
            {t('buttons.reload_page')}
          </button>
        }
      />
    </div>
  )
}
