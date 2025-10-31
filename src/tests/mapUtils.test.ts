import { LayerInfo } from '../data/mapData'
import { mapRegionSelected, getActiveLayers, createPolygonHoverHandler } from '../utils/mapUtils'
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

describe('createPolygonHoverHandler', () => {
  const makeMap = () => ({ setFeatureState: jest.fn() })

  const makeEvent = (id?: string | number) => ({
    features: id === undefined ? [] : [{ id }],
  })

  let hoveredRef: React.RefObject<string | number | null>

  beforeEach(() => {
    hoveredRef = { current: null }
  })

  test('does nothing when no features', () => {
    const map = makeMap()
    const handler = createPolygonHoverHandler(hoveredRef)
    handler(map, makeEvent())
    expect(map.setFeatureState).not.toHaveBeenCalled()
    expect(hoveredRef.current).toBeNull()
  })

  test('sets hover on first feature', () => {
    const map = makeMap()
    const handler = createPolygonHoverHandler(hoveredRef)
    handler(map, makeEvent('197297'))
    expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '197297' }), {
      hover: true,
    })
    expect(hoveredRef.current).toBe('197297')
  })

  test('does nothing when hovering same feature', () => {
    const map = makeMap()
    hoveredRef.current = 'a'
    const handler = createPolygonHoverHandler(hoveredRef)
    handler(map, makeEvent('a'))
    expect(map.setFeatureState).not.toHaveBeenCalled()
    expect(hoveredRef.current).toBe('a')
  })

  test('clears previous hover and updates when a different polygon is hovered', () => {
    const map = makeMap()
    hoveredRef.current = '127'
    const handler = createPolygonHoverHandler(hoveredRef)
    handler(map, makeEvent('125'))
    expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '127' }), {
      hover: false,
    })
    expect(hoveredRef.current).toBeNull()
  })
})
