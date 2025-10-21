import type { Meta, StoryObj } from '@storybook/react-vite'
import BaseMap from './BaseMap'
import { layers } from '../../data/mapData'
import { RegionOption } from '../../types/RegionDataTypes'
import { LngLat } from 'maplibre-gl'
import { expect } from 'storybook/test'
import i18next from 'i18next'

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
    const loadingText = i18next.t('loading')

    await expect(canvas.queryByText(loadingText)).toBe(null)
    expect(canvas.queryAllByLabelText('5 km')).toBeDefined() //ScaleControl
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
