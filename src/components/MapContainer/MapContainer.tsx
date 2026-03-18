import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import { layers } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { defaultGlobalRegionOption } from '../../data/regionData'
import { LayerInfo } from '../../types/MapDataTypes'
import { getValidYear } from '../../utils/routeUtils'

export default function MapContainer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const year = searchParams.get('year')
  const selectedYear = getValidYear(year)
  const normalizedYearParam = selectedYear.toString()
  const shouldSyncYearParam = year !== normalizedYearParam

  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultGlobalRegionOption)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>([selectedRegion])

  useEffect(() => {
    if (!shouldSyncYearParam) {
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('year', normalizedYearParam)
    setSearchParams(nextSearchParams, { replace: true })
  }, [normalizedYearParam, searchParams, setSearchParams, shouldSyncYearParam])

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
          setSelectedRegion={setSelectedRegion}
          breadcrumb={breadcrumb}
          setBreadcrumb={setBreadcrumb}
        />
        <YearSelect selectedYear={selectedYear} onChange={handleYearChange} />
        <TrendsDrawer selectedRegion={selectedRegion} />
      </div>
      <BaseMap
        mapLayers={mapLayers}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        setBreadcrumb={setBreadcrumb}
      />
    </div>
  )
}
