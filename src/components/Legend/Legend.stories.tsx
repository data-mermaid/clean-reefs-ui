import Legend from '../Legend/Legend'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  component: Legend,
} satisfies Meta<typeof Legend>

type Story = StoryObj<typeof meta>

export const PrimaryLulc: Story = {
  args: {},
}

export default meta
