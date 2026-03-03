import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'
import { expect, userEvent } from 'storybook/test'
import { defaultRegionOption } from '../../data/regionData'

const meta: Meta<typeof RegionSelect> = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof RegionSelect>

export const Primary: Story = {
  args: {
    selectedRegion: defaultRegionOption,
    setSelectedRegion: () => {},
  },
  parameters: {
    viewport: { defaultViewport: 'desktop1' },
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)
    const clearButton = canvas.getByTitle('Clear')
    await expect(clearButton).toBeInTheDocument()
    await userEvent.click(clearButton)
  },
}

export const SelectedBreadcrumb: Story = {
  args: {
    selectedRegion: defaultRegionOption,
    setSelectedRegion: () => {},
  },
  // parameters: {
  //   viewport: { defaultViewport: 'desktop1' },
  // },
  // play: async ({ canvas }) => {
  //   const input = canvas.getByRole('combobox')
  //   await expect(input).toBeInTheDocument()
  //   await userEvent.click(input)
  // },
}

export const Mobile: Story = {
  args: {
    selectedRegion: defaultRegionOption,
    setSelectedRegion: () => {},
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [(Story) => <Story />],
}

// export const NoResults: Story = {
//   args: {
//     selectedRegion: defaultRegionOption,
//     setSelectedRegion: () => {},
//   },
//   play: async ({ canvas }) => {
//     const input = canvas.getByRole('combobox')
//     await expect(input).toBeInTheDocument()
//     await userEvent.click(input)
//     await expect(clearButton).toBeInTheDocument()
//     await userEvent.click(clearButton)
//
//     const noResultsText = screen.getByText('No regions match your search')
//     await expect(noResultsText).toBeInTheDocument()
//   },
// }

export default meta
