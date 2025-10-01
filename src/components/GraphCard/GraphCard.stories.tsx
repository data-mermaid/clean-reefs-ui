import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import i18next from 'i18next'

import GraphCard from './GraphCard'
import mockOutputGraphData from '../../tests/mockOutputGraphData.json'
import { ChartedData } from '../../types/GraphDataTypes'

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

export const NoData: Story = {
  args: {
    open: true,
    graphName: 'Loading',
    graphData: null,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('graphs.no_data_available')
    await expect(canvas.queryByText(noGraphText)).toBeInTheDocument()
  },
}

export const Closed: Story = {
  args: {
    open: false,
    graphName: 'Closed graph card',
    graphData: null,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('graphs.no_data_available')
    expect(canvas.queryByText(noGraphText)).toBe(null)
  },
}

export default meta
