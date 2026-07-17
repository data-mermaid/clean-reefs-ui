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
    chartConfigData: mockChartConfig,
    isChartDataLoading: false,
  },
}

export const Loading: Story = {
  args: {
    chartConfigData: null,
    isChartDataLoading: true,
  },
}

export const NoData: Story = {
  args: {
    chartConfigData: null,
    isChartDataLoading: false,
  },
  play: async ({ canvas }) => {
    const noGraphText = i18next.t('charts.no_data_available')
    await expect(canvas.queryByText(noGraphText)).toBeInTheDocument()
  },
}

export default meta
