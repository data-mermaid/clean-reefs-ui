import type { Meta, StoryObj } from '@storybook/react-vite'

import ShareModal from './ShareModal'

const meta = {
  component: ShareModal,
} satisfies Meta<typeof ShareModal>

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    open: true,
    onClose: () => {},
  },
}

export default meta
