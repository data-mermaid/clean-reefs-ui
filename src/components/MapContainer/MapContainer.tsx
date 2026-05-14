import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers, urlControlledLayerIds, sedExportAndLandUseLayers } from '../../data/mapData'
import { LAT_LNG_PRECISION, ZOOM_PRECISION, SED_DISPERSAL_COLLECTION_ID } from '../../constants'
import { RegionOption, RegionType } from '../../types/RegionDataTypes'
import { LayerInfo } from '../../types/MapDataTypes'
import { Basemap } from '../../utils/mapUtils'
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
import useResponsive from '../../hooks/useResponsive'
import useRasterStatistics from '../../hooks/useRasterStatistics'
import useAvailableYears from '../../hooks/useAvailableYears'
import useRegionOptions from '../../hooks/useRegionOptions'
import useSedExportStatistics from '../../hooks/useSedExportStatistics'
import {
  buildSedDispersalItemId,
  buildSedDispersalTileUrl,
  buildSedExportTileUrl,
} from '../../utils/titilerUtils'

export default function MapContainer() {
  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)
  const turnOffSedExportSubLayerFills = useMapStore((state) => state.turnOffSedExportSubLayerFills)
  const clearTopPolygonsFill = useMapStore((s) => s.clearTopPolygonsFill)
  const jumpToRegion = useMapStore((s) => s.jumpToRegion)
  const clearSelectedFeature = useSelectedFeatureStore((s) => s.clearSelectedFeature)
  const clearSelectedPlumeWatershedStats = useSelectedFeatureStore(
    (s) => s.clearSelectedPlumeWatershedStats,
  )

  const [searchParams, setSearchParams] = useSearchParams()

  const { availableYears, latestYear, isLoading: yearsLoading } = useAvailableYears()
  const { regionOptions, loading: regionOptionsLoading } = useRegionOptions()

  const year = searchParams.get('year')
  const selectedYear = getValidYear(year, availableYears, latestYear)
  const normalizedYearParam = selectedYear.toString()
  const shouldSyncYearParam = year !== normalizedYearParam

  const regionParam = searchParams.get('region')
  const initialRegion = getValidRegion(regionParam, regionOptions)
  const normalizedRegionParam = initialRegion.id
  const shouldSyncRegionParam = !regionOptionsLoading && regionParam !== normalizedRegionParam

  const layersParam = searchParams.get('layers')
  const selectedLayers = useMemo(() => getValidLayers(layersParam), [layersParam])
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

  const { isMobileWidth } = useResponsive()
  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('pixel')
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(initialRegion)
  const [layersDrawerOpen, setLayersDrawerOpen] = useState(false)
  const [trendsDrawerOpen, setTrendsDrawerOpen] = useState(!isMobileWidth)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>(
    initialRegion.regionType !== 'global'
      ? [defaultGlobalRegionOption, initialRegion]
      : [initialRegion],
  )

  const {
    minValue: sedDispersalMinValue,
    maxValue: sedDispersalMaxValue,
    isLoading: sedDispersalLoading,
  } = useRasterStatistics(SED_DISPERSAL_COLLECTION_ID, selectedRegion, latestYear)

  const {
    minValue: sedExportMinValue,
    maxValue: sedExportMaxValue,
    isLoading: sedExportLoading,
  } = useSedExportStatistics(selectedYear)

  // Update the active sed_dispersal tile URL when min/max values change; clear link when stats are unavailable
  useEffect(() => {
    setMapLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.layerId !== 'sed_dispersal' || layer.year !== selectedYear) {
          return layer
        }
        return {
          ...layer,
          link:
            !sedDispersalLoading && sedDispersalMinValue !== null && sedDispersalMaxValue !== null
              ? buildSedDispersalTileUrl(
                  SED_DISPERSAL_COLLECTION_ID,
                  buildSedDispersalItemId(selectedYear),
                  sedDispersalMaxValue,
                )
              : '',
        }
      }),
    )
  }, [sedDispersalMinValue, sedDispersalMaxValue, selectedYear, sedDispersalLoading])

  // Update the active sed_export tile URL when min/max values change; clear link when stats are unavailable
  useEffect(() => {
    setMapLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.layerId !== 'sed_export' || layer.year !== selectedYear) {
          return layer
        }
        return {
          ...layer,
          link:
            !sedExportLoading && sedExportMinValue !== null && sedExportMaxValue !== null
              ? buildSedExportTileUrl(selectedYear, sedExportMinValue, sedExportMaxValue)
              : '',
        }
      }),
    )
  }, [sedExportMinValue, sedExportMaxValue, selectedYear, sedExportLoading])

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
    if (!watershedParam && !dispersalPointParam) {
      setBreadcrumb(
        initialRegion.regionType !== 'global'
          ? [defaultGlobalRegionOption, initialRegion]
          : [initialRegion],
      )
    }
  }, [initialRegion, watershedParam, dispersalPointParam])

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

  const handleWatershedSelectionClear = useCallback(() => {
    clearSelectedFeature()
    handleWatershedChange(null)
  }, [clearSelectedFeature, handleWatershedChange])

  const handleDispersalPointChange = useCallback(
    (newDispersalPoint: { lat: number; lng: number } | null) => {
      updateSearchParams(
        (prev) => {
          const nextSearchParams = new URLSearchParams(prev)
          if (newDispersalPoint) {
            nextSearchParams.set(
              'dispersal-point',
              `${newDispersalPoint.lat.toFixed(LAT_LNG_PRECISION)},${newDispersalPoint.lng.toFixed(LAT_LNG_PRECISION)}`,
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

  const handlePlumeSelectionClear = useCallback(() => {
    clearSelectedPlumeWatershedStats()
    clearTopPolygonsFill('watershed')
    handleDispersalPointChange(null)
  }, [clearSelectedPlumeWatershedStats, clearTopPolygonsFill, handleDispersalPointChange])

  // Used by the region dropdown and breadcrumb navigation.
  // Clears watershed and plume state since the user is navigating to a different scope.
  const handleRegionDropdownChange = useCallback(
    (region: RegionOption) => {
      setSelectedRegion(region)
      updateSearchParams((prev) => {
        const nextSearchParams = new URLSearchParams(prev)
        nextSearchParams.set('region', region.id)
        nextSearchParams.delete('watershed')
        nextSearchParams.delete('dispersal-point')
        return nextSearchParams
      })
      clearSelectedFeature()
      clearSelectedPlumeWatershedStats()
      clearTopPolygonsFill('watershed')
      jumpToRegion(region)
    },
    [
      updateSearchParams,
      clearSelectedFeature,
      clearSelectedPlumeWatershedStats,
      clearTopPolygonsFill,
      jumpToRegion,
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

      if (toggledLayerId === 'sed_export') {
        if (isChecked) {
          toggleSedExportSubLayerFills(subSedLayerValue, selectedYear)
        } else {
          turnOffSedExportSubLayerFills()
        }
      } else if (toggledLayerId === 'lulc' && isChecked) {
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
          nextSearchParams.set('lat', viewState.latitude.toFixed(LAT_LNG_PRECISION))
          nextSearchParams.set('lng', viewState.longitude.toFixed(LAT_LNG_PRECISION))
          nextSearchParams.set('zoom', viewState.zoom.toFixed(ZOOM_PRECISION))
          return nextSearchParams
        },
        { replace: true },
      )
    },
    [updateSearchParams],
  )

  const handleUpOneLevelChange = (regionType: RegionType) => {
    switch (regionType) {
      case 'watershed':
        handleWatershedSelectionClear()
        break
      case 'country':
      case 'region':
        handleRegionDropdownChange(defaultGlobalRegionOption)
        break
      case 'plume':
        handlePlumeSelectionClear()
        break
    }
  }

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
    (basemap: Basemap) => {
      useMapStore.getState().prepareBasemapChange(showLabels)
      useMapStore.getState().restoreActiveSelection()

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
          open={layersDrawerOpen}
          onOpenChange={setLayersDrawerOpen}
          showLabels={showLabels}
          onLabelsChange={handleLabelsChange}
          onBasemapChange={handleBasemapChange}
          sedDispersalMinValue={sedDispersalMinValue ?? undefined}
          sedDispersalMaxValue={sedDispersalMaxValue ?? undefined}
          sedDispersalLoading={sedDispersalLoading}
          sedExportMinValue={sedExportMinValue ?? undefined}
          sedExportMaxValue={sedExportMaxValue ?? undefined}
          sedExportLoading={sedExportLoading}
        />
        <RegionSelect
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionDropdownChange}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
          regionOptions={regionOptions}
          regionOptionsLoading={regionOptionsLoading}
        />
        <YearSelect
          selectedYear={selectedYear}
          onChange={handleYearChange}
          availableYears={availableYears}
          disabled={yearsLoading}
        />
        <TrendsDrawer
          selectedRegion={selectedRegion}
          selectedYear={selectedYear}
          open={trendsDrawerOpen}
          onOpenChange={setTrendsDrawerOpen}
          onUpOneLevelChange={handleUpOneLevelChange}
        />
      </div>
      <BaseMap
        mapLayers={urlSyncedMapLayers}
        sedExportSubLayerValue={subSedLayerValue}
        onRegionChange={handleRegionChange}
        onWatershedChange={handleWatershedChange}
        onWatershedSelectionClear={handleWatershedSelectionClear}
        onDispersalPointChange={handleDispersalPointChange}
        onPlumeSelectionClear={handlePlumeSelectionClear}
        initialWatershedId={initialWatershedId}
        initialDispersalPoint={initialDispersalPoint}
        dispersalPoint={dispersalPoint}
        selectedYear={selectedYear}
        selectedBasemap={selectedBasemap}
        hasExplicitViewState={hasExplicitViewState}
        setBreadcrumb={setBreadcrumb}
        showLabels={showLabels}
        initialViewState={
          hasExplicitViewState
            ? { longitude: lng!, latitude: lat!, zoom: zoom! }
            : {
                bounds: defaultGlobalRegionOption.extent!,
                fitBoundsOptions: { padding: 40 },
              }
        }
        onMapMoveEnd={handleMapMoveEnd}
        isAnyDrawerOpen={layersDrawerOpen || trendsDrawerOpen}
        regionOptions={regionOptions}
      />
    </div>
  )
}
