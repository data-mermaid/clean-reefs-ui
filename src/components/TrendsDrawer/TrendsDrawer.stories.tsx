import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { defaultGlobalRegionOption } from '../../data/regionData'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    selectedRegion: defaultGlobalRegionOption,
    selectedYear: 2020,
    open: true,
    isChartsLoading: false,
    onChartsLoadingChange: () => {},
  },
}

export const Loading: Story = {
  args: {
    selectedRegion: defaultGlobalRegionOption,
    selectedYear: 2020,
    open: true,
    isChartsLoading: true,
    onChartsLoadingChange: () => {},
  },
}

export default meta
