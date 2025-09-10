import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'
import { LayerInfo, layers } from '../../data/mapData'
import { ChartedData } from '../../utils/updateGraph'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [lulcGraphData, setLulcGraphData] = useState<ChartedData[] | null>(null) //default:global todo: remove null
  const [layersOn, setLayersOn] = useState<LayerInfo[]>(layers) //TODO: filter through the ones that are actively on. This fn should remove any non-'on' items
  const [selectedYear, setSelectedYear] = useState(2000)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer layersOn={layersOn} setLayersOn={setLayersOn} />
          <RegionSelect />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer lulcGraphData={lulcGraphData} />
          {/*  TODO: Add  layersOn={layersOn} */}
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer layersOn={layersOn} setLayersOn={setLayersOn} />
          <div>
            <RegionSelect />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer lulcGraphData={lulcGraphData} />
          {/*  TODO: Add  layersOn={layersOn} */}
        </div>
      )}
      <BaseMap layersOn={layersOn} setLulcGraphData={setLulcGraphData} />
    </div>
  )
}
