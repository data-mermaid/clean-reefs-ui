import type {Meta, StoryObj} from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => <TrendsDrawer />
}

export default meta
