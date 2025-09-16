import type { Meta, StoryObj } from '@storybook/react-vite'

import GraphCard from './GraphCard'
import { mockGraphData } from '../../data/mapData'

const meta = {
  component: GraphCard,
} satisfies Meta<typeof GraphCard>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    graphName: 'Primary graph card',
    graphData: mockGraphData,
  },
}

export const NoData: Story = {
  args: {
    open: false,
    graphName: 'No data graph card',
    graphData: null,
  },
}

export default meta
