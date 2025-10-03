import type { Meta, StoryObj } from '@storybook/react-vite'
import GradientScale from './GradientScale'

const meta = {
  component: GradientScale,
} satisfies Meta<typeof GradientScale>

type Story = StoryObj<typeof meta>

export const NoGradient: Story = {
  args: {},
}

export const SedimentExport: Story = {
  args: {},
}
export const SedimentConcentration: Story = {
  args: {},
}

export default meta
