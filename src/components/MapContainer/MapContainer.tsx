import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'
import { LayerInfo, layers } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { defaultRegionOption } from '../../data/regionData'
import { ChartProperties } from '../../types/ChartDataTypes'
import { tempGlobalChartSeriesData } from '../../data/tempGlobalChartSeriesData'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [chartConfigData, setChartConfigData] = useState<ChartProperties[] | null>(
    tempGlobalChartSeriesData,
  )
  const [mapLayers, setMapLayers] = useState<LayerInfo[]>(layers)
  const [selectedYear, setSelectedYear] = useState(2020)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultRegionOption)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer
            mapLayers={mapLayers}
            setMapLayers={setMapLayers}
            selectedYear={selectedYear}
          />
          <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer selectedRegion={selectedRegion} chartConfigData={chartConfigData} />
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer
            mapLayers={mapLayers}
            setMapLayers={setMapLayers}
            selectedYear={selectedYear}
          />
          <div>
            <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer selectedRegion={selectedRegion} chartConfigData={chartConfigData} />
        </div>
      )}
      <BaseMap
        mapLayers={mapLayers}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        setChartConfigData={setChartConfigData}
      />
    </div>
  )
}
