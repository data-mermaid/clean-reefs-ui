import type { Meta, StoryObj } from '@storybook/react-vite'

import LayerToggleCard from './LayerToggleCard'
import { benthicSubLayers, layers } from '../../data/mapData'

const meta = {
  component: LayerToggleCard,
} satisfies Meta<typeof LayerToggleCard>

type Story = StoryObj<typeof meta>

const getLayerBySourceId = (name: string) => {
  const foundLayer = layers.find((layer) => layer.sourceId === name)
  return foundLayer ? { ...foundLayer, isLayerOn: true } : layers[0]
}

export const Primary: Story = {
  args: {
    layer: layers[0],
    toggleLayer: () => {},
    toggleSubLayer: () => {},
    selectedYear: 2020,
    subSedLayerValue: 'pixel',
    onSedSubLayerChange: () => {},
  },
}

export const SedLoad: Story = {
  args: {
    layer: getLayerBySourceId('sed_load_2000_visual'),
    toggleLayer: () => {},
    toggleSubLayer: () => {},
    selectedYear: 2000,
    subSedLayerValue: 'pixel',
    onSedSubLayerChange: () => {},
  },
}

// Upcoming
// export const ReefExposure: Story = {
//   args: {
//     layer: layers[3],
//     toggleLayer: () => {},
//     selectedYear: 2000,
//   },
// }

export const Benthic: Story = {
  args: {
    layer: getLayerBySourceId('atlas-benthic'),
    toggleLayer: () => {},
    selectedYear: 2000,
    toggleSubLayer: () => {},
    mapSubLayers: benthicSubLayers,
    subSedLayerValue: 'pixel',
    onSedSubLayerChange: () => {},
  },
}

export const Lulc: Story = {
  args: {
    layer: getLayerBySourceId('lulc_2000_visual'),
    toggleLayer: () => {},
    toggleSubLayer: () => {},
    selectedYear: 2000,
    subSedLayerValue: 'pixel',
    onSedSubLayerChange: () => {},
  },
}
export default meta
