import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { LayerInfo } from '../../types/MapDataTypes'
import { getValidRegion, getValidYear } from '../../utils/routeUtils'

export default function MapContainer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const year = searchParams.get('year')
  const selectedYear = getValidYear(year)
  const normalizedYearParam = selectedYear.toString()
  const shouldSyncYearParam = year !== normalizedYearParam

  const regionParam = searchParams.get('region')
  const initialRegion = getValidRegion(regionParam)
  const normalizedRegionParam = initialRegion.id
  const shouldSyncRegionParam = regionParam !== normalizedRegionParam
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(initialRegion)

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>([selectedRegion])

  useEffect(() => {
    if (!shouldSyncYearParam && !shouldSyncRegionParam) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('year', normalizedYearParam)
    nextSearchParams.set('region', normalizedRegionParam)
    setSearchParams(nextSearchParams, { replace: true })
  }, [
    normalizedYearParam,
    normalizedRegionParam,
    searchParams,
    setSearchParams,
    shouldSyncYearParam,
    shouldSyncRegionParam,
  ])

  const handleRegionChange = useCallback(
    (region: RegionOption) => {
      setSelectedRegion(region)
      const nextSearchParams = new URLSearchParams(searchParams)
      nextSearchParams.set('region', region.id)
      setSearchParams(nextSearchParams)
    },
    [searchParams, setSearchParams],
  )

  const handleYearChange = (year: number) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('year', year.toString())
    setSearchParams(nextSearchParams)
  }

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer
          mapLayers={mapLayers}
          setMapLayers={setMapLayers}
          selectedYear={selectedYear}
        />
        <RegionSelect
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
        />
        <YearSelect selectedYear={selectedYear} onChange={handleYearChange} />
        <TrendsDrawer selectedRegion={selectedRegion} />
      </div>
      <BaseMap
        mapLayers={mapLayers}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
        setBreadcrumb={setBreadcrumb}
      />
    </div>
  )
}
