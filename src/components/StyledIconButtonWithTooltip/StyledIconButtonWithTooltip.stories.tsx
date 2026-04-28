import type { Meta, StoryObj } from '@storybook/react-vite'
import StyledIconButtonWithTooltip from './StyledIconButtonWithTooltip'
import UpOneLevelIcon from '../../assets/up-one-level.svg'

const meta: Meta<typeof StyledIconButtonWithTooltip> = {
  component: StyledIconButtonWithTooltip,
}

type Story = StoryObj<typeof StyledIconButtonWithTooltip>

export const IconButtonWithTooltip: Story = {
  args: {
    'aria-label': 'Go up one level',
    tooltipText: 'Go up one level',
    tooltipPlacement: 'top',
    children: <img src={UpOneLevelIcon} alt="" />,
    onClick: () => {},
  },
}

export const IconButtonWithoutTooltip: Story = {
  args: {
    'aria-label': 'Go up one level',
    tooltipPlacement: 'top',
    children: <img src={UpOneLevelIcon} alt="" />,
    onClick: () => {},
  },
}

export const IconButtonDisabledWithTooltip: Story = {
  args: {
    'aria-label': 'Go up one level',
    tooltipText: 'Go up one level',
    tooltipPlacement: 'top',
    children: <img src={UpOneLevelIcon} alt="" />,
    onClick: () => {},
    disabled: true,
  },
}

export default meta
