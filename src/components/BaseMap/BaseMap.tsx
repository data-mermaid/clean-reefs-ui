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
import { createPolygonClickHandler, createPolygonHoverHandler } from '../../utils/mapUtils'
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
import { regionOptions } from '../../data/regionData'

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
  selectedRegion: RegionOption
  onRegionChange: (region: RegionOption) => void
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
}

export default function BaseMap({
  mapLayers,
  selectedRegion,
  onRegionChange,
  setBreadcrumb,
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
    (feature: MapGeoJSONFeature | null, bounds?: LngLatBounds) => {
      setSelectedFeature(feature)

      if (feature && bounds) {
        const map = mapRef.current?.getMap()

        if (map) {
          //todo: for plume
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
          const updatedRegions: RegionOption[] = [selectedRegion]
          if (addtlRegion) {
            updatedRegions.push(addtlRegion)
          }
          updatedRegions.push(subRegionWithUpdatedConfig)

          setBreadcrumb(updatedRegions)
          onRegionChange(subRegionWithUpdatedConfig)

          const config = isDesktopWidth ? mapFitBoundsDesktopConfig : mapFitBoundsMobileConfig
          map.fitBounds(bounds, {
            padding: config.padding,
            maxZoom: config.maxZoom,
            duration: 800,
          })
        }
      }
    },
    [isDesktopWidth, selectedRegion, setBreadcrumb, setSelectedFeature, onRegionChange],
  )

  const polygonHoverHandler = useMemo(() => createPolygonHoverHandler(polygonHoverRef), [])
  const polygonClickHandler = useMemo(
    () => createPolygonClickHandler(polygonClickRef, handleFeatureSelect),
    [handleFeatureSelect],
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

  const watershedIndex = useMemo(
    () => mapLayers.findIndex((l) => l.layerId === 'watershed'),
    [mapLayers],
  )
  const watershedLayer = watershedIndex >= 0 ? mapLayers[watershedIndex] : undefined

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
    })
  }

  return (
    <div className={styles['map-wrap']}>
      {!isMapLoaded && <LoadingState isOverlay={true} />}
      <MapGL
        id="satellite-map"
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: selectedRegion.centerCoord.lng,
          latitude: selectedRegion.centerCoord.lat,
          zoom: selectedRegion.zoomLevel,
        }}
        mapStyle={`https://api.maptiler.com/maps/basic/style.json?key=${apiKey}`}
        onLoad={() => handleMapLoad()}
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
            return (
              isMapLoaded &&
              layer.isLayerOn && (
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
