import type { Meta, StoryObj } from '@storybook/react-vite'
import BaseMap from './BaseMap'
import { layers } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { LngLat } from 'maplibre-gl'
import { expect } from 'storybook/test'
import i18next from 'i18next'
import { waitFor } from '@storybook/test'

const meta = {
  component: BaseMap,
} satisfies Meta<typeof BaseMap>

type Story = StoryObj<typeof meta>

const mockRegionOption: RegionOption = {
  regionType: 'global',
  label: 'global',
  centerCoord: new LngLat(25, -50),
  zoomLevel: 5,
}
export const Primary: Story = {
  args: {
    mapLayers: layers,
    selectedRegion: mockRegionOption,
    setSelectedRegion: () => {},
    setChartConfigData: () => {},
  },
  play: async ({ canvas }) => {
    // ensure story behaves as "desktop"
    globalThis.innerWidth = 1200
    globalThis.dispatchEvent(new Event('resize'))

    const loadingText = i18next.t('loading')

    await waitFor(() => expect(canvas.queryByText(loadingText)).toBeNull())
    // ScaleControl renders plain text, not a form value; use findByText (async) or getByText
    const scale = await canvas.findByText(/5\s?km/)
    expect(scale).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: {
    mapLayers: layers,
    selectedRegion: mockRegionOption,
    setSelectedRegion: () => {},
    setChartConfigData: () => {},
  },
  // play: async ({ canvasElement }) => {
  //   const loadingText = i18next.t('loading')
  //   const canvas = within(canvasElement)
  //   await expect(canvas.queryByText(loadingText)).toBeInTheDocument()
  // },
}

export default meta
