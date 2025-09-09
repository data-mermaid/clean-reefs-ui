import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { ChartedData } from '../../utils/updateGraph'
import { defaultOption } from '../../types/RegionDataTypes'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

const mockGraphData: ChartedData[] | null = null

export const Primary: Story = {
  args: {
    lulcGraphData: mockGraphData,
    selectedRegion: defaultOption,
  },
}

//TODO: Update
export const NoData: Story = {
  args: {
    lulcGraphData: mockGraphData,
    selectedRegion: defaultOption,
  },
}

//TODO: Update
export const Loading: Story = {
  args: {
    lulcGraphData: mockGraphData,
    selectedRegion: defaultOption,
  },
}

export default meta
