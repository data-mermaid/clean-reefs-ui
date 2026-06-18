import type { Meta, StoryObj } from '@storybook/react-vite'
import Sidebar from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
}

type Story = StoryObj<typeof Sidebar>

export const NoActivePanel: Story = {
  args: {
    activePanel: null,
    onTogglePanel: () => {},
  },
}

export const GraphsActive: Story = {
  args: {
    activePanel: 'graphs',
    onTogglePanel: () => {},
  },
}

export const LayersActive: Story = {
  args: {
    activePanel: 'layers',
    onTogglePanel: () => {},
  },
}

export default meta
