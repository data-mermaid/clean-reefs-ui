import {
  createPolygonClickHandler,
  createPolygonHoverHandler,
  getActiveLayers,
  mapRegionSelected,
} from '../utils/mapUtils'
import { Map, MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'
import { regionOptions } from '../data/regionData'
import { LayerInfo } from '../types/MapDataTypes'

const mockUrl = 'https://things.com'
const mockLayers: LayerInfo[] = [
  {
    sourceId: 'lulc_2000_visual',
    sourceFileName: '',
    layerId: 'lulc',
    link: mockUrl,
    dataType: 'rastertiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    title: 'map_layers.land_use_cover',
  },
  {
    sourceId: 'countries_src',
    sourceFileName: 'countries',
    layerId: 'countries',
    link: mockUrl,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: false,
    title: 'map_layers.country_boundaries',
  },
  {
    sourceId: 'watershed_src',
    sourceFileName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
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

const makeMap = () => ({ setFeatureState: jest.fn(), getFeatureState: jest.fn() }) as unknown as Map

const makeEvent = (id?: string | number) => {
  const mockFeature = {
    id,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [178.0, -17.0],
          [179.0, -17.0],
          [179.0, -18.0],
          [178.0, -18.0],
          [178.0, -17.0],
        ],
      ],
    },
  } as MapGeoJSONFeature

  return {
    id: id,
    type: 'Feature',
    features: [mockFeature],
    layer: { source: '' },
    source: '',
    state: { none: 'none' },
  } as unknown as MapLayerMouseEvent
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
      const result = mapRegionSelected(mockGeoFeatures)
      expect(result).toEqual(regionOptions[1])
    })
  })

  describe('createPolygonHoverHandler', () => {
    let hoveredRef: RefObject<string | number | null>

    beforeEach(() => {
      hoveredRef = { current: null }
      const map = makeMap()
      const mockGetFeatureState = map.getFeatureState as jest.Mock
      mockGetFeatureState.mockReturnValue({ select: true })
    })

    test('does nothing when there are no features hovered', () => {
      const map = makeMap()
      const handler = createPolygonHoverHandler(hoveredRef)
      handler(map, makeEvent(), mockLayers[0])
      expect(map.setFeatureState).not.toHaveBeenCalled()
      expect(hoveredRef.current).toBeNull()
    })

    test('sets hover on feature', () => {
      const map = makeMap()
      const handler = createPolygonHoverHandler(hoveredRef)
      handler(map, makeEvent('197297'), mockLayers[0])
      expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '197297' }), {
        hover: true,
      })
      expect(hoveredRef.current).toBe('197297')
    })

    test('does nothing when hovering same feature', () => {
      const map = makeMap()
      hoveredRef.current = '128'
      const handler = createPolygonHoverHandler(hoveredRef)
      handler(map, makeEvent('128'), mockLayers[0])
      expect(map.setFeatureState).not.toHaveBeenCalled()
      expect(hoveredRef.current).toBe('128')
    })

    test('does nothing when hovering a selected feature', () => {
      const map = makeMap()
      const mockGetFeatureState = map.getFeatureState as jest.Mock
      mockGetFeatureState.mockReturnValue({ select: true })

      hoveredRef.current = '127'
      const handler = createPolygonHoverHandler(hoveredRef)
      handler(map, makeEvent('125'), mockLayers[0])
      expect(map.setFeatureState).not.toHaveBeenCalled()
      expect(hoveredRef.current).toBe('127')
    })

    test('clears previous hover and updates when a different polygon is hovered', () => {
      const map = makeMap()
      hoveredRef.current = '127'
      const handler = createPolygonHoverHandler(hoveredRef)
      handler(map, makeEvent('125'), mockLayers[0])
      expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '127' }), {
        hover: false,
      })
      expect(hoveredRef.current).toBe('125')
    })
  })

  describe('createPolygonClickHandler', () => {
    let clickedRef: RefObject<string | number | null>

    beforeEach(() => {
      clickedRef = { current: null }
    })

    test('does nothing when there are no features', () => {
      const map = makeMap()
      const handler = createPolygonClickHandler(clickedRef)
      handler(map, makeEvent(), mockLayers[0])
      expect(map.setFeatureState).not.toHaveBeenCalled()
      expect(clickedRef.current).toBeNull()
    })

    test('sets select on first feature', () => {
      const map = makeMap()
      const handler = createPolygonClickHandler(clickedRef)
      handler(map, makeEvent('197297'), mockLayers[0])
      expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '197297' }), {
        select: true,
        hover: false,
      })
      expect(clickedRef.current).toBe('197297')
    })

    test('deselects the feature when the same feature is clicked', () => {
      const map = makeMap()
      clickedRef.current = '128'
      const handler = createPolygonClickHandler(clickedRef)
      handler(map, makeEvent('128'), mockLayers[0])
      expect(map.setFeatureState).toHaveBeenCalledTimes(1)
      expect(clickedRef.current).toBe(null)
    })

    test('clears previous click and updates when a different polygon is clicked', () => {
      const map = makeMap()
      clickedRef.current = '127'
      const handler = createPolygonClickHandler(clickedRef)
      handler(map, makeEvent('125'), mockLayers[0])
      expect(map.setFeatureState).toHaveBeenCalledWith(expect.objectContaining({ id: '127' }), {
        select: false,
      })
      expect(clickedRef.current).toBe('125')
    })

    test('calls onSelect with bounds for fitBounds when feature is selected', () => {
      const map = makeMap()
      const onSelect = jest.fn()
      const handler = createPolygonClickHandler(clickedRef, onSelect)
      handler(map, makeEvent('197297'), mockLayers[0])
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: '197297' }),
        expect.objectContaining({
          _ne: expect.any(Object),
          _sw: expect.any(Object),
        }),
      )
    })

    test('calls onSelect without bounds when feature is deselected', () => {
      const map = makeMap()
      const onSelect = jest.fn()
      clickedRef.current = '128'
      const handler = createPolygonClickHandler(clickedRef, onSelect)
      handler(map, makeEvent('128'), mockLayers[0])
      expect(onSelect).toHaveBeenCalledWith(null)
    })
  })
})
