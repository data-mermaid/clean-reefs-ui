import type { Meta, StoryObj } from '@storybook/react-vite'
import StyledSwipeableDrawer from '../StyledSwipeableDrawer/StyledSwipeableDrawer'
import { Card } from '@mui/material'
import styles from '../TrendsDrawer/TrendsDrawer.module.scss'

const meta: Meta<typeof StyledSwipeableDrawer> = {
  component: StyledSwipeableDrawer,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
}

type Story = StoryObj<typeof StyledSwipeableDrawer>

export const LeftOpen: Story = {
  args: {
    anchor: 'left',
    open: true,
    onOpen: () => {},
    onClose: () => {},
    children: (
      <>
        <div>
          <h2>Pollution layers</h2>
          <Card>Placeholder card</Card>
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
    children: (
      <>
        <div>
          <h2>Pollution layers</h2>
          <Card>Placeholder card</Card>
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
    testId: 'bottom',
    children: (
      <>
        <div>
          <h2>Pollution layers</h2>
          <Card>Placeholder card</Card>
        </div>
      </>
    ),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
export const BottomOpen: Story = {
  args: {
    anchor: 'bottom',
    open: true,
    testId: 'bottom',
    onOpen: () => {},
    onClose: () => {},
    children: (
      <>
        <div className={styles['drawer-header']}>
          <h2>Regional trends</h2>
        </div>

        <div className={styles['graphs-container']}>
          <Card>Placeholder card</Card>
          <Card>Placeholder card</Card>
          <Card>Placeholder card</Card>
        </div>
      </>
    ),
  },
}

export default meta
