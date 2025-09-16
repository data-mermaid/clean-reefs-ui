import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { defaultRegionOption } from '../../data/regionData'
import { ChartedData } from '../../types/GraphDataTypes'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

const mockGraphData: ChartedData[] | null = null

export const Primary: Story = {
  args: {
    lulcGraphData: mockGraphData,
    selectedRegion: defaultRegionOption,
  },
}

export default meta
