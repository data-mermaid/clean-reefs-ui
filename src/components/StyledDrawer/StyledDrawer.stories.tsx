import type { Meta, StoryObj } from '@storybook/react-vite'

import StyledDrawer from './StyledDrawer'
import { Card, Switch } from '@mui/material'

const meta = {
  component: StyledDrawer,
} satisfies Meta<typeof StyledDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    anchor: 'left',
    children: (
      <>
        <h2>Pollution layers</h2>
        <Card>
          Sediment Layer <Switch />
        </Card>
      </>
    ),
  },
}

export default meta
