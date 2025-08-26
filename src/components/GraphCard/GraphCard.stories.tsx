import type { Meta, StoryObj } from '@storybook/react-vite'

import GraphCard from './GraphCard'

const meta = {
  component: GraphCard,
} satisfies Meta<typeof GraphCard>

type Story = StoryObj<typeof meta>
const mockGraphData = [
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [14, 23, 17, 10, 4],
    name: 'Bare Ground',
    type: 'bar',
    width: 10,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [20, 14, 23, 4, 17],
    name: 'Shrub',
    type: 'bar',
    width: 10,
  },
]
export const Primary: Story = {
  args: {
    graphName: 'Primary graph',
    graphData: mockGraphData,
  },
}

export const Closed: Story = {
  args: {
    graphName: 'Closed graph',
    graphData: mockGraphData,
  },
}

export default meta
