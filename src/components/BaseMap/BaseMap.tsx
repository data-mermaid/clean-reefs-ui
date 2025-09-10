import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
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
import { ChartedData, mapGraphAttributes, updateGraph } from '../../utils/updateGraph'
import LoadingState from '../LoadingState/LoadingState'

interface BaseMapProps {
  layersAvailable: LayerInfo[]
  layerIdsOn: []
  setLulcGraphData: Dispatch<SetStateAction<ChartedData[] | null>>
}

export default function BaseMap({ layersAvailable, layerIdsOn, setLulcGraphData }: BaseMapProps) {
  // const {t} = useTranslation()
  const { isDesktopWidth } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLon = 178.4 //Initial location - Fiji
  const defaultLat = -17.816028
  const defaultMapZoom = 10
  const mapRef = useRef<MapRef | null>(null)
  // const [viewportBounds, setViewportBounds] = useState<number[]>([])

  //TODO: kick this off when source layer is available
  const loadGraphData = useCallback(
    (point) => {
      if (mapRef.current) {
        const map = mapRef.current?.getMap()

        //query the layers corresponding with graphs and with layers that are on
        const features = map.queryRenderedFeatures(point, {
          layers: ['watershed'], //TODO: replace w/list of layer ids that are on
        })
        //TODO: test whether or not the layer has loaded before trying to load the data

        if (features.length > 0) {
          const properties = features[0].properties
          const sortedData = updateGraph(properties)
          setLulcGraphData(mapGraphAttributes(sortedData))
        }
      }
    },
    [setLulcGraphData],
  )

  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    maplibregl.addProtocol('cog', cogProtocol)

    // setViewportBounds([defaultLon, defaultLat, defaultMapZoom])
    return () => {
      maplibregl.removeProtocol('pmtiles')
      maplibregl.removeProtocol('cog')
    }
  }, [defaultLon, defaultLat])

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

  const handleMapClick = (event) => {
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
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/basic/style.json?key=${apiKey}`}
        onLoad={() => setIsMapLoaded(true)}
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
        {layersAvailable.map((layer, index) => {
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
                      'fill-color': 'blue',
                      'fill-opacity': 0.25, //needs fill to be able to select individual watersheds
                      'fill-outline-color': 'blue',
                    }}
                  />
                </Source>
              )
            : isMapLoaded && layer.isLayerOn && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}-${index}`}
                  type="raster"
                  tiles={[`${layer.link}`]}
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
