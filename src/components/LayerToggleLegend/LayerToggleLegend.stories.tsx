import LayerToggleLegend from './LayerToggleLegend'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { benthicSubLayers } from '../../data/mapData'

const meta = {
  component: LayerToggleLegend,
} satisfies Meta<typeof LayerToggleLegend>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    mapSubLayers: benthicSubLayers,
    toggleSubLayer: () => {},
  },
}
export default meta
