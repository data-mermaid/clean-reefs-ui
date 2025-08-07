import type { Meta, StoryObj } from '@storybook/react-vite'

import RegionSelect from './RegionSelect'

const meta = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RegionSelect>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Mobile: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: '240px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export default meta
