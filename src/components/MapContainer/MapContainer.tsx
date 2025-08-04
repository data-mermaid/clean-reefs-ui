import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import React, { useState } from 'react'
import TrendsDrawer from '../TrendsDrawer/TrendsDrawer'

export default function MapContainer() {
  const [layerOn, setLayerOn] = useState(true)

  return (
    <>
      <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
      <TrendsDrawer />
      <BaseMap protoLayerOn={layerOn} />
    </>
  )
}
