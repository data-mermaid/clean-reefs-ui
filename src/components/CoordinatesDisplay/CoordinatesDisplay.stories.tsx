import type { Meta, StoryObj } from '@storybook/react-vite'
import CoordinatesDisplay from './CoordinatesDisplay'

const meta = {
  component: CoordinatesDisplay,
} satisfies Meta<typeof CoordinatesDisplay>

type Story = StoryObj<typeof meta>

export const WithCoordinates: Story = {
  args: {
    lat: -18.56365,
    lng: 178.18173,
  },
}

export const NullState: Story = {
  args: {
    lat: null,
    lng: null,
  },
}

export default meta
