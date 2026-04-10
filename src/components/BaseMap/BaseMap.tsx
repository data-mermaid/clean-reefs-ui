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
  Marker,
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
  LngLat,
  MapMouseEvent,
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
  getAllYearZonalStats,
} from '../../utils/mapUtils'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'
import { Snackbar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  mapFitBoundsDesktopConfig,
  mapFitBoundsMobileConfig,
  oceanClickMarkerColor,
  polygonOutlineHoverColor,
  polygonOutlineSelectColor,
} from '../../constants'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { LayerInfo } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import { transparent } from '../../data/mapData'
import { defaultGlobalRegionOption, regionOptions } from '../../data/regionData'
import crosshairCursorUrl from '../../assets/crosshair-cursor.svg?url'

const plumeCrosshairCursor = `url("${crosshairCursorUrl}") 10 10, crosshair`

const getRegionByLabel = (regionLabel) => regionOptions.find((opt) => opt.label === regionLabel)

const buildBreadcrumb = (
  featureProperties: Record<string, unknown> | null | undefined,
  subRegion: RegionOption,
): { breadcrumb: RegionOption[]; addtlRegion: RegionOption | undefined } => {
  const countryOrRegion = featureProperties?.TERRITORY1 || featureProperties?.REALM
  const addtlRegion = getRegionByLabel(countryOrRegion)
  const breadcrumb: RegionOption[] = [defaultGlobalRegionOption]
  if (addtlRegion) {
    breadcrumb.push(addtlRegion)
  }
  breadcrumb.push(subRegion)
  return { breadcrumb, addtlRegion }
}

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

interface HandleMapClickParamProps {
  map: maplibregl.Map
  watershedLayer: LayerInfo
  selectedYear: number
  setClickedPlumePoint: (point: { lng: number; lat: number } | null) => void
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
}

const handleMapClick = async (e: MapMouseEvent, clickParams: HandleMapClickParamProps) => {
  const { map, watershedLayer, selectedYear, setClickedPlumePoint, setBreadcrumb } = clickParams
  const { setTopPolygonsFill } = useMapStore.getState()
  const { setSelectedPlumeWatershedStats } = useSelectedFeatureStore.getState()
  const { clearSelectedFeature } = useSelectedFeatureStore.getState()

  clearSelectedFeature()
  setClickedPlumePoint({ lng: e.lngLat.lng, lat: e.lngLat.lat })

  const currentAllYearZonalStats = await getAllYearZonalStats(e.lngLat)
  setSelectedPlumeWatershedStats(currentAllYearZonalStats)

  const currentYearZonalStats = currentAllYearZonalStats[selectedYear]
  const topContributingWatershedIds: number[] = []

  for (let i = 2; i < 5; i++) {
    const watershedId = currentYearZonalStats[`band_${i}`]?.majority
    if (typeof watershedId === 'number' && topContributingWatershedIds.indexOf(watershedId) < 0) {
      topContributingWatershedIds.push(watershedId)
    }
  }

  // TODO: replace with topContributingWatershedIds when real stats are available
  const exampleTopWatershedIds = [974529, 977314, 977908]

  const watershedFeatures = map.querySourceFeatures(watershedLayer.sourceId, {
    sourceLayer: watershedLayer.sourceFileName,
    filter: ['in', ['get', 'watershed_id'], ['literal', exampleTopWatershedIds]],
  })
  const { breadcrumb } = buildBreadcrumb(watershedFeatures[0]?.properties, {
    id: 'plume',
    regionType: 'plume',
    label: 'Plume',
    centerCoord: new LngLat(e.lngLat.lng, e.lngLat.lat),
    zoomLevel: map.getZoom(),
    grouping: 3,
  })

  setBreadcrumb(breadcrumb)
  setTopPolygonsFill('watershed', exampleTopWatershedIds) //TODO: replace with topContributingWatershedIds when real stats are available
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

// Transparent fill layer so mousemove/mouseleave fire over the full plume area,
// not just the outline stroke. Line layer preserves the visual yellow outline.
function PlumeLayers({ layer, index }) {
  return (
    <Source
      id={layer.sourceId}
      key={`${layer.sourceId}-source`}
      type="vector"
      url={`pmtiles://${layer.link}`}
    >
      <Layer
        id={layer.layerId}
        type="fill"
        key={`${layer.layerId}-fill-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId="watershed"
        layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
        paint={{ 'fill-color': transparent }}
      />
      <Layer
        id={`${layer.layerId}-lines`}
        type="line"
        key={`${layer.layerId}-lines-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId="watershed"
        layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
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
  selectedYear: number
  hasExplicitViewState: boolean
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
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
  selectedYear,
  hasExplicitViewState,
  setBreadcrumb,
  initialViewState,
  onMapMoveEnd,
}: BaseMapProps) {
  const { t } = useTranslation()
  const { isDesktopWidth } = useResponsive()

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [clickedPlumePoint, setClickedPlumePoint] = useState<{
    lng: number
    lat: number
  } | null>(null)
  const mapRef = useRef<MapRef | null>(useMapStore((s) => s.mapReference))
  const setMapRef = useMapStore((s) => s.setMapRef)

  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({})
  const polygonHoverRef = useRef<string | number | null>(null)
  const polygonClickRef = useRef<string | number | null>(null)
  const polygonHoverBoundRef = useRef<((e) => void) | null>(null)
  const polygonClickBoundRef = useRef<((e) => void) | null>(null)

  const mapLayersLoadingError = useMemo(() => {
    return Object.keys(layerErrors).length > 0
  }, [layerErrors])

  const clearTopPolygonsFill = useMapStore((s) => s.clearTopPolygonsFill)
  const clearSelectedPlumeWatershedStats = useSelectedFeatureStore(
    (s) => s.clearSelectedPlumeWatershedStats,
  )

  const clearPlumeSelection = useCallback(() => {
    setClickedPlumePoint(null)
    clearTopPolygonsFill('watershed')
    clearSelectedPlumeWatershedStats()
  }, [clearTopPolygonsFill, clearSelectedPlumeWatershedStats])

  const setSelectedFeature = useSelectedFeatureStore((s) => s.setSelectedFeature)
  const handleFeatureSelect = useCallback(
    (
      feature: MapGeoJSONFeature | null,
      bounds?: LngLatBounds,
      options?: { skipFitBounds?: boolean },
    ) => {
      setSelectedFeature(feature)
      clearPlumeSelection()

      if (feature && bounds) {
        const map = mapRef.current?.getMap()

        if (map) {
          // Breadcrumb: Global > [Country] > Watershed
          // Country is omitted if it can't be determined from the feature
          const { breadcrumb, addtlRegion } = buildBreadcrumb(feature.properties, {
            id: 'watershed',
            regionType: 'watershed',
            label: 'Watershed',
            centerCoord: bounds.getCenter(),
            zoomLevel: map.getZoom(),
            grouping: 3,
          })

          setBreadcrumb(breadcrumb)
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
    [
      isDesktopWidth,
      setBreadcrumb,
      setSelectedFeature,
      onRegionChange,
      onWatershedChange,
      clearPlumeSelection,
    ],
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

  const watershedIndex = useMemo(
    () => mapLayers.findIndex((l) => l.layerId === 'watershed'),
    [mapLayers],
  )
  const watershedLayer = watershedIndex >= 0 ? mapLayers[watershedIndex] : undefined

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

  const handleMapLoad = () => {
    setIsMapLoaded(true)

    const map = mapRef.current?.getMap()
    if (!map || !watershedLayer) {
      return
    }

    setMapRef(mapRef.current!)

    // prevent duplicate firing
    if (polygonHoverBoundRef.current) {
      map.off('mousemove', 'watershed', polygonHoverBoundRef.current)
      polygonHoverBoundRef.current = null
    }
    if (polygonClickBoundRef.current) {
      map.off('click', 'watershed', polygonClickBoundRef.current)
      polygonClickBoundRef.current = null
    }

    const onWatershedHover = (e) => {
      polygonHoverHandler(map, e, watershedLayer)
    }
    const onWatershedClick = (e) => {
      polygonClickHandler(map, e, watershedLayer)
    }

    const onPlumeClick = (e) =>
      handleMapClick(e, {
        map,
        watershedLayer,
        selectedYear,
        setClickedPlumePoint,
        setBreadcrumb,
      })

    polygonHoverBoundRef.current = onWatershedHover
    polygonClickBoundRef.current = onWatershedClick
    map.on('click', 'watershed', onWatershedClick)
    map.on('mousemove', 'watershed', onWatershedHover)
    map.on('mouseenter', 'watershed', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'watershed', () => {
      map.getCanvas().style.cursor = ''
      clearPolygonHover(map, polygonHoverRef, watershedLayer)
    })

    map.on('click', 'plumes', onPlumeClick)
    map.on('mousemove', 'plumes', () => {
      map.getCanvas().style.cursor = plumeCrosshairCursor
    })
    map.on('mouseleave', 'plumes', () => {
      map.getCanvas().style.cursor = ''
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
        {clickedPlumePoint && (
          <Marker
            longitude={clickedPlumePoint.lng}
            latitude={clickedPlumePoint.lat}
            anchor="center"
          >
            <div
              style={{
                width: 15,
                height: 15,
                border: `2px solid ${oceanClickMarkerColor}`,
                borderRadius: 5,
                background: 'transparent',
                pointerEvents: 'none',
              }}
            />
          </Marker>
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
          } else if (layer.layerId === 'plumes') {
            return isMapLoaded && <PlumeLayers key={`layer-${index}`} layer={layer} index={index} />
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
