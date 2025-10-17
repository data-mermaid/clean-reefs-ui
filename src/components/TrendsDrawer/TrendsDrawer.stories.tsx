import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { defaultRegionOption } from '../../data/regionData'
import { mockChartConfig } from '../../tests/mockChartConfig'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    chartConfigData: [mockChartConfig],
    selectedRegion: defaultRegionOption,
  },
}

export default meta
