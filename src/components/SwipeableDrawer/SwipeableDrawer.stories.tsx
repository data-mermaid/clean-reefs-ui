import type { Meta, StoryObj } from "@storybook/react-vite";

import LayersDrawer from "../../LayersDrawer";

const meta = {
  component: LayersDrawer,
} satisfies Meta<typeof LayersDrawer>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: "LayersDrawer",
  },
};

export default meta;
