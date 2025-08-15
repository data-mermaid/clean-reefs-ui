import type { Meta, StoryObj } from '@storybook/react-vite'

import TrendsDrawer from './TrendsDrawer'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const meta = {
  component: TrendsDrawer,
} satisfies Meta<typeof TrendsDrawer>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    anchor: 'bottom',
    open: false,
    children: (
      <>
        <div
          style={{
            fontSize: '16px',
            fontWeight: '700',
            position: 'sticky',
            top: -8,
            left: 0,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ marginTop: '4px' }}>Global trends</h2>
          <IconButton aria-label={'close'}>
            <CloseIcon />
          </IconButton>
        </div>
      </>
    ),
  },
}

export default meta
