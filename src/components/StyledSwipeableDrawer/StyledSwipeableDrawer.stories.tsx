import type { Meta, StoryObj } from '@storybook/react-vite'

import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import { Card, Switch } from '@mui/material'

const meta = {
  title: 'StyledSwipeableDrawer',
  component: StyledSwipeableDrawer,
} satisfies Meta<typeof StyledSwipeableDrawer>
export default meta

type Story = StoryObj<typeof meta>

export const LeftClosed: Story = {
  args: {
    anchor: 'left',
    open: false,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
    children: (
      <>
        <div
          style={{
            backgroundColor: '#4997e4',
          }}
        >
          <h2>Pollution layers</h2>
          <Card>
            Sediment Layer <Switch />
          </Card>
        </div>
      </>
    ),
  },
}

export const LeftOpen: Story = {
  args: {
    anchor: 'left',
    open: true,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
    children: (
      <>
        <div
          style={{
            backgroundColor: '#4997e4',
          }}
        >
          <h2>Pollution layers</h2>
          <Card>
            Sediment Layer <Switch />
          </Card>
        </div>
      </>
    ),
  },
}

export const RightClosed: Story = {
  args: {
    anchor: 'right',
    open: false,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
    children: (
      <>
        <div
          style={{
            backgroundColor: '#4997e4',
          }}
        >
          <h2>Pollution layers</h2>
          <Card>
            Sediment Layer <Switch />
          </Card>
        </div>
      </>
    ),
  },
}
export const RightOpen: Story = {
  args: {
    anchor: 'right',
    open: true,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
    children: (
      <>
        <div
          style={{
            backgroundColor: '#4997e4',
          }}
        >
          <h2>Pollution layers</h2>
          <Card>
            Sediment Layer <Switch />
          </Card>
        </div>
      </>
    ),
  },
}

export const BottomClosed: Story = {
  args: {
    anchor: 'bottom',
    open: false,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
    children: (
      <>
        <div
          style={{
            backgroundColor: '#4997e4',
          }}
        >
          <h2>Pollution layers</h2>
          <Card>
            Sediment Layer <Switch />
          </Card>
        </div>
      </>
    ),
  },
}
export const BottomOpen: Story = {
  args: {
    anchor: 'bottom',
    open: true,
    onOpen: () => {},
    onClose: () => {},
    handleClick: () => {},
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
