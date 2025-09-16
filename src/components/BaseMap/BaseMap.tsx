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
import { LayerInfo } from '../../data/mapData'
import useResponsive from '../../hooks/useResponsive'

import { mapGraphAttributes, updateLulcGraph } from '../../utils/graphUtils'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import { checkRegionSelected, getActiveLayers } from '../../utils/mapUtils'
import { ChartedData } from '../../types/GraphDataTypes'

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
  const { isDesktopWidth } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLng = 178.4 //Initial location - Fiji
  const defaultLat = -17.816028
  const defaultMapZoom = 10
  const mapRef = useRef<MapRef | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [currentLngLat, setCurrentLngLat] = useState<[number, number]>([defaultLng, defaultLat])
  const [currentZoom, setCurrentZoom] = useState<number>(defaultMapZoom)

  useMemo(() => {
    const map = mapRef.current?.getMap()

    const jumpOptions = {
      center: selectedRegion.centerCoord,
      zoom: selectedRegion.zoomLevel,
      bearing: 0,
    }
    map?.jumpTo(jumpOptions)
  }, [selectedRegion])

  const loadGraphData = useCallback(
    (point) => {
      if (mapRef.current && activeLayers.length > 0) {
        const map = mapRef.current?.getMap()

        //query the layers corresponding with graphs and with layers that are on
        const features = map.queryRenderedFeatures(point, {
          layers: activeLayers,
        })

        //TEMP: remove tempSkipLayers when geometries are updated correctly and global data available
        const tempSkipLayers = ['global']
        if (!tempSkipLayers.includes(features[0].layer.id) && features.length > 0) {
          const properties = features[0].properties

          const mappedRegion = checkRegionSelected(features[0], currentLngLat, currentZoom)
          if (selectedRegion.label !== mappedRegion.label) {
            setSelectedRegion(mappedRegion)
            const sortedData = updateLulcGraph(properties)
            setLulcGraphData(mapGraphAttributes(sortedData))
          }
        } else {
          setLulcGraphData(null)
        }
      }
    },
    [
      activeLayers,
      currentLngLat,
      currentZoom,
      selectedRegion.label,
      setLulcGraphData,
      setSelectedRegion,
    ],
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
    loadGraphData(currentLngLat)
  }
  const handleMapClick = (event) => {
    const zoom = mapRef.current?.getMap().getZoom()
    if (zoom && zoom !== currentZoom) {
      setCurrentZoom(zoom)
    }
    setCurrentLngLat([event.lngLat.lng, event.lngLat.lat])
    setActiveLayers(getActiveLayers(mapLayers))
    loadGraphData(event.point)
  }

  return (
    <div className={styles['map-wrap']}>
      {!isMapLoaded && <LoadingState />}
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
    </div>
  )
}
