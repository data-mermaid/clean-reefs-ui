import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'
import { layers } from '../../data/mapData'
import { ChartedData } from '../../utils/updateGraph'
import { defaultOption, RegionOption } from '../../types/RegionDataTypes'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [lulcGraphData, setLulcGraphData] = useState<ChartedData[] | null>(null) //default:global todo: remove null
  const [layersOn, setLayersOn] = useState<[]>([]) //TODO: filter through the ones that are actively on. This fn should remove any non-'on' items
  const [selectedYear, setSelectedYear] = useState(2000)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultOption)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer layersAvailable={layers} layersOn={layersOn} setLayersOn={setLayersOn} />
          <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer layersAvailable={layers} layersOn={layersOn} setLayersOn={setLayersOn} />
          <div>
            <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      )}
      <BaseMap layersAvailable={layers} setLulcGraphData={setLulcGraphData} />
      {/*  layersOn={layersOn}*/}
    </div>
  )
}
