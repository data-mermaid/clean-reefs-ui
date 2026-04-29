import type { Meta, StoryObj } from '@storybook/react-vite'
import StyledButtonWithTooltip from './StyledButtonWithTooltip'
import LayersIcon from '@mui/icons-material/Layers'
import layerStyles from '../LayersDrawer/LayersDrawer.module.scss'

const meta: Meta<typeof StyledButtonWithTooltip> = {
  component: StyledButtonWithTooltip,
}

type Story = StoryObj<typeof StyledButtonWithTooltip>

export const ButtonWithTooltip: Story = {
  args: {
    'aria-label': 'Action button',
    tooltipText: 'Tooltip Text',
    children: <LayersIcon />,
    onClick: () => {},
  },
}

export const ButtonWithoutTooltip: Story = {
  args: {
    'aria-label': 'Action button',
    children: <LayersIcon />,
    onClick: () => {},
  },
}

export const LayerToggleButton: Story = {
  args: {
    'aria-label': 'Open menu',
    tooltipText: 'Open menu',
    children: <LayersIcon />,
    onClick: () => {},
    className: layerStyles['layer-toggle-button'],
  },
}

export const DisabledButtonWithTooltip: Story = {
  args: {
    'aria-label': 'Action button',
    tooltipText: 'Tooltip still shows when disabled',
    children: <LayersIcon />,
    onClick: () => {},
    disabled: true,
  },
}

export default meta
