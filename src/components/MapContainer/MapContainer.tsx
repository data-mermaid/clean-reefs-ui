import React, { useState } from 'react'
import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import RegionSelect from '../RegionSelect/RegionSelect'
import styles from './MapContainer.module.scss'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'

export default function MapContainer() {
  const [layerOn, setLayerOn] = useState(true)

  return (
    <div className={styles['MapContainer-root']}>
      <div className={styles['layer-controls']}>
        <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
        <RegionSelect />
      </div>
      <TrendsDrawer />
      <BaseMap protoLayerOn={layerOn} />
    </div>
  )
}
