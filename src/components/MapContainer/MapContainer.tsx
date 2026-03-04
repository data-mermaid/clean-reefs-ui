import React, { useState } from 'react'
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

export default function MapContainer() {
  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [selectedYear, setSelectedYear] = useState(2020)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultGlobalRegionOption)
  const [breadcrumb, setBreadcrumb] = useState<RegionOption[]>([selectedRegion])

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer
          mapLayers={mapLayers}
          setMapLayers={setMapLayers}
          selectedYear={selectedYear}
        />
        <div>
          <RegionSelect
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            breadcrumb={breadcrumb}
            setBreadcrumb={setBreadcrumb}
          />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
        </div>
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
