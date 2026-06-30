import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import Sidebar, { ActivePanel } from '../Sidebar/Sidebar'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers, urlControlledLayerIds, sedLoadAndLandUseLayers } from '../../data/mapData'
import { LAT_LNG_PRECISION, ZOOM_PRECISION, SED_EXPOSURE_COLLECTION_ID } from '../../constants'
import { RegionOption, RegionType } from '../../types/RegionDataTypes'
import { LayerInfo } from '../../types/MapDataTypes'
import { Basemap, buildBreadcrumbFromRegion } from '../../utils/mapUtils'
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
import GeoSearchBar from '../GeoSearchControl/GeoSearchBar'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { defaultGlobalRegionOption } from '../../data/regionData'
import useResponsive from '../../hooks/useResponsive'
import useRasterStatistics from '../../hooks/useRasterStatistics'
import useSedLoadStatistics from '../../hooks/useSedLoadStatistics'
import useAvailableYears from '../../hooks/useAvailableYears'
import useRegionOptions from '../../hooks/useRegionOptions'
import {
  buildSedExposureItemId,
  buildSedExposureTileUrl,
  buildSedLoadTileUrl,
} from '../../utils/titilerUtils'

export default function MapContainer() {
  const toggleSedLoadSubLayerFills = useMapStore((state) => state.toggleSedLoadSubLayerFills)
  const turnOffSedLoadSubLayerFills = useMapStore((state) => state.turnOffSedLoadSubLayerFills)
  const clearTopPolygonsFill = useMapStore((s) => s.clearTopPolygonsFill)
  const jumpToRegion = useMapStore((s) => s.jumpToRegion)
  const clearSelectedFeature = useSelectedFeatureStore((s) => s.clearSelectedFeature)
  const clearSelectedDispersalWatershedStats = useSelectedFeatureStore(
    (s) => s.clearSelectedDispersalWatershedStats,
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

  const { isPanelMobile } = useResponsive()
  const isGeoSearchOpen = useMapStore((s) => s.isGeoSearchOpen)
  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('pixel')
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(initialRegion)
  const [activePanel, setActivePanel] = useState<ActivePanel>(() =>
    isPanelMobile ? null : 'graphs',
  )
  const [isChartsLoading, setIsChartsLoading] = useState(false)

  const togglePanel = useCallback((panel: Exclude<ActivePanel, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }, [])
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>(
    initialRegion.regionType !== 'global'
      ? [defaultGlobalRegionOption, initialRegion]
      : [initialRegion],
  )

  const {
    minValue: sedExposureMinValue,
    maxValue: sedExposureMaxValue,
    isLoading: sedExposureLoading,
  } = useRasterStatistics(SED_EXPOSURE_COLLECTION_ID, selectedRegion, latestYear)

  const {
    minValue: sedLoadMinValue,
    maxValue: sedLoadMaxValue,
    isLoading: sedLoadLoading,
  } = useSedLoadStatistics(latestYear)

  // Update the active sed_exposure tile URL when min/max values change; clear link when stats are unavailable
  useEffect(() => {
    setMapLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.layerId !== 'sed_exposure' || layer.year !== selectedYear) {
          return layer
        }
        return {
          ...layer,
          link:
            !sedExposureLoading && sedExposureMinValue !== null && sedExposureMaxValue !== null
              ? buildSedExposureTileUrl(
                  SED_EXPOSURE_COLLECTION_ID,
                  buildSedExposureItemId(selectedYear),
                  sedExposureMaxValue,
                )
              : '',
        }
      }),
    )
  }, [sedExposureMinValue, sedExposureMaxValue, selectedYear, sedExposureLoading])

  // Update the active sed_load tile URL when min/max values change; clear link when stats are unavailable
  useEffect(() => {
    setMapLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.layerId !== 'sed_load' || layer.year !== selectedYear) {
          return layer
        }
        return {
          ...layer,
          link:
            !sedLoadLoading && sedLoadMinValue !== null && sedLoadMaxValue !== null
              ? buildSedLoadTileUrl(selectedYear, sedLoadMinValue, sedLoadMaxValue)
              : '',
        }
      }),
    )
  }, [sedLoadMinValue, sedLoadMaxValue, selectedYear, sedLoadLoading])

  const latestSearchParamsRef = useRef(new URLSearchParams(searchParams))

  const urlSyncedMapLayers = useMemo(
    () =>
      mapLayers.map((layer) => {
        if (!urlControlledLayerIds.includes(layer.layerId)) {
          if (layer.year !== undefined) {
            return { ...layer, isLayerOn: layer.isLayerOn && layer.year === selectedYear }
          }
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

  // regionOptions in deps so the breadcrumb is rebuilt once real data loads and replaces the fallback.
  useEffect(() => {
    setSelectedRegion(initialRegion)
    if (!watershedParam && !dispersalPointParam) {
      setBreadcrumb(buildBreadcrumbFromRegion(initialRegion, regionOptions))
    }
  }, [initialRegion, watershedParam, dispersalPointParam, regionOptions])

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

  const handleDispersalSelectionClear = useCallback(() => {
    clearSelectedDispersalWatershedStats()
    clearTopPolygonsFill('watershed')
    handleDispersalPointChange(null)
  }, [clearSelectedDispersalWatershedStats, clearTopPolygonsFill, handleDispersalPointChange])

  // Used by the region dropdown and breadcrumb navigation.
  // Clears watershed and dispersal state since the user is navigating to a different scope.
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
      clearSelectedDispersalWatershedStats()
      clearTopPolygonsFill('watershed')
      jumpToRegion(region)
    },
    [
      updateSearchParams,
      clearSelectedFeature,
      clearSelectedDispersalWatershedStats,
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

      if (selectedLayers.includes('sed_load')) {
        toggleSedLoadSubLayerFills(subSedLayerValue, year)
      }
    },
    [updateSearchParams, selectedLayers, toggleSedLoadSubLayerFills, subSedLayerValue],
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
          if (sedLoadAndLandUseLayers.includes(toggledLayerId)) {
            sedLoadAndLandUseLayers.forEach((layerId) => layerSet.delete(layerId))
          }
          layerSet.add(toggledLayerId)
        }

        nextSearchParams.set('layers', Array.from(layerSet).join(',') || 'none')
        return nextSearchParams
      })

      if (toggledLayerId === 'sed_load') {
        if (isChecked) {
          toggleSedLoadSubLayerFills(subSedLayerValue, selectedYear)
        } else {
          turnOffSedLoadSubLayerFills()
        }
      } else if (toggledLayerId === 'lulc' && isChecked) {
        turnOffSedLoadSubLayerFills()
      }
    },
    [
      updateSearchParams,
      subSedLayerValue,
      selectedYear,
      toggleSedLoadSubLayerFills,
      turnOffSedLoadSubLayerFills,
    ],
  )

  const handleSedSubLayerChange = (subLayerValue: 'pixel' | 'watershed') => {
    setSubLayerValue(subLayerValue)
    toggleSedLoadSubLayerFills(subLayerValue, selectedYear)
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
      case 'region': {
        const parent = breadcrumb[breadcrumb.length - 2] ?? defaultGlobalRegionOption
        handleRegionDropdownChange(parent)
        break
      }
      case 'dispersal':
        handleDispersalSelectionClear()
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
      <Sidebar
        activePanel={activePanel}
        onTogglePanel={togglePanel}
        isChartsLoading={isChartsLoading}
      />
      <div className={styles['breadcrumb-slot']}>
        <RegionSelect
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionDropdownChange}
          onUpOneLevelChange={handleUpOneLevelChange}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
          regionOptions={regionOptions}
          regionOptionsLoading={regionOptionsLoading}
        />
      </div>
      <div className={styles['year-slot']}>
        <YearSelect
          selectedYear={selectedYear}
          onChange={handleYearChange}
          availableYears={availableYears}
          disabled={yearsLoading}
        />
      </div>
      {isGeoSearchOpen && isPanelMobile && (
        <div className={styles['search-slot']}>
          <GeoSearchBar />
        </div>
      )}
      <LayersDrawer
        mapLayers={urlSyncedMapLayers}
        setMapLayers={setMapLayers}
        selectedYear={selectedYear}
        selectedLayers={selectedLayers}
        selectedBasemap={selectedBasemap}
        onLayerToggleChange={handleLayerToggleChange}
        onSedSubLayerChange={handleSedSubLayerChange}
        subSedLayerValue={subSedLayerValue}
        open={activePanel === 'layers'}
        showLabels={showLabels}
        onLabelsChange={handleLabelsChange}
        onBasemapChange={handleBasemapChange}
        sedExposureMinValue={sedExposureMinValue ?? undefined}
        sedExposureMaxValue={sedExposureMaxValue ?? undefined}
        sedExposureLoading={sedExposureLoading}
        sedLoadMinValue={sedLoadMinValue ?? undefined}
        sedLoadMaxValue={sedLoadMaxValue ?? undefined}
        sedLoadLoading={sedLoadLoading}
      />
      <TrendsDrawer
        selectedRegion={selectedRegion}
        selectedYear={selectedYear}
        open={activePanel === 'graphs'}
        isChartsLoading={isChartsLoading}
        onChartsLoadingChange={setIsChartsLoading}
      />
      <BaseMap
        mapLayers={urlSyncedMapLayers}
        sedLoadSubLayerValue={subSedLayerValue}
        onRegionChange={handleRegionChange}
        onWatershedChange={handleWatershedChange}
        onWatershedSelectionClear={handleWatershedSelectionClear}
        onDispersalPointChange={handleDispersalPointChange}
        onDispersalSelectionClear={handleDispersalSelectionClear}
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
        isAnyPanelOpen={activePanel !== null}
        regionOptions={regionOptions}
      />
    </div>
  )
}
