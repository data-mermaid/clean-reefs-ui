import type { Meta, StoryObj } from '@storybook/react-vite'
import StyledButtonWithTooltip from './StyledButtonWithTooltip'
import LayersIcon from '@mui/icons-material/Layers'
import UpOneLevelIcon from '../../assets/up-one-level.svg'
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
    handleOnClick: () => {},
  },
}

export const ButtonWithoutTooltip: Story = {
  args: {
    'aria-label': 'Action button',
    children: <LayersIcon />,
    handleOnClick: () => {},
  },
}

export const LayerToggleButton: Story = {
  args: {
    'aria-label': 'Open menu',
    tooltipText: 'Open menu',
    children: <LayersIcon />,
    handleOnClick: () => {},
    className: layerStyles['layer-toggle-button'],
  },
}

export const IconButtonWithTooltip: Story = {
  args: {
    isIconButton: true,
    'aria-label': 'Go up one level',
    tooltipText: 'Go up one level',
    tooltipPlacement: 'top',
    children: <img src={UpOneLevelIcon} alt="" />,
    handleOnClick: () => {},
  },
}

export const IconButtonWithoutTooltip: Story = {
  args: {
    isIconButton: true,
    'aria-label': 'Go up one level',
    tooltipPlacement: 'top',
    children: <img src={UpOneLevelIcon} alt="" />,
    handleOnClick: () => {},
  },
}

export default meta
