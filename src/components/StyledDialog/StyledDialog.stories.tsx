import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@mui/material'

import StyledDialog from './StyledDialog'

const meta = {
  component: StyledDialog,
} satisfies Meta<typeof StyledDialog>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    onClose: () => {},
    title: 'Example dialog',
    children: 'Dialog body content.',
    actions: <Button variant="outlined">Close</Button>,
  },
}

export default meta
