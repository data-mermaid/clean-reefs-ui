import React, { useEffect, useState, useRef } from 'react'
import * as maptilersdk from '@maptiler/sdk'

import { Map, Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import CircularProgress from '@mui/material/CircularProgress'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { PMTILES_COUNTRIES_URL, PMTILES_REGIONS_URL } from '../../constants_links'

// const isValidLatLng = (lat:number, lng:number) => {
//     return lat >= -90 && lat <= 90 && lat !== null && lng >= -180 && lng <= 180 && lng !== null
// }

interface BaseMapProps {
  protoLayerOn: boolean
}

export default function BaseMap({ protoLayerOn }: BaseMapProps) {
  // const {t} = useTranslation()
  // const { isDesktopWidth, isShorterWindowHeight } = useResponsive()
  const mapRef = useRef(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
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

  const handleMapMouseOver = (event) => {
    console.log(mapRef.current)
    if (mapRef.current) {
      const map = mapRef.current.getMap()
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['countries-layer'],
      })

      if (features.length > 0) {
        const properties = features[0].properties
        console.table(properties)
        setSelectedFeature(properties.UNION)
      }
    }
  }

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
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: defaultLon,
          latitude: defaultLat,
          zoom: defaultMapZoom,
        }}
        mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${apiKey}`}
        onLoad={() => setIsMapLoaded(true)}
        onClick={handleMapMouseOver}
      >
        {/*<Source id="regions-pmtiles"*/}
        {/*        key="regions-pmtiles"*/}
        {/*        type="vector"*/}
        {/*    //TODO: add bounds*/}
        {/*        url={`pmtiles://${PMTILES_REGIONS_URL}`}>*/}
        {/*    {protoLayerOn && (*/}
        {/*        <Layer*/}
        {/*            id="regions-layer"*/}
        {/*            type="line"*/}
        {/*            source="regions-pmtiles"*/}
        {/*            source-layer="regions"*/}
        {/*            maxzoom={14}*/}
        {/*            paint={{*/}
        {/*                'line-color': '#ff0000',*/}
        {/*                'line-width': 3,*/}
        {/*            }}*/}
        {/*        />*/}
        {/*    )}*/}
        {/*</Source>*/}
        <Source
          id="countries-pmtiles"
          type="vector"
          //TODO: add bounds
          url={`pmtiles://${PMTILES_COUNTRIES_URL}`}
        >
          <Layer
            id="countries-layer"
            key="countries-layer"
            type="fill"
            source="countries-pmtiles"
            source-layer="EEZ_land_union_v4_202410"
            paint={{
              'fill-color': 'blue',
              'fill-opacity': 0.25,
            }}
          />
        </Source>
      </Map>

      {selectedFeature && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 50,
            fontSize: '10px',
            color: 'white',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid white',
            borderRadius: '5px',
            zIndex: '10',
            width: '100px',
            height: '100px',
            backgroundColor: 'gray',
          }}
        >
          Selected: <br />
          <span style={{ fontSize: '18px', marginTop: '8px' }}>{selectedFeature}</span>
        </div>
      )}
    </div>
  )
}
