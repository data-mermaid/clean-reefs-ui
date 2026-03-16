import type { Meta, StoryObj } from '@storybook/react-vite'
import GradientLegend from './GradientLegend'

const meta = {
  component: GradientLegend,
} satisfies Meta<typeof GradientLegend>

type Story = StoryObj<typeof meta>

export const SedimentExport: Story = {
  args: {
    variation: 'sed_export',
    title: 'sediment',
  },
}
export const OceanSedimentDispersal: Story = {
  args: {
    variation: 'sed_dispersal',
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
