import React, {
  Dispatch,
  RefObject,
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
  MapLayerMouseEvent,
} from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import useResponsive from '../../hooks/useResponsive'
import { usePrevious } from '../../hooks/usePrevious'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import {
  calculateFeatureBounds,
  clearPolygonHover,
  clearPolygonSelect,
  createPolygonClickHandler,
  createPolygonHoverHandler,
  querySourceFeatureWhenReady,
  querySourceFeatureAtPointWhenReady,
  setPolygonSelect,
  getAllYearZonalStats,
  buildBenthicFillExpression,
  resolveBasemapBeforeId,
} from '../../utils/mapUtils'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'
import { CircularProgress, Snackbar, SnackbarContent } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  mapFitBoundsDesktopConfig,
  mapFitBoundsMobileConfig,
  polygonHighlightWidth,
  polygonOutlineHoverColor,
  polygonOutlineSelectColor,
  SNACKBAR_BOTTOM_GAP,
  TRENDS_DRAWER_PEEK_HEIGHT,
} from '../../constants'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { LayerInfo, ZonalStatsBand } from '../../types/MapDataTypes'
import { useMapStore } from '../../stores/mapStore'
import { transparent } from '../../data/mapData'
import { defaultGlobalRegionOption, regionOptions } from '../../data/regionData'
import crosshairCursorUrl from '../../assets/crosshair-cursor.svg?url'

const plumeCrosshairCursor = `url("${crosshairCursorUrl}") 10 10, crosshair`

interface ApplyPlumeStatsParams {
  map: maplibregl.Map
  watershedLayer: LayerInfo
  point: { lng: number; lat: number }
  allYearStats: Record<number, ZonalStatsBand>
  selectedYear: number
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  onRegionChange: (region: RegionOption) => void
}

interface HandleMapClickParamProps {
  map: maplibregl.Map
  watershedLayer: LayerInfo
  selectedYear: number
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  onDispersalPointChange: (point: { lat: number; lng: number } | null) => void
  onWatershedSelectionClear: () => void
  requestIdRef: RefObject<number>
  onRegionChange: (region: RegionOption) => void
}

interface BaseMapProps {
  mapLayers: LayerInfo[]
  sedExportSubLayerValue: 'pixel' | 'watershed'
  onRegionChange: (region: RegionOption) => void
  onWatershedChange: (id: string | null) => void
  onWatershedSelectionClear: () => void
  onDispersalPointChange(point: { lat: number; lng: number } | null): void
  onPlumeSelectionClear: () => void
  initialWatershedId: string | null
  initialDispersalPoint: { lat: number; lng: number } | null
  dispersalPoint: { lat: number; lng: number } | null
  selectedYear: number
  hasExplicitViewState: boolean
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  initialViewState: {
    longitude: number
    latitude: number
    zoom: number
  }
  onMapMoveEnd: (viewState: { latitude: number; longitude: number; zoom: number }) => void
  isAnyDrawerOpen: boolean
}

const getRegionByLabel = (regionLabel: string | undefined) =>
  regionOptions.find((opt) => opt.label === regionLabel)

const buildBreadcrumb = (
  featureProperties: Record<string, unknown> | null | undefined,
  subRegion: RegionOption,
): { breadcrumb: RegionOption[]; addtlRegion: RegionOption | undefined } => {
  const countryOrRegion = (featureProperties?.TERRITORY1 || featureProperties?.REALM) as
    | string
    | undefined
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

const applyPlumeStats = ({
  map,
  watershedLayer,
  point,
  allYearStats,
  selectedYear,
  setBreadcrumb,
  onRegionChange,
}: ApplyPlumeStatsParams): void => {
  const { setTopPolygonsFill } = useMapStore.getState()
  const { setSelectedPlumeWatershedStats } = useSelectedFeatureStore.getState()

  setSelectedPlumeWatershedStats(allYearStats)

  const currentYearZonalStats = allYearStats[selectedYear]
  const topContributingWatershedIds: number[] = []

  for (let i = 2; i < 5; i++) {
    const watershedId = currentYearZonalStats[`band_${i}`]?.majority
    if (typeof watershedId === 'number' && topContributingWatershedIds.indexOf(watershedId) < 0) {
      topContributingWatershedIds.push(watershedId)
    }
  }

  const watershedFeatures = map.querySourceFeatures(watershedLayer.sourceId, {
    sourceLayer: watershedLayer.sourceFileName,
    filter: ['in', ['get', 'watershed_id'], ['literal', topContributingWatershedIds]],
  })
  const { breadcrumb, addtlRegion } = buildBreadcrumb(watershedFeatures[0]?.properties, {
    id: 'plume',
    regionType: 'plume',
    label: 'Plume',
    centerCoord: new LngLat(point.lng, point.lat),
    zoomLevel: map.getZoom(),
  })

  setBreadcrumb(breadcrumb)
  // Sync the parent region (e.g. country) to the URL so the up-one-level button
  // has a valid target to fall back to once the plume/watershed is cleared.
  if (addtlRegion) {
    onRegionChange(addtlRegion)
  }
  setTopPolygonsFill('watershed', topContributingWatershedIds)
}

const handleMapClick = async (e: MapMouseEvent, clickParams: HandleMapClickParamProps) => {
  const {
    map,
    watershedLayer,
    selectedYear,
    setBreadcrumb,
    onDispersalPointChange,
    onWatershedSelectionClear,
    requestIdRef,
    onRegionChange,
  } = clickParams

  onWatershedSelectionClear()
  onDispersalPointChange({ lng: e.lngLat.lng, lat: e.lngLat.lat })

  const requestId = ++requestIdRef.current
  const allYearStats = await getAllYearZonalStats(e.lngLat)

  if (requestId !== requestIdRef.current) {
    return
  }

  applyPlumeStats({
    map,
    watershedLayer,
    point: e.lngLat,
    allYearStats,
    selectedYear,
    setBreadcrumb,
    onRegionChange,
  })
}

function WatershedLayers({ layer, index, beforeId }: { layer; index; beforeId?: string }) {
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
        beforeId={beforeId}
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
        beforeId={beforeId}
        layout={{
          visibility: layer.isLayerOn ? 'visible' : 'none',
          'line-sort-key': 5,
        }}
        paint={{
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            polygonHighlightWidth,
            ['boolean', ['feature-state', 'select'], false],
            polygonHighlightWidth,
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
function PlumeLayers({ layer, index, beforeId }: { layer; index; beforeId?: string }) {
  return (
    <Source
      id={layer.sourceId}
      key={`${layer.sourceId}-source`}
      type="vector"
      promoteId="watershed_id"
      url={`pmtiles://${layer.link}`}
    >
      <Layer
        id={`${layer.sourceId}-lines`}
        type="line"
        key={`${layer.sourceId}-lines-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId={beforeId}
        layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
        paint={{
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'select'], false],
            polygonOutlineSelectColor,
            layer.outlineColor,
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'select'], false],
            polygonHighlightWidth,
            1,
          ],
        }}
      />
      <Layer
        id={layer.sourceId}
        type="fill"
        key={`${layer.sourceId}-fill-${index}`}
        source={layer.sourceId}
        source-layer={layer.sourceFileName}
        beforeId={beforeId}
        layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
        paint={{ 'fill-color': transparent }}
      />
    </Source>
  )
}

export default function BaseMap({
  mapLayers,
  sedExportSubLayerValue,
  onRegionChange,
  onWatershedChange,
  onWatershedSelectionClear,
  onDispersalPointChange,
  onPlumeSelectionClear,
  initialWatershedId,
  initialDispersalPoint,
  dispersalPoint,
  selectedYear,
  hasExplicitViewState,
  setBreadcrumb,
  initialViewState,
  onMapMoveEnd,
  isAnyDrawerOpen,
}: BaseMapProps) {
  const { t } = useTranslation()
  const { isDesktopWidth, isMobileWidth } = useResponsive()

  const setMapRef = useMapStore((s) => s.setMapRef)
  const benthicFillColors = useMapStore((s) => s.benthicMapSubLayerColors)
  const setSelectedFeature = useSelectedFeatureStore((s) => s.setSelectedFeature)
  const selectedFeature = useSelectedFeatureStore((s) => s.selectedFeature)

  const mapRef = useRef<MapRef | null>(useMapStore((s) => s.mapReference))
  const polygonHoverRef = useRef<string | number | null>(null)
  const polygonClickRef = useRef<string | number | null>(null)
  const polygonHoverBoundRef = useRef<((e) => void) | null>(null)
  const polygonClickBoundRef = useRef<((e) => void) | null>(null)
  const plumeRequestIdRef = useRef(0) // Tracks the latest plume click fetch so earlier, slower responses don't overwrite newer ones.
  // Latest-ref pattern: written every render so MapLibre closures registered once (e.g. onPlumeClick)
  // always read the current value without needing to re-register the listener.
  const selectedYearRef = useRef<number>(selectedYear)
  selectedYearRef.current = selectedYear
  const dispersalPointRef = useRef(dispersalPoint)
  dispersalPointRef.current = dispersalPoint
  const plumeClickRef = useRef<string | number | null>(null)
  const plumeLayerRef = useRef<typeof plumeLayer>(undefined)
  const plumeRestorationRanRef = useRef(false)

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [basemapBeforeId, setBasemapBeforeId] = useState<string | undefined>(undefined)
  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({})
  const [isLoadingTiles, setIsLoadingTiles] = useState(false)
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)

  const mapLayersLoadingError = useMemo(() => Object.keys(layerErrors).length > 0, [layerErrors])
  const showLoading = showLoadingIndicator && !(isMobileWidth && isAnyDrawerOpen)

  const watershedLayer = useMemo(
    () => mapLayers.find((l) => l.layerId === 'watershed'),
    [mapLayers],
  )
  const watershedIndex = watershedLayer ? mapLayers.indexOf(watershedLayer) : -1
  const plumeLayer = useMemo(
    () =>
      mapLayers.find((l) => l.layerId === 'plumes' && l.isLayerOn) ??
      mapLayers.find((l) => l.layerId === 'plumes'),
    [mapLayers],
  )

  plumeLayerRef.current = plumeLayer
  const benthicLayer = useMemo(() => mapLayers.find((l) => l.layerId === 'benthic'), [mapLayers])
  const previousPlumeLayer = usePrevious(plumeLayer)
  const benthicSubLayerFillExpression = useMemo(
    () => buildBenthicFillExpression(benthicFillColors),
    [benthicFillColors],
  )

  const clearPlumeSelection = useCallback(() => {
    plumeRequestIdRef.current += 1 // Prevent a stale plume response from applying if the fetch resolves after this selection is cleared.

    const map = mapRef.current?.getMap()
    // Read from ref so this callback never goes stale when plumeLayer changes (e.g. on year switch).
    // onWatershedClick in handleMapLoad captures polygonClickHandler once; without the ref the
    // clearPolygonSelect call would target the wrong year's source after a year change.
    if (map && plumeLayerRef.current) {
      clearPolygonSelect(map, plumeClickRef, plumeLayerRef.current)
    }

    onPlumeSelectionClear()
  }, [onPlumeSelectionClear])

  const handleFeatureSelect = useCallback(
    (
      feature: MapGeoJSONFeature | null,
      bounds?: LngLatBounds,
      options?: { skipFitBounds?: boolean },
    ) => {
      clearPlumeSelection()
      setSelectedFeature(feature)

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
          })

          setBreadcrumb(breadcrumb)
          // Sync the parent region (e.g. country) to the URL so the up-one-level button
          // has a valid target to fall back to once the plume/watershed is cleared.
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

  // Re-apply plume watershed stats when the year changes while a plume is active.
  // dispersalPoint and selectedPlumeWatershedStats are intentionally read via refs/store
  // so this effect only fires on year changes, not on every plume click.
  useEffect(() => {
    if (!isMapLoaded || !watershedLayer) {
      return
    }
    const currentDispersalPoint = dispersalPointRef.current
    if (!currentDispersalPoint) {
      return
    }
    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }
    const plumeStats = useSelectedFeatureStore.getState().selectedPlumeWatershedStats
    if (!plumeStats) {
      return
    }

    applyPlumeStats({
      map,
      watershedLayer,
      point: currentDispersalPoint,
      allYearStats: plumeStats,
      selectedYear,
      setBreadcrumb,
      onRegionChange,
    })
  }, [selectedYear, isMapLoaded, watershedLayer, setBreadcrumb, onRegionChange])

  // Re-apply plume outline selection when plume layer/source is (re)available.
  useEffect(() => {
    if (!isMapLoaded || !plumeLayer) {
      return
    }

    const map = mapRef.current?.getMap()
    const selectedPlumeId = plumeClickRef.current
    if (!map || selectedPlumeId == null) {
      return
    }

    // Clear the highlighted polygon from the previous plume layer before reselecting on the new one.
    // Guard with getSource so we don't throw if the previous source was already unmounted (e.g. on year change).
    if (
      previousPlumeLayer &&
      previousPlumeLayer.sourceId !== plumeLayer.sourceId &&
      map.getSource(previousPlumeLayer.sourceId)
    ) {
      clearPolygonSelect(map, plumeClickRef, previousPlumeLayer)
    }

    const plumeFeatureId = isNaN(Number(selectedPlumeId))
      ? selectedPlumeId
      : Number(selectedPlumeId)

    setPolygonSelect(map, plumeClickRef, plumeLayer, plumeFeatureId)
  }, [isMapLoaded, plumeLayer, mapLayers, previousPlumeLayer])

  useEffect(() => {
    if (!isMapLoaded) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const onError = (e) => setTimeout(() => handleError(e, setLayerErrors), 0)
    const onSourceData = (e: SourceDataEvent) =>
      setTimeout(() => handleSourceData(e, setLayerErrors), 0)
    const onSourceDataLoading = () => setTimeout(() => setIsLoadingTiles(true), 0)
    const onIdle = () => setTimeout(() => setIsLoadingTiles(false), 0)

    map.on('error', onError)
    map.on('sourcedata', onSourceData)
    map.on('sourcedataloading', onSourceDataLoading)
    map.on('idle', onIdle)

    // eslint-disable-next-line consistent-return
    return () => {
      map.off('error', onError)
      map.off('sourcedata', onSourceData)
      map.off('sourcedataloading', onSourceDataLoading)
      map.off('idle', onIdle)
    }
  }, [isMapLoaded])

  // 1s debounce: avoid flashing the indicator on fast loads.
  useEffect(() => {
    if (!isLoadingTiles) {
      setShowLoadingIndicator(false)
      return undefined
    }
    const timer = setTimeout(() => setShowLoadingIndicator(true), 1000)
    return () => clearTimeout(timer)
  }, [isLoadingTiles])

  // When selectedFeature is cleared externally (e.g., dropdown region change),
  // remove the watershed visual highlight from the map.
  useEffect(() => {
    if (!selectedFeature && polygonClickRef.current && isMapLoaded) {
      const map = mapRef.current?.getMap()
      if (map && watershedLayer) {
        clearPolygonSelect(map, polygonClickRef, watershedLayer)
      }
    }
  }, [selectedFeature, isMapLoaded, watershedLayer])

  // Clear plume outline selection when plume context is cleared (e.g., region change).
  useEffect(() => {
    if (!isMapLoaded || dispersalPoint) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map || !plumeLayer || !plumeClickRef.current) {
      return
    }

    clearPolygonSelect(map, plumeClickRef, plumeLayer)
  }, [dispersalPoint, isMapLoaded, plumeLayer])

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

  // Plume restoration from URL
  useEffect(() => {
    if (
      plumeRestorationRanRef.current ||
      !isMapLoaded ||
      !initialDispersalPoint ||
      !watershedLayer ||
      !plumeLayer
    ) {
      return undefined
    }

    plumeRestorationRanRef.current = true

    const map = mapRef.current?.getMap()
    if (!map) {
      return undefined
    }

    // Validate the dispersal point falls within the plume source, retrying as tiles stream in.
    // Uses querySourceFeatures (viewport-independent) to avoid clearing valid URL params that
    // are off-screen at load time, or before PMTiles have finished loading.
    return querySourceFeatureAtPointWhenReady(
      map,
      plumeLayer.sourceId,
      plumeLayer.sourceFileName,
      initialDispersalPoint,
      (feature) => {
        if (!feature) {
          onDispersalPointChange(null)
          return
        }

        // Guard against race condition: skip if the user already clicked a new plume
        if (plumeClickRef.current == null) {
          const currentPlumeLayer = plumeLayerRef.current
          const restoredId = feature.id
          if (currentPlumeLayer && restoredId != null) {
            const featureId = isNaN(Number(restoredId)) ? restoredId : Number(restoredId)
            setPolygonSelect(map, plumeClickRef, currentPlumeLayer, featureId)
          }
        }

        void (async () => {
          const allYearStats = await getAllYearZonalStats(initialDispersalPoint)
          applyPlumeStats({
            map,
            watershedLayer,
            point: initialDispersalPoint,
            allYearStats,
            selectedYear,
            setBreadcrumb,
            onRegionChange,
          })
        })()
      },
    )
    // onDispersalPointChange, setBreadcrumb, selectedYear intentionally omitted — this effect is for initial restoration only.
    // initialDispersalPoint is stable (captured once at mount) so this effect only runs once when the map loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapLoaded, initialDispersalPoint, watershedLayer, plumeLayer])

  const handleMapLoad = () => {
    const map = mapRef.current?.getMap()
    // Resolve basemapBeforeId BEFORE setIsMapLoaded so the shoreline layer mounts with the
    // correct anchor on its first render. Shoreline anchors to the lowest label so it sits
    // beneath every basemap label; overlays anchor to "shoreline-emphasis" so they always
    // land just below the shoreline.
    if (map) {
      const layers = map.getStyle()?.layers ?? []
      setBasemapBeforeId(resolveBasemapBeforeId(layers))
    }

    setIsMapLoaded(true)

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

    const onWatershedHover = (e: MapLayerMouseEvent) => {
      polygonHoverHandler(map, e, watershedLayer)
    }
    const onWatershedClick = (e: MapLayerMouseEvent) => {
      polygonClickHandler(map, e, watershedLayer)
    }

    const onPlumeClick = (e: MapLayerMouseEvent) => {
      const clickedPlumeFeature = e.features?.[0]
      // feature.id is promoted from properties.watershed_id via promoteId="watershed_id" on the Source
      const clickedPlumeWatershedId = clickedPlumeFeature?.id
      const currentPlumeLayer = plumeLayerRef.current

      if (currentPlumeLayer && clickedPlumeWatershedId != null) {
        const currentFeatureId = isNaN(Number(clickedPlumeWatershedId))
          ? clickedPlumeWatershedId
          : Number(clickedPlumeWatershedId)

        clearPolygonSelect(map, plumeClickRef, currentPlumeLayer)
        setPolygonSelect(map, plumeClickRef, currentPlumeLayer, currentFeatureId)
      }

      handleMapClick(e, {
        map,
        watershedLayer,
        selectedYear: selectedYearRef.current,
        setBreadcrumb,
        onDispersalPointChange,
        onWatershedSelectionClear,
        requestIdRef: plumeRequestIdRef,
        onRegionChange,
      })
    }

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

    // Register click/hover handlers on every plume year's fill layer (sourceId-based IDs).
    // Hidden layers (visibility:'none') do not fire mouse events so only the active year responds.
    mapLayers
      .filter((l) => l.layerId === 'plumes')
      .forEach((pl) => {
        map.on('click', pl.sourceId, onPlumeClick)
        map.on('mousemove', pl.sourceId, () => {
          map.getCanvas().style.cursor = plumeCrosshairCursor
        })
        map.on('mouseleave', pl.sourceId, () => {
          map.getCanvas().style.cursor = ''
        })
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
        mapStyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`}
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
        {dispersalPoint && (
          <Marker longitude={dispersalPoint.lng} latitude={dispersalPoint.lat} anchor="center">
            <div className={styles['plume-marker']} />
          </Marker>
        )}
        {/* Layer visual stack (bottom → top):
            base style → COG (lulc/sed_export) → rastertiles (sed_dispersal/reef_extent)
            → benthic → regions/countries → watershed → plumes → shoreline → map labels
            Shoreline mounts first so it exists as the beforeId anchor for the overlays below. */}
        {isMapLoaded && (
          <Layer
            id="shoreline-emphasis"
            type="line"
            source="maptiler_planet"
            source-layer="water"
            beforeId={basemapBeforeId}
            filter={['==', ['get', 'class'], 'ocean']}
            paint={{
              'line-color': '#000',
              'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 5, 1, 10, 1.75, 15, 2.5],
            }}
          />
        )}
        {isMapLoaded && watershedLayer && (
          <WatershedLayers
            key={`layer-${watershedIndex}`}
            layer={watershedLayer}
            index={watershedIndex}
            beforeId="shoreline-emphasis"
          />
        )}
        {/* Plumes always rendered so tiles stay cached across year switches; visibility toggled
            via layout.visibility. Layer IDs are sourceId-based to avoid collisions across years.
            beforeId="shoreline-emphasis" ensures correct z-ordering (lines first/lower, fill second/higher). */}
        {isMapLoaded &&
          mapLayers
            .filter((l) => l.layerId === 'plumes')
            .map((l, i) => (
              <PlumeLayers key={l.sourceId} layer={l} index={i} beforeId="shoreline-emphasis" />
            ))}
        {/* Benthic rendered before the main loop so rastertile layers can reference it via beforeId.
            beforeId="watershed" places it as the lowest app layer, just below regions/countries */}
        {isMapLoaded && benthicLayer && (
          <Source
            id={benthicLayer.sourceId}
            key={`${benthicLayer.sourceId}-source`}
            type="vector"
            tiles={[benthicLayer.link]}
            maxzoom={22}
            minzoom={0}
          >
            <Layer
              id={benthicLayer.layerId}
              type="fill"
              source={benthicLayer.sourceId}
              source-layer={benthicLayer.sourceFileName}
              beforeId="watershed"
              layout={{ visibility: benthicLayer.isLayerOn ? 'visible' : 'none' }}
              paint={{
                // @ts-expect-error - doesn't like fill-color being a string?
                'fill-color': benthicSubLayerFillExpression,
              }}
            />
          </Source>
        )}
        {mapLayers.map((layer: LayerInfo, index) => {
          if (layer.layerId === 'watershed') {
            return null // rendered above, always present
          } else if (layer.layerId === 'plumes') {
            return null // rendered above, always present
          } else if (layer.layerId === 'benthic') {
            return null // rendered above the loop so it exists as a beforeId anchor for rastertiles
          } else if (layer.dataType === 'pmtiles') {
            return (
              isMapLoaded && <PmTileLayers key={`layer-${index}`} layer={layer} index={index} />
            )
          } else if (layer.dataType === 'cog') {
            const shouldRenderSedExportRaster =
              layer.layerId !== 'sed_export' || sedExportSubLayerValue === 'pixel'

            return (
              isMapLoaded && (
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
                    id={layer.sourceId}
                    type="raster"
                    key={`${layer.sourceId}-${index}`}
                    source={layer.sourceId}
                    beforeId="sediment_exposure_2000"
                    layout={{
                      visibility:
                        layer.isLayerOn && shouldRenderSedExportRaster ? 'visible' : 'none',
                    }}
                  />
                </Source>
              )
            )
          } else if (layer.dataType === 'rastertiles') {
            // Rastertiles sit just below benthic (beforeId="benthic"). All years are always mounted
            // so tiles stay cached; visibility is toggled instead of mounting/unmounting on year change.
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
                    id={layer.sourceId}
                    type="raster"
                    key={`${layer.sourceId}-${index}`}
                    source={layer.sourceId}
                    beforeId="benthic"
                    layout={{ visibility: layer.isLayerOn ? 'visible' : 'none' }}
                  />
                </Source>
              )
            )
          } else {
            // Fallback for any non-benthic vectortile layers; beforeId="watershed" places them below watershed
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
                      'fill-color': transparent,
                    }}
                  />
                </Source>
              )
            )
          }
        })}
      </MapGL>

      <Snackbar
        open={showLoading || mapLayersLoadingError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // Mobile: clear the TrendsDrawer's bottom peek with a small gap.
        sx={{
          '&.MuiSnackbar-root': {
            bottom: isMobileWidth
              ? `${TRENDS_DRAWER_PEEK_HEIGHT + SNACKBAR_BOTTOM_GAP}px`
              : undefined,
          },
        }}
      >
        <div className={styles['snackbar-stack']}>
          {showLoading && (
            <SnackbarContent
              message={
                <span
                  className={styles['loading-snackbar-message']}
                  role="status"
                  aria-live="polite"
                >
                  <CircularProgress size={16} color="inherit" aria-hidden />
                  {t('map_layers_loading')}
                </span>
              }
            />
          )}
          {mapLayersLoadingError && (
            <SnackbarContent
              message={t('map_layers_did_not_load')}
              action={
                <button
                  type="button"
                  className={styles['snackbar-reload-button']}
                  onClick={() => window.location.reload()}
                >
                  {t('buttons.reload_page')}
                </button>
              }
            />
          )}
        </div>
      </Snackbar>
    </div>
  )
}
