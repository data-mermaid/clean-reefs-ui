import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useControl } from 'react-map-gl/maplibre'
import type { IControl } from 'maplibre-gl'
import CoordinatesDisplay from './CoordinatesDisplay'

class CoordinatesContainer implements IControl {
  private container: HTMLDivElement | null = null
  private onContainerReady: (el: HTMLDivElement) => void

  constructor(onContainerReady: (el: HTMLDivElement) => void) {
    this.onContainerReady = onContainerReady
  }

  onAdd(): HTMLDivElement {
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl custom-ctrl-coordinates-display'
    this.onContainerReady(this.container)
    return this.container
  }

  onRemove(): void {
    this.container?.remove()
    this.container = null
  }
}

interface CoordinatesMapControlProps {
  lat: number | null
  lng: number | null
}

export default function CoordinatesMapControl({ lat, lng }: CoordinatesMapControlProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useControl(
    () => new CoordinatesContainer((el) => setContainer(el)),
    { position: 'bottom-right' },
  )

  if (!container) {
    return null
  }
  return createPortal(<CoordinatesDisplay lat={lat} lng={lng} />, container)
}
