import {
  buildSedExportWatershedExpression,
  buildWatershedMatchExpression,
  createPolygonClickHandler,
  createPolygonHoverHandler,
  getActiveLayers,
  mapRegionSelected,
} from '../utils/mapUtils'
import { Map, MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'
import { regionOptions } from '../data/regionData'
import { sedExportColorMapping, transparent } from '../data/mapData'
import { topContributingWatershedColorFills } from '../constants'
import { LayerInfo } from '../types/MapDataTypes'

const mockUrl = 'https://things.com'
const mockLayers: LayerInfo[] = [
  {
    sourceId: 'lulc_2000_visual',
    sourceFileName: '',
    layerId: 'lulc',
    link: mockUrl,
    dataType: 'cog',
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

    test('recenters the polygon when the same feature is clicked', () => {
      const map = makeMap()
      const onSelect = jest.fn()
      clickedRef.current = '128'
      const handler = createPolygonClickHandler(clickedRef, onSelect)
      handler(map, makeEvent('128'), mockLayers[0])
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: '128' }),
        expect.objectContaining({
          _ne: expect.any(Object),
          _sw: expect.any(Object),
        }),
      )
      expect(clickedRef.current).toBe('128')
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
  })

  describe('buildWatershedMatchExpression', () => {
    it('returns the fallback directly when the id list is empty', () => {
      expect(buildWatershedMatchExpression([], transparent)).toBe(transparent)
    })

    it('returns the fallback directly when the id list is empty and fallback is an expression', () => {
      const expr = ['match', ['get', 'foo'], 'a', '#fff', transparent]
      expect(buildWatershedMatchExpression([], expr)).toBe(expr)
    })

    it('builds a match expression assigning colours to each watershed id', () => {
      const ids = [974529, 977314]
      const result = buildWatershedMatchExpression(ids, transparent)
      expect(result).toEqual([
        'match',
        ['get', 'watershed_id'],
        974529,
        topContributingWatershedColorFills[0],
        977314,
        topContributingWatershedColorFills[1],
        transparent,
      ])
    })

    it('accepts an expression array as the fallback', () => {
      const choropleth = buildSedExportWatershedExpression(2020)
      const result = buildWatershedMatchExpression([974529], choropleth) as unknown[]
      expect(result[0]).toBe('match')
      expect(result[result.length - 1]).toBe(choropleth)
    })
  })

  describe('buildSedExportWatershedExpression', () => {
    it('returns a match expression with the correct property key for the given year', () => {
      const result = buildSedExportWatershedExpression(2020) as unknown[]
      expect(result[0]).toBe('match')
      expect(result[1]).toEqual(['get', 'export_threshold_country_2020'])
    })

    it('interpolates the year into the property name', () => {
      const result2000 = buildSedExportWatershedExpression(2000) as unknown[]
      const result2015 = buildSedExportWatershedExpression(2015) as unknown[]
      expect(result2000[1]).toEqual(['get', 'export_threshold_country_2000'])
      expect(result2015[1]).toEqual(['get', 'export_threshold_country_2015'])
    })

    it('maps every sedExportColorMapping band to the correct colour', () => {
      const result = buildSedExportWatershedExpression(2020)
      const bands = ['0', '1-10', '10-20', '20-50', '50-75', '75-90', '90-100']
      bands.forEach((band) => {
        const bandIndex = result.indexOf(band)
        expect(bandIndex).toBeGreaterThan(-1)
        expect(result[bandIndex + 1]).toBe(sedExportColorMapping[band])
      })
    })

    it('uses transparent as the final fallback', () => {
      const result = buildSedExportWatershedExpression(2020)
      expect(result[result.length - 1]).toBe(transparent)
    })
  })
})
