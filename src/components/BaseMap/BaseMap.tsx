import React, { useEffect, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import { Map, Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import CircularProgress from '@mui/material/CircularProgress'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

interface BaseMapProps {
  protoLayerOn: boolean
}

const PMTILES_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/other/regions/meow_boundaries/global_meow_boundaries%5E0/regions.pmtiles'

export default function BaseMap({ protoLayerOn }: BaseMapProps) {
  // const {t} = useTranslation()
  // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const defaultLon = 178.4 //TODO: provide functionality to zoom into general user browser location
  const defaultLat = -17.3
  const defaultMapZoom = 10

  // Register PMTiles protocol
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    return () => {
      maplibregl.removeProtocol('pmtiles')
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
      <Map
        id="satellite-map"
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`}
        onLoad={() => setIsMapLoaded(true)}
        attributionControl={false}
      >
        <Source id="regions-pmtiles" type="vector" url={`pmtiles://${PMTILES_URL}`}>
          {protoLayerOn && (
            <Layer
              id="regions-layer"
              type="line"
              source="regions-pmtiles"
              source-layer="regions"
              paint={{
                'line-color': '#ff0000',
                'line-width': 3,
              }}
            />
          )}
        </Source>
      </Map>
    </div>
  )
}
