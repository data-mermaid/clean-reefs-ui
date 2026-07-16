import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import Sidebar, { ActivePanel } from '../Sidebar/Sidebar'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import {
  layers,
  urlControlledLayerIds,
  sedLoadAndLandUseLayers,
  benthicSubLayers,
  atlasBenthicColors,
  transparent,
} from '../../data/mapData'
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
  getValidCoastlines,
  getValidRivers,
} from '../../utils/routeUtils'
import { useMapStore } from '../../stores/mapStore'
import GeoSearchBar from '../GeoSearchControl/GeoSearchBar'
import { useSelectedFeatureStore } from '../../stores/selectedFeatureStore'
import { defaultGlobalRegionOption } from '../../data/regionData'
import useResponsive from '../../hooks/useResponsive'
import useSedExposureStatistics from '../../hooks/useSedExposureStatistics'
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
  const watershedSedLoadMin = useMapStore((s) => s.watershedSedLoadMin)
  const watershedSedLoadMax = useMapStore((s) => s.watershedSedLoadMax)
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
  const parentRegionParam = searchParams.get('parentRegion')
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
  const shouldSyncLabelsParam = labelsParam !== normalizedLabelsParam

  const basemapParam = searchParams.get('basemap')
  const selectedBasemap = getValidBasemap(basemapParam)
  const shouldSyncBasemapParam = basemapParam !== selectedBasemap

  const coastlinesParam = searchParams.get('coastlines')
  const showCoastlines = getValidCoastlines(coastlinesParam)
  const normalizedCoastlinesParam = showCoastlines ? 'true' : 'false'
  const shouldSyncCoastlinesParam = coastlinesParam !== normalizedCoastlinesParam

  const riversParam = searchParams.get('rivers')
  const showRivers = getValidRivers(riversParam)
  const normalizedRiversParam = showRivers ? 'true' : 'false'
  const shouldSyncRiversParam = riversParam !== normalizedRiversParam

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
  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('watershed')
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
  } = useSedExposureStatistics(SED_EXPOSURE_COLLECTION_ID, selectedRegion, latestYear)

  const {
    minValue: sedLoadMinValue,
    maxValue: sedLoadMaxValue,
    p98Value: sedLoadP98Value,
    isLoading: sedLoadLoading,
  } = useSedLoadStatistics(latestYear, selectedRegion)

  // Update the active sed_exposure tile URL when min/max values change; clear link when stats are unavailable
  useEffect(() => {
    setMapLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.layerId !== 'sed_exposure' || layer.year !== selectedYear) {
          return layer
        }
        const link =
          !sedExposureLoading && sedExposureMinValue !== null && sedExposureMaxValue !== null
            ? buildSedExposureTileUrl(
                SED_EXPOSURE_COLLECTION_ID,
                buildSedExposureItemId(selectedYear),
                sedExposureMaxValue,
                selectedRegion,
              )
            : ''
        return { ...layer, link }
      }),
    )
  }, [sedExposureMinValue, sedExposureMaxValue, selectedYear, sedExposureLoading, selectedRegion])

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
              ? buildSedLoadTileUrl(
                  selectedYear,
                  sedLoadMinValue,
                  sedLoadMaxValue,
                  selectedRegion,
                  sedLoadP98Value ?? undefined,
                )
              : '',
        }
      }),
    )
  }, [
    sedLoadMinValue,
    sedLoadMaxValue,
    sedLoadP98Value,
    selectedYear,
    sedLoadLoading,
    selectedRegion,
  ])

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

  const benthicFillColors = useMemo(
    () =>
      Object.fromEntries(
        benthicSubLayers.map((l) => [
          l.layerId,
          selectedLayers.includes(l.layerId) ? atlasBenthicColors[l.layerId] : transparent,
        ]),
      ),
    [selectedLayers],
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
      !shouldSyncBasemapParam &&
      !shouldSyncCoastlinesParam &&
      !shouldSyncRiversParam
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
        nextSearchParams.set('coastlines', normalizedCoastlinesParam)
        nextSearchParams.set('rivers', normalizedRiversParam)
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
    normalizedCoastlinesParam,
    normalizedRiversParam,
    shouldSyncYearParam,
    shouldSyncRegionParam,
    shouldSyncLayersParam,
    shouldSyncLabelsParam,
    shouldSyncBasemapParam,
    shouldSyncCoastlinesParam,
    shouldSyncRiversParam,
  ])

  // regionOptions in deps so the breadcrumb is rebuilt once real data loads and replaces the fallback.
  // parentRegionParam encodes which group a multi-region country was selected from (e.g. Thailand
  // under WIP vs CIP) so that context survives the URL-driven re-initialization.
  useEffect(() => {
    let regionToSet = initialRegion
    let parentRegion: RegionOption | undefined
    if (parentRegionParam && initialRegion.regionType === 'country') {
      const parentIds = initialRegion.parentRegionIds ?? []
      if (parentIds.includes(parentRegionParam) && parentIds[0] !== parentRegionParam) {
        regionToSet = {
          ...initialRegion,
          parentRegionIds: [
            parentRegionParam,
            ...parentIds.filter((id) => id !== parentRegionParam),
          ],
        }
      }
      parentRegion = regionOptions.find(
        (r) => r.regionType === 'region' && r.id === parentRegionParam,
      )
    }
    setSelectedRegion(regionToSet)
    if (!watershedParam && !dispersalPointParam) {
      setBreadcrumb(buildBreadcrumbFromRegion(regionToSet, regionOptions, parentRegion))
    }
  }, [initialRegion, watershedParam, dispersalPointParam, regionOptions, parentRegionParam])

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
        // Persist the first parentRegionId so the useEffect re-initialization uses the correct
        // region context (e.g. Thailand selected from WIP vs CIP).
        if (region.regionType === 'country' && region.parentRegionIds?.[0]) {
          nextSearchParams.set('parentRegion', region.parentRegionIds[0])
        } else {
          nextSearchParams.delete('parentRegion')
        }
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

  const handleCoastlinesChange = useCallback(
    (show: boolean) => {
      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('coastlines', show ? 'true' : 'false')
        return nextSearchParams
      })
    },
    [updateSearchParams],
  )

  const handleRiversChange = useCallback(
    (show: boolean) => {
      updateSearchParams((prevSearchParams) => {
        const nextSearchParams = new URLSearchParams(prevSearchParams)
        nextSearchParams.set('rivers', show ? 'true' : 'false')
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

  const displayedSedLoadMin =
    subSedLayerValue === 'watershed'
      ? (watershedSedLoadMin ?? undefined)
      : (sedLoadMinValue ?? undefined)
  const displayedSedLoadMax =
    subSedLayerValue === 'watershed'
      ? (watershedSedLoadMax ?? undefined)
      : (sedLoadMaxValue ?? undefined)

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
        showCoastlines={showCoastlines}
        onCoastlinesChange={handleCoastlinesChange}
        showRivers={showRivers}
        onRiversChange={handleRiversChange}
        sedExposureMinValue={sedExposureMinValue ?? undefined}
        sedExposureMaxValue={sedExposureMaxValue ?? undefined}
        sedExposureLoading={sedExposureLoading}
        sedLoadMinValue={displayedSedLoadMin}
        sedLoadMaxValue={displayedSedLoadMax}
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
        showCoastlines={showCoastlines}
        showRivers={showRivers}
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
        selectedRegion={selectedRegion}
        benthicFillColors={benthicFillColors}
      />
    </div>
  )
}
