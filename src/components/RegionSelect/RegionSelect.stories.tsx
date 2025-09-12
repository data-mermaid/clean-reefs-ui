import type { Meta, StoryObj } from '@storybook/react-vite'
import RegionSelect from './RegionSelect'
import { defaultOption } from '../../types/RegionDataTypes'
import { expect, userEvent } from 'storybook/test'

const meta: Meta<typeof RegionSelect> = {
  component: RegionSelect,
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof RegionSelect>

export const Primary: Story = {
  args: {
    selectedRegion: defaultOption,
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
    await userEvent.type(input, 'solomon')
  },
}

export const Mobile: Story = {
  args: {
    selectedRegion: defaultOption,
    setSelectedRegion: () => {},
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [(Story) => <Story />],
}

export const NoResults: Story = {
  args: {
    selectedRegion: defaultOption,
    setSelectedRegion: () => {},
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox')
    await expect(input).toBeInTheDocument()
    await userEvent.click(input)
    const clearButton = canvas.getByTitle('Clear')
    await expect(clearButton).toBeInTheDocument()
    await userEvent.click(clearButton)
    await userEvent.type(input, 'solomon islad')

    //TODO: Fix this text
    //The popup/text appears outside of the canvas

    // await expect(
    //   within(document.body).findByText('No regions match your search'),
    // ).toBeInTheDocument()
  },
}

export default meta
