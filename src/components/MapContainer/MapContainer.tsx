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
  const normalizedLayersParam = selectedLayers.join(',')
  const shouldSyncLayersParam = layersParam !== normalizedLayersParam

  const toggleSedExportSubLayerFills = useMapStore((state) => state.toggleSedExportSubLayerFills)

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)

  // isLayerOn for URL-controlled layers is derived from URL params + selectedYear
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
    toggleSedExportSubLayerFills('pixel', year)
  }

  const handleLayerToggleChange = (layerId: string | null, isChecked: boolean) => {
    if (!layerId) {
      return
    }

    setSearchParams((prevSearchParams) => {
      const sedExportAndLandUseLayers = ['sed_export', 'lulc']
      const isRasterLayer = sedExportAndLandUseLayers.includes(layerId)
      const nextSearchParams = new URLSearchParams(prevSearchParams)
      const currentLayers = nextSearchParams.get('layers') || ''
      const layerSet = new Set(currentLayers.split(',').filter((l) => l))

      if (isChecked) {
        if (isRasterLayer) {
          sedExportAndLandUseLayers
            .filter((rasterLayerId) => rasterLayerId !== layerId)
            .forEach((rasterLayerId) => layerSet.delete(rasterLayerId))
        }
        layerSet.add(layerId)
      } else {
        layerSet.delete(layerId)
      }

      nextSearchParams.set('layers', Array.from(layerSet).join(','))
      return nextSearchParams
    })
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
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        setBreadcrumb={setBreadcrumb}
      />
    </div>
  )
}
