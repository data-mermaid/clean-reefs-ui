import React, {useState} from 'react'
import * as maptilersdk from '@maptiler/sdk'

import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import CircularProgress from '@mui/material/CircularProgress';
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './styles/BaseMap.module.scss'

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

export default function BaseMap() {
    // const {t} = useTranslation()
    // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const defaultLon = 121 //TODO: provide functionality to zoom into general user browser location
    const defaultLat = 14
    const defaultMapZoom = 10

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
            {!isMapLoaded && <CircularProgress style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto',
                height: '99%',
                overflowY: 'hidden',
                overflowX: 'hidden'
            }}/>}
            <Map
                id="satellite-map"
                style={{width: '100%', height: '100%'}}
                initialViewState={{
                    longitude: defaultLon,
                    latitude: defaultLat,
                    zoom: defaultMapZoom,
                }}
                mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`}
                onLoad={() => setIsMapLoaded(true)}
            />
        </div>
    )
}
