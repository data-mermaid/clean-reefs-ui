import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import i18next from 'i18next'

import GraphCard from './GraphCard'
import { mockGraphChartConfig } from '../../tests/mockGraphData'

const meta = {
  component: GraphCard,
} satisfies Meta<typeof GraphCard>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    graphData: mockGraphChartConfig,
  },
}

export const Loading: Story = {
  args: {
    open: true,
    graphData: null,
  },
}

export const NoData: Story = {
  args: {
    open: true,
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
    graphData: null,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('graphs.no_data_available')
    expect(canvas.queryByText(noGraphText)).toBe(null)
  },
}

export default meta
