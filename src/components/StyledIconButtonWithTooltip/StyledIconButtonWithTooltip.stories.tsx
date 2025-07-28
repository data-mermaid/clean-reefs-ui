import type { Meta, StoryObj } from "@storybook/react-vite";

import StyledIconButtonWithTooltip from "./StyledIconButtonWithTooltip";
import LayersIcon from "@mui/icons-material/Layers";

const meta = {
  component: StyledIconButtonWithTooltip,
} satisfies Meta<typeof StyledIconButtonWithTooltip>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    tooltipText: "Open menu",
    children: <LayersIcon />,
    handleOnClick: () => {},
  },
};

export default meta;
