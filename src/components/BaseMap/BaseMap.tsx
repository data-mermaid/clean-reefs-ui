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
import {
  Layer,
  Map as MapGL,
  MapRef,
  NavigationControl,
  Source,
  ScaleControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import styles from './BaseMap.module.scss'
import maplibregl, { ErrorEvent as MapErrorEvent } from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { LayerInfo } from '../../data/mapData'
import useResponsive from '../../hooks/useResponsive'

import { updateChartData } from '../../utils/chartUtils'
import LoadingState from '../LoadingState/LoadingState'
import { RegionOption } from '../../types/RegionDataTypes'
import { createPolygonHoverHandler, getActiveLayers, mapRegionSelected } from '../../utils/mapUtils'
import { ChartProperties } from '../../types/ChartDataTypes'
import { SourceDataEvent } from '../../types/MapLayerErrorTypes'
import { Snackbar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { polygonOutlineHoverColor, polygonOutlineSelectColor } from '../../constants'

interface BaseMapProps {
  mapLayers: LayerInfo[]
  selectedRegion: RegionOption
  setSelectedRegion: Dispatch<SetStateAction<RegionOption>>
  setChartConfigData: Dispatch<SetStateAction<ChartProperties[] | null>>
}

export default function BaseMap({
  mapLayers,
  selectedRegion,
  setSelectedRegion,
  setChartConfigData,
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
  const polygonHoverRef = useRef<number | null>(null)
  const polygonClickRef = useRef<number | null>(null)

  const mapLayersLoadingError = useMemo(() => {
    return Object.keys(layerErrors).length > 0
  }, [layerErrors])

  const hoverHandler = useMemo(() => createPolygonHoverHandler(polygonHoverRef), [polygonHoverRef])
  // const polygonClickHandler = useMemo(
  //   () => createPolygonClickHandler(polygonHoverRef),
  //   [polygonHoverRef],
  // )
  // ref to keep the bound callback so it can be removed if needed
  const watershedBoundRef = useRef<((e) => void) | null>(null)

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

  const loadChartData = useCallback(
    (point, activeLayers, zoomLevel: number) => {
      if (!mapRef.current) {
        return
      }
      const map = mapRef.current?.getMap()

      //doesn't account for if the layer hasn't loaded yet
      if (activeLayers.length > 0) {
        //query the layers corresponding with charts and with layers that are on
        const features = map.queryRenderedFeatures(point, {
          layers: activeLayers,
        })

        if (features.length > 0) {
          const tempSkipLayers = ['global']
          //only grab the topmost data layer to pull point from
          const firstFeature = features[0]

          //TEMP: remove tempSkipLayers when all region data is available
          if (!tempSkipLayers.includes(firstFeature.layer.id)) {
            const mappedRegion = mapRegionSelected(firstFeature, currentLngLat, zoomLevel)
            setSelectedRegion(mappedRegion)

            //trigger chart data update
            updateChartData(firstFeature, setChartConfigData)
          } else {
            setChartConfigData(null)
          }
        }
      }
    },
    [currentLngLat, setChartConfigData, setSelectedRegion],
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
    loadChartData(defaultPoint, activeLayers, defaultMapZoom)

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    // remove previous bound listener if present to avoid duplicate firing
    if (watershedBoundRef.current) {
      map.off('mousemove', 'watershed', watershedBoundRef.current)
      watershedBoundRef.current = null
    }

    // bind handler that injects the map instance
    const bound = (e) => {
      hoverHandler(map, e)
    }
    watershedBoundRef.current = bound
    map.on('mousemove', 'watershed', bound)

    // map.on('mousemove', 'watershed', (e) => {
    //   if (e.features && e.features.length > 0) {
    //     if (e.features[0].id && e.features[0].id === polygonHoverRef) {
    //       return
    //     }
    //     if (polygonHoverRef) {
    //       map.setFeatureState(
    //         {
    //           source: 'watershed_src',
    //           sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    //           id: polygonHoverRef,
    //         },
    //         { hover: false },
    //       )
    //       polygonHoverRef = null
    //       return
    //     }
    //     if (e.features[0].id) {
    //       polygonHoverRef = e.features[0].id
    //       map.setFeatureState(
    //         {
    //           source: 'watershed_src',
    //           sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    //           id: polygonHoverRef,
    //         },
    //         { hover: true },
    //       )
    //     }
    //   }
    // })
    map.on('click', 'watershed', (e) => {
      console.log('clicked')
      if (e.features && e.features.length > 0) {
        // debugger
        if (e.features[0].id) {
          if (polygonClickRef) {
            map.setFeatureState(
              {
                source: 'watershed_src',
                sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
                id: polygonClickRef,
              },
              { select: false },
            )
            // polygonClickRef = null
          }
          polygonClickRef = e.features[0].id
          map.setFeatureState(
            {
              source: 'watershed_src',
              sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
              id: polygonClickRef,
            },
            { select: true },
          )
        }
      }
    })
  }

  const handleMapClick = (event) => {
    if (!mapRef.current) {
      return
    }
    const zoom = mapRef.current?.getMap().getZoom()
    if (zoom && zoom !== currentZoom) {
      setCurrentZoom(zoom)
    }

    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    // console.log(`clicked ${event.features[0].id}`)
    // debugger
    // if (event.features && event.features.length > 0) {
    //   if (event.features[0].id) {
    //     if (polygonClickRef) {
    //       console.log(`previously selected: ${polygonClickRef} new item:${event.features[0].id}`)
    //       map.setFeatureState(
    //         {
    //           source: 'watershed_src',
    //           sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    //           id: polygonClickRef,
    //         },
    //         { select: false },
    //       )
    //       polygonClickRef = null
    //       return
    //     }
    //     polygonClickRef = event.features[0].id
    //     map.setFeatureState(
    //       {
    //         source: 'watershed_src',
    //         sourceLayer: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    //         id: polygonClickRef,
    //       },
    //       { select: true },
    //     )
    //   }
    // }

    //todo: on watershed click, zoom to boundary extents

    //todo: condition for if lat long are different, then change
    // setCurrentLngLat([event.lngLat.lng, event.lngLat.lat])

    //todo: check for different layers active, then change
    // const activeLayers = getActiveLayers(mapLayers)
    // loadChartData(event.point, activeLayers, zoom)
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
          id={layer.layerId}
          type="fill"
          key={`${layer.layerId}-${index}`}
          source={layer.sourceId}
          source-layer={layer.sourceName}
          beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
          paint={{
            'fill-color': 'rgba(0,0,0,0)',
            'fill-outline-color': layer.outlineColor,
          }}
        />
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
          beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
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
        // onClick={handleMapClick}
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
                  beforeId="label_airport" // label_airport is one of the first label layers, this ensures custom layers appear below all labels
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
