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
  const [layerIdsOn, setLayerIdsOn] = useState<[]>([])
  const [selectedYear, setSelectedYear] = useState(2000)
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(defaultOption)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer
            layersAvailable={layers}
            layerIdsOn={layerIdsOn}
            setLayerIdsOn={setLayerIdsOn}
          />
          <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer
            layersAvailable={layers}
            layerIdsOn={layerIdsOn}
            setLayerIdsOn={setLayerIdsOn}
          />
          <div>
            <RegionSelect selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer selectedRegion={selectedRegion} lulcGraphData={lulcGraphData} />
        </div>
      )}
      <BaseMap
        layersAvailable={layers}
        // layerIdsOn={layerIdsOn}
        setLulcGraphData={setLulcGraphData}
      />
      {/*  layerIdsOn={layerIdsOn}*/}
    </div>
  )
}
