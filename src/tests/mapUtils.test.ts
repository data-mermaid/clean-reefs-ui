import { LayerInfo } from '../data/mapData'
import { mapRegionSelected, getActiveLayers } from '../utils/mapUtils'
import { RegionOption } from '../types/RegionDataTypes'
import { MapGeoJSONFeature, LngLat } from 'maplibre-gl'

const mockUrl = 'https://things.com'
const mockLayers: LayerInfo[] = [
  {
    sourceId: 'lulc_2000_visual',
    sourceName: '',
    layerId: 'lulc',
    link: mockUrl,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    title: 'map_layers.land_use_cover',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'countries',
    layerId: 'countries',
    link: mockUrl,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: false,
    title: 'map_layers.country_boundaries',
  },
  {
    sourceId: 'watershed_src',
    sourceName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    layerId: 'watershed',
    link: mockUrl,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: true,
    title: 'map_layers.watershed_boundaries',
  },
]

const mockGeoFeatures = {
  source: '',
  state: {
    loaded: false,
  },
  layer: {
    id: 'countries',
  },
  properties: {
    TERRITORY1: 'Fiji',
  },
} as unknown as MapGeoJSONFeature //allows for partial mock

const mockSelectedRegion: RegionOption = {
  regionType: 'country',
  label: 'Fiji',
  centerCoord: new LngLat(10, 10),
  zoomLevel: 4,
}
describe('map utilities', () => {
  describe('getActiveLayers', () => {
    it('returns the layers that are "on"', () => {
      const result = getActiveLayers(mockLayers)
      expect(result).toEqual(['watershed'])
    })
  })

  describe('mapRegionSelected', () => {
    it("returns the updated region info with user's pre-existing coordinates and zoom", () => {
      const result = mapRegionSelected(mockGeoFeatures, [10, 10], 4)
      expect(result).toEqual(mockSelectedRegion)
    })
  })
})
