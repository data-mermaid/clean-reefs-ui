import type { Meta, StoryObj } from '@storybook/react-vite'
import StyledButtonWithTooltip from './StyledButtonWithTooltip'
import LayersIcon from '@mui/icons-material/Layers'
import layerStyles from '../LayersDrawer/LayersDrawer.module.scss'

const meta: Meta<typeof StyledButtonWithTooltip> = {
  component: StyledButtonWithTooltip,
}

type Story = StoryObj<typeof StyledButtonWithTooltip>

export const ButtonWithTooltipText: Story = {
  args: {
    tooltipText: 'Tooltip Text',
    children: <LayersIcon />,
    handleOnClick: () => {},
  },
}

export const ButtonWithoutTooltipText: Story = {
  args: {
    children: <LayersIcon />,
    handleOnClick: () => {},
  },
}

export const LayerToggleButton: Story = {
  args: {
    tooltipText: 'Open menu',
    children: <LayersIcon />,
    handleOnClick: () => {},
    className: layerStyles.layerToggleButton,
  },
}

export default meta
