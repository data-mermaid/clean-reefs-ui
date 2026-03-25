import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers, urlControlledLayerIds } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { defaultGlobalRegionOption } from '../../data/regionData'
import { LayerInfo } from '../../types/MapDataTypes'
import { getValidLayers, getValidYear } from '../../utils/routeUtils'
import { useMapStore } from '../../stores/mapStore'

export default function MapContainer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const year = searchParams.get('year')
  const selectedYear = getValidYear(year)
  const normalizedYearParam = selectedYear.toString()
  const shouldSyncYearParam = year !== normalizedYearParam

  const layersParam = searchParams.get('layers')
  const selectedLayers = getValidLayers(layersParam)
  const normalizedLayersParam = selectedLayers.length > 0 ? selectedLayers.join(',') : 'none'
  const shouldSyncLayersParam = layersParam !== normalizedLayersParam

  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)
  const turnOffSedExportSubLayerFills = useMapStore((state) => state.turnOffSedExportSubLayerFills)

  const [subSedLayerValue, setSubLayerValue] = useState<'pixel' | 'watershed'>('pixel')

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
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

  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultGlobalRegionOption)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>([selectedRegion])

  useEffect(() => {
    if (!shouldSyncYearParam && !shouldSyncLayersParam) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('year', normalizedYearParam)
    nextSearchParams.set('layers', normalizedLayersParam)
    setSearchParams(nextSearchParams, { replace: true })
  }, [
    normalizedYearParam,
    searchParams,
    setSearchParams,
    shouldSyncYearParam,
    shouldSyncLayersParam,
    normalizedLayersParam,
  ])

  const handleYearChange = (year: number) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('year', year.toString())
    setSearchParams(nextSearchParams)

    if (selectedLayers.includes('sed_export')) {
      toggleSedExportSubLayerFills(subSedLayerValue, year)
    }
  }

  const handleLayerToggleChange = (toggledLayerId: string | null, isChecked: boolean) => {
    const sedExportAndLandUseLayers = ['sed_export', 'lulc']
    if (!toggledLayerId) {
      return
    }

    setSearchParams((prevSearchParams) => {
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
  }

  const handleSedSubLayerChange = (subLayerValue: 'pixel' | 'watershed') => {
    setSubLayerValue(subLayerValue)
    toggleSedExportSubLayerFills(subLayerValue, selectedYear)
  }

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
          setSelectedRegion={setSelectedRegion}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
        />
        <YearSelect selectedYear={selectedYear} onChange={handleYearChange} />
        <TrendsDrawer selectedRegion={selectedRegion} />
      </div>
      <BaseMap
        mapLayers={urlSyncedMapLayers}
        sedExportSubLayerValue={subSedLayerValue}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        setBreadcrumb={setBreadcrumb}
      />
    </div>
  )
}
