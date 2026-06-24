import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'
import { expect, fn, userEvent, within } from 'storybook/test'
import { defaultGlobalRegionOption, fallbackRegionOptions } from '../../data/regionData'
import { RegionOption } from '../../types/RegionDataTypes'

const commonArgs = {
  breadcrumb: [defaultGlobalRegionOption],
  setBreadcrumb: fn(),
  selectedRegion: defaultGlobalRegionOption,
  onRegionChange: fn(),
  onUpOneLevelChange: fn(),
  regionOptionsLoading: false,
}

// Mock data that covers multi-region countries (Colombia spans two regions)
const multiRegionOptions: RegionOption[] = [
  defaultGlobalRegionOption,
  {
    id: 'tropical-atlantic',
    regionType: 'region',
    label: 'Tropical Atlantic',
    bandId: 1,
    extent: [-100, -35, 20, 35],
  },
  {
    id: 'tropical-eastern-pacific',
    regionType: 'region',
    label: 'Tropical Eastern Pacific',
    bandId: 5,
    extent: [-120, -20, -70, 30],
  },
  {
    id: 'bahamas',
    regionType: 'country',
    label: 'Bahamas',
    parentRegionIds: ['tropical-atlantic'],
  },
  {
    id: 'colombia',
    regionType: 'country',
    label: 'Colombia',
    parentRegionIds: ['tropical-atlantic', 'tropical-eastern-pacific'],
  },
  {
    id: 'ecuador',
    regionType: 'country',
    label: 'Ecuador',
    parentRegionIds: ['tropical-eastern-pacific'],
  },
]

const meta: Meta<typeof RegionSelect> = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof RegionSelect>

export const Default: Story = {
  args: {
    ...commonArgs,
    regionOptions: fallbackRegionOptions,
  },
}

export const DropdownOpen: Story = {
  args: {
    ...commonArgs,
    regionOptions: fallbackRegionOptions,
  },
  play: async ({ canvas }) => {
    const chevron = canvas.getByRole('button', { name: /select region/i })
    await userEvent.click(chevron)

    const listbox = within(document.body).getByRole('listbox')
    await expect(within(listbox).getByText('Global')).toBeInTheDocument()
    await expect(within(listbox).getByText('Central Indo-Pacific')).toBeInTheDocument()
    await expect(within(listbox).getByText('Fiji')).toBeInTheDocument()
    await expect(within(listbox).getByText('Solomon Islands')).toBeInTheDocument()
    // Watershed / Dispersal are excluded from the dropdown
    await expect(within(listbox).queryByText('Watershed')).toBeNull()
    await expect(within(listbox).queryByText('Dispersal')).toBeNull()
  },
}

export const SelectingOptionFiresChange: Story = {
  args: {
    ...commonArgs,
    regionOptions: fallbackRegionOptions,
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /select region/i }))
    const listbox = within(document.body).getByRole('listbox')
    await userEvent.click(within(listbox).getByText('Fiji'))
    const fiji = fallbackRegionOptions.find((r) => r.id === 'fiji')
    await expect(args.onRegionChange).toHaveBeenCalledWith(fiji)
  },
}

// Colombia appears under both Tropical Atlantic and Tropical Eastern Pacific
export const MultiRegionCountry: Story = {
  args: {
    ...commonArgs,
    regionOptions: multiRegionOptions,
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /select region/i }))
    const listbox = within(document.body).getByRole('listbox')

    await expect(within(listbox).getByText('Tropical Atlantic')).toBeInTheDocument()
    await expect(within(listbox).getByText('Tropical Eastern Pacific')).toBeInTheDocument()
    // Colombia appears twice (once per parent region)
    const colombiaItems = within(listbox).getAllByText('Colombia')
    await expect(colombiaItems).toHaveLength(2)
    // Bahamas only under Tropical Atlantic, Ecuador only under Tropical Eastern Pacific
    await expect(within(listbox).getByText('Bahamas')).toBeInTheDocument()
    await expect(within(listbox).getByText('Ecuador')).toBeInTheDocument()
  },
}

export const LongBreadcrumb: Story = {
  args: {
    ...commonArgs,
    breadcrumb: [
      defaultGlobalRegionOption,
      { id: 'central-indo-pacific', regionType: 'region', label: 'Central Indo-Pacific' },
      { id: 'fiji', regionType: 'country', label: 'Fiji' },
    ],
    selectedRegion: { id: 'fiji', regionType: 'country', label: 'Fiji' },
    regionOptions: fallbackRegionOptions,
  },
}

export default meta
