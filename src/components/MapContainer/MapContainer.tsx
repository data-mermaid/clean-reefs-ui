import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import YearSelect from '../YearSelect/YearSelect'

export default function MapContainer() {
  const [layerOn, setLayerOn] = useState(true)
  const [selectedYear, setSelectedYear] = useState(2020)

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
        <div className={styles['selectors']}>
          <RegionSelect />
          <YearSelect selectedYear={selectedYear} onChange={setSelectedYear} />
        </div>
      </div>
      <BaseMap protoLayerOn={layerOn} />
    </div>
  )
}
