import type { Meta, StoryObj } from '@storybook/react-vite'

import GraphCard from './GraphCard'
import { ChartedData } from '../../utils/updateGraph'

const meta = {
  component: GraphCard,
} satisfies Meta<typeof GraphCard>

type Story = StoryObj<typeof meta>
export const mockGraphData: ChartedData[] = [
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [16, 14, 14, 10, 4],
    name: 'Bare Ground',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [18, 17, 16, 16, 17],
    name: 'Shrub',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [16, 14, 2, 4, 17],
    name: 'Surface water',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [3, 8, 13, 15, 20],
    name: 'Built-up',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [18, 18, 18, 17, 14],
    name: 'High canopy forest',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [15, 14, 17, 20, 18],
    name: 'Cropland',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [15, 14, 12, 10, 10],
    name: 'Mixed forest',
    type: 'bar',
    width: 3,
  },
]
export const Primary: Story = {
  args: {
    open: true,
    graphName: 'Primary graph card',
    graphData: mockGraphData,
  },
}

export const Closed: Story = {
  args: {
    open: false,
    graphName: 'Closed graph card',
    graphData: mockGraphData,
  },
}

export default meta
