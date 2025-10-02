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
import { Layer, Map as MapGL, MapRef, NavigationControl, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { Snackbar } from '@mui/material'
import { LayerInfo } from '../../data/mapData'
import useResponsive from '../../hooks/useResponsive'

import { mapGraphAttributes, updateLulcGraph } from '../../utils/graphUtils'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import { getActiveLayers, mapRegionSelected } from '../../utils/mapUtils'
import { ChartedData } from '../../types/GraphDataTypes'
import { useTranslation } from 'react-i18next'
import { MapErrorEvent, SourceDataEvent } from '../../types/MapLayerErrorTypes'

interface BaseMapProps {
  mapLayers: LayerInfo[]
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
  setLulcGraphData: Dispatch<SetStateAction<ChartedData[] | null>>
}

export default function BaseMap({
  mapLayers,
  selectedRegion,
  setSelectedRegion,
  setLulcGraphData,
}: BaseMapProps) {
  const { t } = useTranslation()
  const { isDesktopWidth } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLng = 178.4 //Initial location - Fiji
  const defaultLat = -17.816028
  const defaultPoint = [622, 401] //Fiji
  const defaultMapZoom = 10
  const mapRef = useRef<MapRef | null>(null)
  const [currentLngLat, setCurrentLngLat] = useState<[number, number]>([defaultLng, defaultLat])
  const [currentZoom, setCurrentZoom] = useState<number>(defaultMapZoom)
  const [layerErrors, setLayerErrors] = useState<Record<string, string>>({})

  const mapLayersLoadingError = useMemo(() => {
    return Object.keys(layerErrors).length > 0
  }, [layerErrors])

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

  const loadGraphData = useCallback(
    (point, activeLayers, zoomLevel: number) => {
      if (!mapRef.current) {
        return
      }
      const map = mapRef.current?.getMap()

      //todo: when global data is available, make a default for global with optional loadGraphData arguments
      if (activeLayers.length > 0) {
        //query the layers corresponding with graphs and with layers that are on
        const features = map.queryRenderedFeatures(point, {
          layers: activeLayers,
        })

        if (features.length > 0) {
          const tempSkipLayers = ['global']
          const firstFeature = features[0]

          //TEMP: remove tempSkipLayers when all region data is available
          if (!tempSkipLayers.includes(firstFeature.layer.id)) {
            const properties = firstFeature.properties
            const mappedRegion = mapRegionSelected(firstFeature, currentLngLat, zoomLevel)

            if (selectedRegion.label !== mappedRegion.label) {
              setSelectedRegion(mappedRegion)
              const sortedData = updateLulcGraph(properties)
              setLulcGraphData(mapGraphAttributes(sortedData))
            }
          }
        } else {
          setLulcGraphData(null)
        }
      }
    },
    [currentLngLat, selectedRegion.label, setLulcGraphData, setSelectedRegion],
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

  const handleMapLoad = () => {
    setIsMapLoaded(true)
    const activeLayers = getActiveLayers(mapLayers)
    loadGraphData(defaultPoint, activeLayers, defaultMapZoom)

    const map = mapRef.current?.getMap()

    if (map) {
      // Listen for general map errors
      map.on('error', (e: MapErrorEvent) => {
        const sourceId = e.sourceId || 'unknown-source'

        setLayerErrors((prev) => ({
          ...prev,
          [sourceId]: e.error?.message || 'Failed to load layer',
        }))
      })

      // Clear errors for sources that load successfully
      map.on('sourcedata', (e: SourceDataEvent) => {
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
      })
    }
  }

  const handleMapClick = (event) => {
    if (!mapRef.current) {
      return
    }
    const zoom = mapRef.current?.getMap().getZoom()
    if (zoom && zoom !== currentZoom) {
      setCurrentZoom(zoom)
    }
    setCurrentLngLat([event.lngLat.lng, event.lngLat.lat])
    const activeLayers = getActiveLayers(mapLayers)
    loadGraphData(event.point, activeLayers, zoom)
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
        onClick={handleMapClick}
      >
        {isDesktopWidth && (
          <NavigationControl
            position={'bottom-right'}
            showCompass={false}
            style={{
              marginRight: '380px',
            }}
          />
        )}
        {mapLayers.map((layer, index) => {
          return layer.dataType === 'pmtiles'
            ? isMapLoaded && layer.isLayerOn && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}`}
                  type="vector"
                  url={`pmtiles://${layer.link}`}
                >
                  <Layer
                    id={layer.layerId}
                    type="fill"
                    key={`${layer.layerId}-${index}`}
                    source={layer.sourceId}
                    source-layer={layer.sourceName}
                    paint={{
                      'fill-color': 'red',
                      'fill-opacity': 0.25, //needs fill to be able to select individual watersheds
                      'fill-outline-color': 'black',
                    }}
                  />
                </Source>
              )
            : isMapLoaded && layer.isLayerOn && (
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
                  />
                </Source>
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
