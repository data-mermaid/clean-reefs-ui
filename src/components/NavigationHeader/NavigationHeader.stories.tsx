import type { Meta, StoryObj } from "@storybook/react-vite";

import NavigationHeader from "./NavigationHeader";

const meta = {
  component: NavigationHeader,
} satisfies Meta<typeof NavigationHeader>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};

export default meta;
