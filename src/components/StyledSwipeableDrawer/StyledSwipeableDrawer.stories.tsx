import type { Meta, StoryObj } from "@storybook/react-vite";

import StyledSwipeableDrawer from "../StyledSwipeableDrawer/StyledSwipeableDrawer";
import { Card, Switch } from "@mui/material";

const meta = {
  component: StyledSwipeableDrawer,
} satisfies Meta<typeof StyledSwipeableDrawer>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    anchor: "left",
    open: true,
    onOpen: () => {},
    onClose: () => {},
    children: (
      <>
        <h2>Pollution layers</h2>
        <Card>
          Sediment Layer <Switch />
        </Card>
      </>
    ),
  },
};

export default meta;
