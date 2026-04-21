import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
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
  getValidDispersalPoint,
  getValidLabels,
  getValidBasemap,
} from '../../utils/routeUtils'
import { useMapStore } from '../../stores/mapStore'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { defaultGlobalRegionOption } from '../../data/regionData'

export default function MapContainer() {
  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)
  const turnOffSedExportSubLayerFills = useMapStore((state) => state.turnOffSedExportSubLayerFills)
  const clearTopPolygonsFill = useMapStore((s) => s.clearTopPolygonsFill)
  const clearSelectedFeature = useSelectedFeatureStore((s) => s.clearSelectedFeature)
  const clearSelectedPlumeWatershedStats = useSelectedFeatureStore(
    (s) => s.clearSelectedPlumeWatershedStats,
  )

  const [searchParams, setSearchParams] = useSearchParams()

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

  const labelsParam = searchParams.get('labels')
  const showLabels = getValidLabels(labelsParam)
  const normalizedLabelsParam = showLabels ? 'true' : 'false'
  const shouldSyncLabelsParam = labelsParam !== null && labelsParam !== normalizedLabelsParam

  const basemapParam = searchParams.get('basemap')
  const selectedBasemap = getValidBasemap(basemapParam)
  const shouldSyncBasemapParam = basemapParam !== selectedBasemap

  const watershedParam = searchParams.get('watershed')
  const dispersalPointParam = searchParams.get('dispersal-point')
  const dispersalPoint = useMemo(
    () => getValidDispersalPoint(dispersalPointParam),
    [dispersalPointParam],
  )
  const { lat, lng } = getValidLatLng(searchParams.get('lat'), searchParams.get('lng'))
  const zoom = getValidZoom(searchParams.get('zoom'))
  const hasExplicitViewState = lat !== null && lng !== null && zoom !== null

  // Captured once at mount — only used for initial restoration on page load.
  // Clicks update the URL via handleWatershedChange but don't re-trigger restoration.
  const [initialWatershedId] = useState(() => getValidWatershed(searchParams.get('watershed')))
  const [initialDispersalPoint] = useState(() =>
    getValidDispersalPoint(searchParams.get('dispersal-point')),
  )

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('pixel')
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(initialRegion)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>(
    initialRegion.grouping > 0 ? [defaultGlobalRegionOption, initialRegion] : [initialRegion],
  )

  const latestSearchParamsRef = useRef(new URLSearchParams(searchParams))

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

  useEffect(() => {
    latestSearchParamsRef.current = new URLSearchParams(searchParams)
  }, [searchParams])

  useEffect(() => {
    if (
      !shouldSyncYearParam &&
      !shouldSyncRegionParam &&
      !shouldSyncLayersParam &&
      !shouldSyncLabelsParam &&
      !shouldSyncBasemapParam
    ) {
      return
    }

    updateSearchParams(
      (prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('year', normalizedYearParam)
        nextSearchParams.set('region', normalizedRegionParam)
        nextSearchParams.set('layers', normalizedLayersParam)
        nextSearchParams.set('labels', normalizedLabelsParam)
        nextSearchParams.set('basemap', selectedBasemap)
        return nextSearchParams
      },
      { replace: true },
    )
  }, [
    updateSearchParams,
    normalizedYearParam,
    normalizedRegionParam,
    normalizedLayersParam,
    normalizedLabelsParam,
    selectedBasemap,
    shouldSyncYearParam,
    shouldSyncRegionParam,
    shouldSyncLayersParam,
    shouldSyncLabelsParam,
    shouldSyncBasemapParam,
  ])

  useEffect(() => {
    setSelectedRegion(initialRegion)
    if (!watershedParam) {
      setBreadcrumb(
        initialRegion.grouping > 0 ? [defaultGlobalRegionOption, initialRegion] : [initialRegion],
      )
    }
  }, [initialRegion, watershedParam])

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

  const handleDispersalPointChange = useCallback(
    (newDispersalPoint: { lat: number; lng: number } | null) => {
      updateSearchParams(
        (prev) => {
          const nextSearchParams = new URLSearchParams(prev)
          if (newDispersalPoint) {
            nextSearchParams.set(
              'dispersal-point',
              `${newDispersalPoint.lat.toFixed(6)},${newDispersalPoint.lng.toFixed(6)}`,
            )
          } else {
            nextSearchParams.delete('dispersal-point')
          }
          return nextSearchParams
        },
        { replace: true },
      )
    },
    [updateSearchParams],
  )

  // Used by the region dropdown and breadcrumb navigation.
  // Clears watershed and plume state since the user is navigating to a different scope.
  const handleRegionDropdownChange = useCallback(
    (region: RegionOption) => {
      handleRegionChange(region)
      handleWatershedChange(null)
      handleDispersalPointChange(null)
      clearSelectedFeature()
      clearSelectedPlumeWatershedStats()
      clearTopPolygonsFill('watershed')
      useMapStore.getState().mapReference?.getMap()?.jumpTo({
        center: region.centerCoord,
        zoom: region.zoomLevel,
        bearing: 0,
      })
    },
    [
      handleRegionChange,
      handleWatershedChange,
      handleDispersalPointChange,
      clearSelectedFeature,
      clearSelectedPlumeWatershedStats,
      clearTopPolygonsFill,
    ],
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

  const handleLabelsChange = useCallback(
    (show: boolean) => {
      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('labels', show ? 'true' : 'false')
        return nextSearchParams
      })
    },
    [updateSearchParams],
  )

  const handleBasemapChange = useCallback(
    (basemap: string) => {
      useMapStore.getState().prepareBasemapChange(showLabels)

      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('basemap', basemap)
        return nextSearchParams
      })
    },
    [updateSearchParams, showLabels],
  )

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer
          mapLayers={urlSyncedMapLayers}
          setMapLayers={setMapLayers}
          selectedYear={selectedYear}
          selectedLayers={selectedLayers}
          selectedBasemap={selectedBasemap}
          onLayerToggleChange={handleLayerToggleChange}
          onSedSubLayerChange={handleSedSubLayerChange}
          subSedLayerValue={subSedLayerValue}
          showLabels={showLabels}
          onLabelsChange={handleLabelsChange}
          onBasemapChange={handleBasemapChange}
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
        dispersalPoint={dispersalPoint}
        selectedBasemap={selectedBasemap}
        onRegionChange={handleRegionChange}
        onWatershedChange={handleWatershedChange}
        onDispersalPointChange={handleDispersalPointChange}
        initialWatershedId={initialWatershedId}
        initialDispersalPoint={initialDispersalPoint}
        selectedYear={selectedYear}
        hasExplicitViewState={hasExplicitViewState}
        setBreadcrumb={setBreadcrumb}
        showLabels={showLabels}
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
