import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import LayersDrawer from './LayersDrawer'
import { defaultLayersToShow, layers } from '../../data/mapData'

const meta = {
  component: LayersDrawer,
} satisfies Meta<typeof LayersDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    mapLayers: layers,
    setMapLayers: () => {},
    selectedYear: 2020,
    selectedLayers: defaultLayersToShow,
    selectedBasemap: 'satellite',
    onLayerToggleChange: () => {},
    onSedSubLayerChange: () => {},
    subSedLayerValue: 'pixel',
    showLabels: true,
    onLabelsChange: () => {},
    onBasemapChange: () => {},
    open: false,
    onOpenChange: () => {},
  },
  render: (args) => {
    const [open, setOpen] = useState(args.open)
    return <LayersDrawer {...args} open={open} onOpenChange={setOpen} />
  },
}

export default meta
