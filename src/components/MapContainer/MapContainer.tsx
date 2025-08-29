import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'
import { layers } from '../../data/mapData'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [selectedYear, setSelectedYear] = useState(2020)
  const [layersOn, setLayersOn] = useState(layers)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls--mobile']}>
          <LayersDrawer layersOn={layersOn} setLayersOn={setLayersOn} />
          <RegionSelect />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          <TrendsDrawer />
        </div>
      ) : (
        <div className={styles['layer-controls--desktop']}>
          <LayersDrawer layersOn={layersOn} setLayersOn={setLayersOn} />
          <div>
            <RegionSelect />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
          <TrendsDrawer />
        </div>
      )}
      <BaseMap layersOn={layersOn} />
    </div>
  )
}
