import type { Meta, StoryObj } from '@storybook/react-vite'

import LayersDrawer from './LayersDrawer'
import { layers } from '../../data/mapData'

const meta = {
  component: LayersDrawer,
} satisfies Meta<typeof LayersDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    mapLayers: layers,
    setMapLayers: () => {},
    selectedYear: 2020,
  },
}

export default meta
