import type { Meta, StoryObj } from '@storybook/react-vite'

import GraphCard from './GraphCard'
import { ChartedData } from '../../utils/updateGraph'
import mockOutputGraphData from '../../tests/mockOutputGraphData.json'
const meta = {
  component: GraphCard,
} satisfies Meta<typeof GraphCard>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    graphName: 'Primary graph card',
    graphData: mockOutputGraphData as ChartedData[],
  },
}

export const Loading: Story = {
  args: {
    open: true,
    graphName: 'Loading',
    graphData: null,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    graphName: 'Closed graph card',
    graphData: mockOutputGraphData as ChartedData[],
  },
}

export default meta
