import LayerToggleLegend from './LayerToggleLegend'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  component: LayerToggleLegend,
} satisfies Meta<typeof LayerToggleLegend>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
}
export default meta
