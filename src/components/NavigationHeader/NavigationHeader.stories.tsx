import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router'

import NavigationHeader from './NavigationHeader'

const meta = {
  component: NavigationHeader,
} satisfies Meta<typeof NavigationHeader>

type Story = StoryObj<typeof meta>

export const MapPage: Story = {
  args: {},
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export const NonMapPage: Story = {
  args: {},
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/science-and-methods']}>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
