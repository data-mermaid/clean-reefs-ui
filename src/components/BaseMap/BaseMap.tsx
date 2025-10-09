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
import maplibregl, { ErrorEvent as MapErrorEvent } from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { LayerInfo } from '../../data/mapData'
import useResponsive from '../../hooks/useResponsive'

import { updateGraphData } from '../../utils/graphUtils'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import { getActiveLayers, mapRegionSelected } from '../../utils/mapUtils'
import { GraphChartConfig } from '../../types/GraphDataTypes'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'

interface BaseMapProps {
  mapLayers: LayerInfo[]
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
  setGraphData: Dispatch<SetStateAction<GraphChartConfig[] | null>>
}

export default function BaseMap({
  mapLayers,
  selectedRegion,
  setSelectedRegion,
  setGraphData,
}: BaseMapProps) {
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

  // const mapLayersLoadingError =
  useMemo(() => {
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
      //doesn't account for if the layer hasn't loaded yet
      if (activeLayers.length > 0) {
        //query the layers corresponding with graphs and with layers that are on
        const features = map.queryRenderedFeatures(point, {
          layers: activeLayers,
        })

        if (features.length > 0) {
          const tempSkipLayers = ['global']
          //only grab the topmost data layer to pull point from
          const firstFeature = features[0]

          //TEMP: remove tempSkipLayers when all region data is available
          if (!tempSkipLayers.includes(firstFeature.layer.id)) {
            // const properties = firstFeature.properties

            // trigger region update
            const mappedRegion = mapRegionSelected(firstFeature, currentLngLat, zoomLevel)
            // if (selectedRegion.label !== mappedRegion.label) {
            setSelectedRegion(mappedRegion)

            //trigger graph data update
            updateGraphData(firstFeature, setGraphData)
            // const sortedData = updateGraphData(properties, setGraphData)
            // setGraphData(sortedData)
            // }
          } else {
            setGraphData(null)
          }
        }
      }
    },
    [currentLngLat, setGraphData, setSelectedRegion],
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
    const activeLayers = getActiveLayers(mapLayers)
    loadGraphData(defaultPoint, activeLayers, defaultMapZoom)
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
                    beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
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
                    beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
                  />
                </Source>
              )
        })}
      </MapGL>
    </div>
  )
}
