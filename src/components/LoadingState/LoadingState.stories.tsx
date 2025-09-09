import LoadingState from '../LoadingState/LoadingState'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  component: LoadingState,
} satisfies Meta<typeof LoadingState>

type Story = StoryObj<typeof meta>
export const Primary: Story = {
  args: {},
}

export default meta
