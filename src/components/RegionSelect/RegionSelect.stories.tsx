import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'
import { expect, userEvent } from 'storybook/test'
import { defaultGlobalRegionOption, regionOptions } from '../../data/regionData'

const meta: Meta<typeof RegionSelect> = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof RegionSelect>

export const ShortBreadcrumb: Story = {
  args: {
    breadcrumb: [defaultGlobalRegionOption],
    setBreadcrumb: () => {},
    selectedRegion: defaultGlobalRegionOption,
    setSelectedRegion: () => {},
  },
  decorators: [(Story) => <Story />],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)
  },
}

export const LongBreadcrumb: Story = {
  args: {
    breadcrumb: [defaultGlobalRegionOption, regionOptions[1], regionOptions[4]],
    setBreadcrumb: () => {},
    selectedRegion: defaultGlobalRegionOption,
    setSelectedRegion: () => {},
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)
  },
}

export default meta
