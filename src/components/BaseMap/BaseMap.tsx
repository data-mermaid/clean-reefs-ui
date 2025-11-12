import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import maplibregl, { ErrorEvent as MapErrorEvent } from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { LayerInfo } from '../../data/mapData'
import useResponsive from '../../hooks/useResponsive'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import { createPolygonClickHandler, createPolygonHoverHandler } from '../../utils/mapUtils'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'
import { Snackbar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { polygonOutlineHoverColor, polygonOutlineSelectColor } from '../../constants'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'

interface BaseMapProps {
  mapLayers: LayerInfo[]
  selectedRegion: RegionOption
}

export default function BaseMap({ mapLayers, selectedRegion }: BaseMapProps) {
  const { t } = useTranslation()
  const { isDesktopWidth } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLng = 178.4 //Initial location - Fiji
  const defaultLat = -17.816028
  const defaultPoint = [622, 401] //Fiji
  const defaultMapZoom = 10
  const mapRef = useRef<MapRef | null>(null)
  // const currentLngLat = useMemo(() => [defaultLng, defaultLat], [defaultLng, defaultLat])
  // const [, setCurrentLngLat] = useState<[number, number]>([defaultLng, defaultLat])
  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({})
  const polygonHoverRef = useRef<string | number | null>(null)
  const polygonClickRef = useRef<string | number | null>(null)
  const polygonHoverBoundRef = useRef<((e) => void) | null>(null)
  const polygonClickBoundRef = useRef<((e) => void) | null>(null)

  const mapLayersLoadingError = useMemo(() => {
    return Object.keys(layerErrors).length > 0
  }, [layerErrors])

  const setSelectedFeature = useSelectedFeatureStore((s) => s.setSelectedFeature)

  const polygonHoverHandler = useMemo(
    () => createPolygonHoverHandler(polygonHoverRef),
    [polygonHoverRef],
  )
  const polygonClickHandler = useMemo(
    () => createPolygonClickHandler(polygonClickRef, setSelectedFeature),
    [polygonClickRef, setSelectedFeature],
  )

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
    if (!isMapLoaded) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const handleError = (e: MapErrorEvent) => {
      setLayerErrors((prev) => ({
        ...prev,
        [e.type]: e.error?.message || 'Failed to load layer',
      }))
    }

    const handleSourceData = (e: SourceDataEvent) => {
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

    map.on('error', handleError)
    map.on('sourcedata', handleSourceData)

    // eslint-disable-next-line consistent-return
    return () => {
      map.off('error', handleError)
      map.off('sourcedata', handleSourceData)
    }
  }, [isMapLoaded])

  const handleMapLoad = () => {
    setIsMapLoaded(true)

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const watershedLayer = mapLayers.find((l) => l.layerId === 'watershed')

    // remove previous bound listener if present to avoid duplicate firing
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
  }

  function WatershedLayers({ layer, index }) {
    return (
      <Source
        id={layer.sourceId}
        key={`${layer.sourceId}`}
        type="vector"
        promoteId="watershed_id"
        url={`pmtiles://${layer.link}`}
      >
        <Layer
          id={`${layer.layerId}-lines`}
          type="line"
          key={`${layer.layerId}-lines-${index}`}
          source={layer.sourceId}
          source-layer={layer.sourceName}
          beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
          layout={{
            'line-sort-key': 5, //watershed outlines should overlay all other layers
          }}
          paint={{
            'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 4, 1],
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
        <Layer
          id={layer.layerId}
          type="fill"
          key={`${layer.layerId}-${index}`}
          source={layer.sourceId}
          source-layer={layer.sourceName}
          beforeId="label_airport"
          paint={{
            'fill-color': 'rgba(0,0,0,0)',
            'fill-outline-color': layer.outlineColor,
          }}
        />
      </Source>
    )
  }

  function PmTileLayers({ layer, index }) {
    return (
      <Source
        id={layer.sourceId}
        key={`${layer.sourceId}`}
        type="vector"
        url={`pmtiles://${layer.link}`}
      >
        <Layer
          id={layer.layerId}
          type="line"
          key={`${layer.layerId}-${index}`}
          source={layer.sourceId}
          source-layer={layer.sourceName}
          beforeId="label_airport"
          paint={{
            'line-color': layer.outlineColor,
            'line-dasharray': layer.outlineStyle ? [0, 2, 5] : [2, 0],
          }}
        />
      </Source>
    )
  }

  return (
    <div className={styles['map-wrap']}>
      {!isMapLoaded && <LoadingState isOverlay={true} />}
      <MapGL
        id="satellite-map"
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: defaultLng,
          latitude: defaultLat,
          zoom: defaultMapZoom,
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
        {mapLayers.map((layer, index) => {
          return layer.dataType === 'pmtiles' ? (
            isMapLoaded && layer.layerId === 'watershed' ? (
              <WatershedLayers layer={layer} index={index} />
            ) : (
              <PmTileLayers layer={layer} index={index} />
            )
          ) : (
            isMapLoaded && layer.isLayerOn && (
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
                  beforeId="label_airport"
                />
              </Source>
            )
          )
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
