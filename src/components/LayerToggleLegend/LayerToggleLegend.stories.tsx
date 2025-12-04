import LayerToggleLegend from './LayerToggleLegend'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { atlasBenthicLayers } from '../../data/mapData'

const meta = {
  component: LayerToggleLegend,
} satisfies Meta<typeof LayerToggleLegend>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    mapSubLayers: atlasBenthicLayers,
    toggleSubLayer: () => {},
  },
}
export default meta
