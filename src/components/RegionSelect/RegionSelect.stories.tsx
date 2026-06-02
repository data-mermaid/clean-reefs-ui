import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'
import { expect, fn, userEvent, within } from 'storybook/test'
import { defaultGlobalRegionOption, fallbackRegionOptions } from '../../data/regionData'

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
    onRegionChange: () => {},
  },
  decorators: [(Story) => <Story />],
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)

    // Dropdown renders in a portal, so query the document body, not the canvas.
    const listbox = within(document.body).getByRole('listbox')

    await expect(within(listbox).getByText('All Data')).toBeInTheDocument()
    await expect(within(listbox).getByText('Regions with Coral Reefs')).toBeInTheDocument()
    await expect(within(listbox).getByText('Countries with Coral Reefs')).toBeInTheDocument()

    await expect(within(listbox).getByText('Global')).toBeInTheDocument()
    await expect(within(listbox).getByText('Fiji')).toBeInTheDocument()
    await expect(within(listbox).getByText('Solomon Islands')).toBeInTheDocument()
    await expect(within(listbox).getByText('Central Indo-Pacific')).toBeInTheDocument()

    await expect(within(listbox).queryByText('Watershed')).toBeNull()
    await expect(within(listbox).queryByText('Plume')).toBeNull()
  },
}

export const SelectingOptionFiresChange: Story = {
  args: {
    breadcrumb: [defaultGlobalRegionOption],
    setBreadcrumb: fn(),
    selectedRegion: defaultGlobalRegionOption,
    onRegionChange: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('combobox'))
    const listbox = within(document.body).getByRole('listbox')
    await userEvent.click(within(listbox).getByText('Fiji'))

    const fiji = fallbackRegionOptions.find((r) => r.id === 'fiji')
    await expect(args.onRegionChange).toHaveBeenCalledWith(fiji)
  },
}

export const SubheaderClickIsNoop: Story = {
  args: {
    breadcrumb: [defaultGlobalRegionOption],
    setBreadcrumb: fn(),
    selectedRegion: defaultGlobalRegionOption,
    onRegionChange: fn(),
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('combobox'))
    const listbox = within(document.body).getByRole('listbox')
    await userEvent.click(within(listbox).getByText('Countries with Coral Reefs'))

    await expect(args.onRegionChange).not.toHaveBeenCalled()
  },
}

export const LongBreadcrumb: Story = {
  args: {
    breadcrumb: [defaultGlobalRegionOption, fallbackRegionOptions[1], fallbackRegionOptions[4]],
    setBreadcrumb: () => {},
    selectedRegion: defaultGlobalRegionOption,
    onRegionChange: () => {},
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)
  },
}

export default meta
