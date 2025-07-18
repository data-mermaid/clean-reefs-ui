import React, {useEffect, useRef} from 'react'
import * as maptilersdk from '@maptiler/sdk'

import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './styles/BaseMap.module.scss'

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

export default function BaseMap() {
  // const {t} = useTranslation()
  // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
  const defaultLon = 121 //TODO: provide functionalitly to zoom into general user browser location
  const defaultLat = 14
  const defaultMapZoom = 10
  const map = useRef(null)

  maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY

  useEffect(() => {
    if (map.current) { return } // stops map from initializing more than once
  }, [])

  return (
    <div className={styles['map-wrap']}>
      <Map
        id="satellite-map"
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
      />
    </div>
  )
}
