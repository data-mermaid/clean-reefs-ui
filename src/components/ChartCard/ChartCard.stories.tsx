import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import i18next from 'i18next'

import ChartCard from './ChartCard'
import { mockChartConfig } from '../../tests/mockChartConfig'

const meta = {
  component: ChartCard,
} satisfies Meta<typeof ChartCard>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    chartConfigData: mockChartConfig,
  },
  play: ({ canvas }) => {
    expect(canvas.findByText('2005')).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: {
    open: true,
    chartConfigData: null,
  },
}

export const NoData: Story = {
  args: {
    open: true,
    chartConfigData: null,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('charts.no_data_available')
    await expect(canvas.queryByText(noGraphText)).toBeInTheDocument()
  },
}

export const Closed: Story = {
  args: {
    open: false,
    chartConfigData: null,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('charts.no_data_available')
    expect(canvas.queryByText(noGraphText)).toBe(null)
  },
}

export default meta
