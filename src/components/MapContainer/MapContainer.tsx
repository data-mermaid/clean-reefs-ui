import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useNavigationType, useSearchParams } from 'react-router'
import { LngLatBounds } from 'maplibre-gl'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers, urlControlledLayerIds } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { LayerInfo } from '../../types/MapDataTypes'
import {
  getValidLatLng,
  getValidLayers,
  getValidYear,
  getValidRegion,
  getValidWatershed,
  getValidZoom,
} from '../../utils/routeUtils'
import { mapFitBoundsDesktopConfig, mapFitBoundsMobileConfig } from '../../constants'
import useResponsive from '../../hooks/useResponsive'
import { useMapStore } from '../../stores/mapStore'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { defaultGlobalRegionOption } from '../../data/regionData'

export default function MapContainer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigationType = useNavigationType()
  const { isDesktopWidth } = useResponsive()
  const year = searchParams.get('year')
  const selectedYear = getValidYear(year)
  const normalizedYearParam = selectedYear.toString()
  const shouldSyncYearParam = year !== normalizedYearParam

  const regionParam = searchParams.get('region')
  const initialRegion = getValidRegion(regionParam)
  const normalizedRegionParam = initialRegion.id
  const shouldSyncRegionParam = regionParam !== normalizedRegionParam

  const layersParam = searchParams.get('layers')
  const selectedLayers = getValidLayers(layersParam)
  const normalizedLayersParam = selectedLayers.length > 0 ? selectedLayers.join(',') : 'none'
  const shouldSyncLayersParam = layersParam !== normalizedLayersParam

  const watershedParam = searchParams.get('watershed')
  const watershedId = getValidWatershed(watershedParam)

  // TODO: Handle dispersal-point URL param (C152)

  const { lat, lng } = getValidLatLng(searchParams.get('lat'), searchParams.get('lng'))
  const zoom = getValidZoom(searchParams.get('zoom'))

  const hasExplicitViewState = lat !== null && lng !== null && zoom !== null

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('pixel')

  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultGlobalRegionOption)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>(
    initialRegion.grouping > 0 ? [defaultGlobalRegionOption, initialRegion] : [initialRegion],
  )

  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)
  const turnOffSedExportSubLayerFills = useMapStore((state) => state.turnOffSedExportSubLayerFills)
  const clearSelectedFeature = useSelectedFeatureStore((s) => s.clearSelectedFeature)
  const latestSearchParamsRef = useRef(new URLSearchParams(searchParams))
  const hasRestoredWatershedRef = useRef(false)

  useEffect(() => {
    latestSearchParamsRef.current = new URLSearchParams(searchParams)
  }, [searchParams])

  const updateSearchParams = useCallback(
    (
      updater: (prevSearchParams: URLSearchParams) => URLSearchParams,
      navigateOptions?: { replace?: boolean },
    ) => {
      const nextSearchParams = updater(new URLSearchParams(latestSearchParamsRef.current))
      latestSearchParamsRef.current = new URLSearchParams(nextSearchParams)
      setSearchParams(nextSearchParams, navigateOptions)
    },
    [setSearchParams],
  )

  const urlSyncedMapLayers = useMemo(
    () =>
      mapLayers.map((layer) => {
        if (!urlControlledLayerIds.includes(layer.layerId)) {
          return layer
        }

        const isOn =
          selectedLayers.includes(layer.layerId) &&
          (layer.year === undefined || layer.year === selectedYear)
        return { ...layer, isLayerOn: isOn }
      }),
    [mapLayers, selectedLayers, selectedYear],
  )

  useEffect(() => {
    if (!shouldSyncYearParam && !shouldSyncRegionParam && !shouldSyncLayersParam) {
      return
    }

    updateSearchParams(
      (prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('year', normalizedYearParam)
        nextSearchParams.set('region', normalizedRegionParam)
        nextSearchParams.set('layers', normalizedLayersParam)
        return nextSearchParams
      },
      { replace: true },
    )
  }, [
    updateSearchParams,
    normalizedYearParam,
    normalizedRegionParam,
    normalizedLayersParam,
    shouldSyncYearParam,
    shouldSyncRegionParam,
    shouldSyncLayersParam,
  ])

  // Sync local region/breadcrumb state when URL params change.
  useEffect(() => {
    setSelectedRegion(initialRegion)
    if (!watershedParam) {
      setBreadcrumb(
        initialRegion.grouping > 0 ? [defaultGlobalRegionOption, initialRegion] : [initialRegion],
      )
    }
  }, [initialRegion, watershedParam])

  // Restore map position on browser back/forward (POP). PUSH/REPLACE are
  // handled by calling code (fitBounds for polygon clicks, jumpToRegion for
  // dropdown). On initial page load navigationType is also POP, but
  // mapReference is null so jumpTo is a no-op — initialViewState handles that.
  useEffect(() => {
    if (navigationType !== 'POP') {
      return
    }

    const map = useMapStore.getState().mapReference?.getMap()
    // Read lat/lng/zoom from searchParams at execution time rather than
    // from render-scope variables — avoids re-running this effect on every
    // map pan (handleMapMoveEnd writes lat/lng/zoom to the URL continuously).
    const currentParams = latestSearchParamsRef.current
    const { lat: popLat, lng: popLng } = getValidLatLng(
      currentParams.get('lat'),
      currentParams.get('lng'),
    )
    const popZoom = getValidZoom(currentParams.get('zoom'))
    if (popLat !== null && popLng !== null && popZoom !== null) {
      map?.jumpTo({ center: [popLng, popLat], zoom: popZoom, bearing: 0 })
    } else {
      map?.jumpTo({
        center: initialRegion.centerCoord,
        zoom: initialRegion.zoomLevel,
        bearing: 0,
      })
    }
    if (!watershedParam) {
      clearSelectedFeature()
    }
  }, [initialRegion, watershedParam, navigationType, clearSelectedFeature])

  const handleRegionChange = useCallback(
    (region: RegionOption) => {
      setSelectedRegion(region)
      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('region', region.id)
        return nextSearchParams
      })
    },
    [updateSearchParams],
  )

  // Updates or removes the watershed URL param. Always replaces (no new
  // history entry) because the region change already pushes one on click.
  const handleWatershedChange = useCallback(
    (newWatershedId: string | null) => {
      updateSearchParams(
        (prev) => {
          const nextSearchParams = new URLSearchParams(prev)
          if (newWatershedId) {
            nextSearchParams.set('watershed', newWatershedId)
          } else {
            nextSearchParams.delete('watershed')
          }
          return nextSearchParams
        },
        { replace: true },
      )
    },
    [updateSearchParams],
  )

  // Called by BaseMap when the watershed restoration effect finds the
  // feature in the tile data. Decides whether to animate the map to it.
  // On initial page load without explicit lat/lng/zoom: fitBounds so the
  // user sees the watershed. On POP (back/forward) or when the URL already
  // has a view state: skip, because the map is already positioned.
  const handleWatershedRestored = useCallback(
    (bounds: LngLatBounds) => {
      if (hasRestoredWatershedRef.current || hasExplicitViewState) {
        return
      }
      hasRestoredWatershedRef.current = true

      const map = useMapStore.getState().mapReference?.getMap()
      if (!map) {
        return
      }

      const config = isDesktopWidth ? mapFitBoundsDesktopConfig : mapFitBoundsMobileConfig
      map.fitBounds(bounds, {
        padding: config.padding,
        maxZoom: config.maxZoom,
        duration: 800,
      })
    },
    [hasExplicitViewState, isDesktopWidth],
  )

  // Used by the region dropdown and breadcrumb navigation.
  // Clears watershed state since the user is navigating to a different scope.
  const handleRegionDropdownChange = useCallback(
    (region: RegionOption) => {
      handleRegionChange(region)
      handleWatershedChange(null)
      clearSelectedFeature()
    },
    [handleRegionChange, handleWatershedChange, clearSelectedFeature],
  )

  const handleYearChange = useCallback(
    (year: number) => {
      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('year', year.toString())
        return nextSearchParams
      })

      if (selectedLayers.includes('sed_export')) {
        toggleSedExportSubLayerFills(subSedLayerValue, year)
      }
    },
    [updateSearchParams, selectedLayers, toggleSedExportSubLayerFills, subSedLayerValue],
  )

  const handleLayerToggleChange = useCallback(
    (toggledLayerId: string | null, isChecked: boolean) => {
      const sedExportAndLandUseLayers = ['sed_export', 'lulc']
      if (!toggledLayerId) {
        return
      }

      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        const currentLayers = nextSearchParams.get('layers') || ''
        const layerSet = new Set(currentLayers.split(',').filter((l) => l && l !== 'none'))

        // Remove on uncheck; on check, enforce sed/lulc exclusivity before adding.
        if (!isChecked) {
          layerSet.delete(toggledLayerId)
        } else {
          if (sedExportAndLandUseLayers.includes(toggledLayerId)) {
            sedExportAndLandUseLayers.forEach((layerId) => layerSet.delete(layerId))
          }
          layerSet.add(toggledLayerId)
        }

        nextSearchParams.set('layers', Array.from(layerSet).join(',') || 'none')
        return nextSearchParams
      })

      if (toggledLayerId === 'sed_export' && isChecked) {
        toggleSedExportSubLayerFills(subSedLayerValue, selectedYear)
        return
      }

      if (toggledLayerId === 'sed_export' || (toggledLayerId === 'lulc' && isChecked)) {
        turnOffSedExportSubLayerFills()
      }
    },
    [
      updateSearchParams,
      subSedLayerValue,
      selectedYear,
      toggleSedExportSubLayerFills,
      turnOffSedExportSubLayerFills,
    ],
  )

  const handleSedSubLayerChange = (subLayerValue: 'pixel' | 'watershed') => {
    setSubLayerValue(subLayerValue)
    toggleSedExportSubLayerFills(subLayerValue, selectedYear)
  }

  const handleMapMoveEnd = useCallback(
    (viewState: { latitude: number; longitude: number; zoom: number }) => {
      updateSearchParams(
        (prevSearchParams) => {
          const nextSearchParams = new URLSearchParams(prevSearchParams)
          nextSearchParams.set('lat', viewState.latitude.toFixed(6))
          nextSearchParams.set('lng', viewState.longitude.toFixed(6))
          nextSearchParams.set('zoom', viewState.zoom.toFixed(2))
          return nextSearchParams
        },
        { replace: true },
      )
    },
    [updateSearchParams],
  )

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer
          mapLayers={urlSyncedMapLayers}
          setMapLayers={setMapLayers}
          selectedYear={selectedYear}
          selectedLayers={selectedLayers}
          onLayerToggleChange={handleLayerToggleChange}
          onSedSubLayerChange={handleSedSubLayerChange}
          subSedLayerValue={subSedLayerValue}
        />
        <RegionSelect
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionDropdownChange}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
        />
        <YearSelect selectedYear={selectedYear} onChange={handleYearChange} />
        <TrendsDrawer selectedRegion={selectedRegion} selectedYear={selectedYear} />
      </div>
      <BaseMap
        mapLayers={urlSyncedMapLayers}
        sedExportSubLayerValue={subSedLayerValue}
        onRegionChange={handleRegionChange}
        onWatershedChange={handleWatershedChange}
        watershedId={watershedId}
        setBreadcrumb={setBreadcrumb}
        onWatershedRestored={handleWatershedRestored}
        initialViewState={{
          longitude: lng ?? selectedRegion.centerCoord.lng,
          latitude: lat ?? selectedRegion.centerCoord.lat,
          zoom: zoom ?? selectedRegion.zoomLevel,
        }}
        onMapMoveEnd={handleMapMoveEnd}
      />
    </div>
  )
}
