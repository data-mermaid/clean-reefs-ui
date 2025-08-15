import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'

const meta: Meta<typeof RegionSelect> = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof RegionSelect>

export const Primary: Story = {
  args: {},
  decorators: [(Story) => <Story />],
}

export default meta
