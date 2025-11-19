import Legend from '../Legend/Legend'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  component: Legend,
} satisfies Meta<typeof Legend>

type Story = StoryObj<typeof meta>

export const Lulc: Story = {
  args: { variant: 'lulc' },
}

export const Benthic: Story = {
  args: { variant: 'benthic' },
}
export default meta
