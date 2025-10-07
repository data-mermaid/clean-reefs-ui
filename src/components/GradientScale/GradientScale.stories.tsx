import type { Meta, StoryObj } from '@storybook/react-vite'
import GradientScale from './GradientScale'

const meta = {
  component: GradientScale,
} satisfies Meta<typeof GradientScale>

type Story = StoryObj<typeof meta>

export const SedimentExport: Story = {
  args: {
    variation: 'sediment-export',
    title: 'sediment',
  },
}
export const SedimentConcentration: Story = {
  args: {
    variation: 'sediment-concentration',
    title: 'concentration',
  },
}

export const ReefEcosystemExposure: Story = {
  args: {
    variation: 'reef-ecosystem-exposure',
    title: 'exposure',
  },
}

export default meta
