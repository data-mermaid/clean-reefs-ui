import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'
import { LayerInfo, layers } from '../../data/mapData'
import { ChartedData } from '../../utils/graphUtils'
import { RegionOption } from '../../types/RegionDataTypes'
import { defaultRegionOption } from '../../data/regionData'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [lulcGraphData, setLulcGraphData] = useState<ChartedData[] | null>(null)
  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [selectedYear, setSelectedYear] = useState(2000)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultRegionOption)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer mapLayers={mapLayers} setMapLayers={setMapLayers} />
          <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer mapLayers={mapLayers} setMapLayers={setMapLayers} />
          <div>
            <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      )}
      <BaseMap
        mapLayers={mapLayers}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        setLulcGraphData={setLulcGraphData}
      />
    </div>
  )
}
