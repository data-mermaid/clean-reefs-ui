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
  },
}

export default meta
