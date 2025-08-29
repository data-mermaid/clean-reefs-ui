import React, { useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import { Layer, Map as MapGL, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import CircularProgress from '@mui/material/CircularProgress'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { LayerInfo } from '../../data/mapData'

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

interface BaseMapProps {
  layersOn: LayerInfo[]
}

export default function BaseMap({ layersOn }: BaseMapProps) {
  // const {t} = useTranslation()
  // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLon = 178.4 //Initial location - Fiji
  const defaultLat = -17.816028
  const defaultMapZoom = 10
  // const mapRef = useRef(null)
  const [viewportBounds, setViewportBounds] = useState<number[]>([])

  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    maplibregl.addProtocol('cog', cogProtocol)

    setViewportBounds([defaultLon, defaultLat, defaultMapZoom])
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

  return (
    <div className={styles['map-wrap']}>
      {!isMapLoaded && (
        <CircularProgress
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            height: '99%', //rotation causes overflow issues
          }}
        />
      )}
      <MapGL
        id="satellite-map"
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/basic/style.json?key=${apiKey}`}
        onLoad={() => setIsMapLoaded(true)}
        attributionControl={false}
      >
        {layersOn.map((layer) => {
          return layer.dataType === 'pmtiles' ? (
            <>
              {isMapLoaded && layer.isLayerOn && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}`}
                  type="vector"
                  url={`pmtiles://${layer.link}`}
                >
                  <Layer
                    id={layer.layerId}
                    type="line"
                    source={layer.sourceId}
                    source-layer={layer.sourceName}
                  />
                </Source>
              )}
            </>
          ) : (
            <>
              {isMapLoaded && layer.isLayerOn && (
                <Source
                  id={layer.sourceId}
                  key={`${layer.sourceId}-source`}
                  type="raster"
                  tiles={[`${layer.link}`]}
                  tileSize={256}
                  maxzoom={16}
                  minzoom={6}
                >
                  <Layer id={layer.layerId} type="raster" source={layer.sourceId} />
                </Source>
              )}
            </>
          )
        })}
      </MapGL>
    </div>
  )
}
