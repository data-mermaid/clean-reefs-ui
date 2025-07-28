import type { Meta, StoryObj } from "@storybook/react-vite";

import StyledSwipeableDrawer from "../StyledSwipeableDrawer/StyledSwipeableDrawer";

const meta = {
  component: StyledSwipeableDrawer,
} satisfies Meta<typeof StyledSwipeableDrawer>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    anchor: "left",
    open: false,
    onOpen: () => {},
    onClose: () => {}
  },
};

export default meta;
