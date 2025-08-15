import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'
import YearSelect from '../YearSelect/YearSelect'
import useResponsive from '../../hooks/useResponsive'

export default function MapContainer() {
  const { isMobileWidth } = useResponsive()
  const [layerOn, setLayerOn] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2020)

  return (
    <div className={styles['MapContainer-root']}>
      {isMobileWidth ? (
        <div className={styles['layer-controls-mobile']}>
          <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
          <RegionSelect />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
        </div>
      ) : (
        <div className={styles['layer-controls-desktop']}>
          <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
          <div>
            <RegionSelect />
            <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
          </div>
        </div>
      )}
      <TrendsDrawer />
      <BaseMap protoLayerOn={layerOn} />
    </div>
  )
}
