import LayersDrawer from '../LayersDrawer/LayersDrawer'
import BaseMap from '../BaseMap/BaseMap'
import React, { useState } from 'react'

export default function MapContainer() {
  const [layerOn, setLayerOn] = useState(true)

  return (
    <>
      <LayersDrawer layerOn={layerOn} setLayerOn={setLayerOn} />
      <BaseMap protoLayerOn={layerOn} />
    </>
  )
}
