import {
  buildBenthicFillExpression,
  buildSedExportWatershedExpression,
  buildWatershedMatchExpression,
  calculateFeatureBounds,
  clearPolygonHover,
  clearPolygonSelect,
  createPolygonClickHandler,
  createPolygonHoverHandler,
  getActiveLayers,
  getAllYearZonalStats,
  getUpdatedBenthicColor,
  mapRegionSelected,
  mapToggleChange,
  postZonalStats,
  prepareZonalStatsCall,
  querySourceFeatureAtPointWhenReady,
  querySourceFeatureWhenReady,
  resolveBasemapBeforeId,
  setPolygonSelect,
} from '../utils/mapUtils'
import { FilterSpecification, Map, MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl'
import { RefObject } from 'react'
import { regionOptions } from '../data/regionData'
import { atlasBenthicColors, sedExportColorMapping, transparent } from '../data/mapData'
import {
  BASE_ZONAL_STATS_API,
  SEDIMENT_EXPOSURE_2000_URL,
  SEDIMENT_EXPOSURE_2020_URL,
  topContributingWatershedColorFills,
} from '../constants'
import { LayerInfo } from '../types/MapDataTypes'

jest.mock('@turf/boolean-point-in-polygon')
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

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
  state: { loaded: false },
  layer: { id: 'countries' },
  properties: { COUNTRY_ID: 54 },
} as unknown as MapGeoJSONFeature

const makeMap = () => ({ setFeatureState: jest.fn(), getFeatureState: jest.fn() }) as unknown as Map

const makeQueryMap = () =>
  ({
    querySourceFeatures: jest.fn().mockReturnValue([]),
    isSourceLoaded: jest.fn().mockReturnValue(false),
    on: jest.fn(),
    off: jest.fn(),
    setFeatureState: jest.fn(),
    getFeatureState: jest.fn(),
  }) as unknown as Map

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

  // ─── New test blocks ──────────────────────────────────────────────────────

  describe('getUpdatedBenthicColor', () => {
    it('returns atlasBenthicColors[layerId] when currentColors[layerId] is transparent', () => {
      const currentColors = { coral_algae: transparent }
      expect(getUpdatedBenthicColor('coral_algae', currentColors)).toBe(
        atlasBenthicColors['coral_algae'],
      )
    })

    it('returns transparent when currentColors[layerId] is not transparent', () => {
      const currentColors = { coral_algae: '#CC6677' }
      expect(getUpdatedBenthicColor('coral_algae', currentColors)).toBe(transparent)
    })
  })

  describe('calculateFeatureBounds', () => {
    it('returns the correct bounding box corners for a polygon feature', () => {
      const feature = {
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
      } as unknown as MapGeoJSONFeature

      const bounds = calculateFeatureBounds(feature)
      expect(bounds._sw.lng).toBeCloseTo(178.0)
      expect(bounds._sw.lat).toBeCloseTo(-18.0)
      expect(bounds._ne.lng).toBeCloseTo(179.0)
      expect(bounds._ne.lat).toBeCloseTo(-17.0)
    })
  })

  describe('polygon state helpers', () => {
    it('clearPolygonHover and clearPolygonSelect call setFeatureState with the correct state and null the ref', () => {
      const map = makeMap()
      const hoveredRef = { current: 'hover-id' } as RefObject<string | number | null>
      clearPolygonHover(map, hoveredRef, mockLayers[1])
      expect(map.setFeatureState).toHaveBeenCalledWith(
        {
          source: mockLayers[1].sourceId,
          sourceLayer: mockLayers[1].sourceFileName,
          id: 'hover-id',
        },
        { hover: false },
      )
      expect(hoveredRef.current).toBeNull()

      const clickRef = { current: 'select-id' } as RefObject<string | number | null>
      clearPolygonSelect(map, clickRef, mockLayers[2])
      expect(map.setFeatureState).toHaveBeenCalledWith(
        {
          source: mockLayers[2].sourceId,
          sourceLayer: mockLayers[2].sourceFileName,
          id: 'select-id',
        },
        { select: false },
      )
      expect(clickRef.current).toBeNull()
    })

    it('clear helpers do nothing when ref is null', () => {
      const map = makeMap()
      clearPolygonHover(map, { current: null } as RefObject<string | number | null>, mockLayers[1])
      clearPolygonSelect(map, { current: null } as RefObject<string | number | null>, mockLayers[2])
      expect(map.setFeatureState).not.toHaveBeenCalled()
    })

    it('setPolygonSelect updates the ref and calls setFeatureState with select: true', () => {
      const map = makeMap()
      const clickRef = { current: null } as RefObject<string | number | null>
      setPolygonSelect(map, clickRef, mockLayers[1], 'feature-99')
      expect(clickRef.current).toBe('feature-99')
      expect(map.setFeatureState).toHaveBeenCalledWith(
        {
          source: mockLayers[1].sourceId,
          sourceLayer: mockLayers[1].sourceFileName,
          id: 'feature-99',
        },
        { select: true },
      )
    })
  })

  describe('mapToggleChange', () => {
    const yearLayers: LayerInfo[] = [
      { ...mockLayers[0], layerId: 'benthic', year: 2000, isLayerOn: false },
      { ...mockLayers[0], layerId: 'benthic', year: 2005, isLayerOn: false },
      { ...mockLayers[0], layerId: 'other', year: undefined, isLayerOn: false },
    ]

    it('updates isLayerOn only for the layer with the matching id and year', () => {
      const result = mapToggleChange(yearLayers, 'benthic', true, 2000)
      expect(result[0].isLayerOn).toBe(true)
      expect(result[1].isLayerOn).toBe(false) // year 2005 ≠ 2000
      expect(result[2].isLayerOn).toBe(false) // different layerId
    })

    it('updates isLayerOn for a layer with year === undefined regardless of the year argument', () => {
      const result = mapToggleChange(yearLayers, 'other', true, 2020)
      expect(result[0].isLayerOn).toBe(false)
      expect(result[1].isLayerOn).toBe(false)
      expect(result[2].isLayerOn).toBe(true)
    })

    it('leaves all layers unchanged when no layerId matches', () => {
      const result = mapToggleChange(yearLayers, 'nonexistent', true, 2000)
      expect(result.every((l) => !l.isLayerOn)).toBe(true)
    })

    it('returns a new array without mutating the original', () => {
      const result = mapToggleChange(yearLayers, 'benthic', true, 2000)
      expect(result).not.toBe(yearLayers)
      expect(yearLayers[0].isLayerOn).toBe(false)
    })
  })

  describe('buildBenthicFillExpression', () => {
    const colors = {
      coral_algae: '#CC6677',
      microalgal_mats: '#44AA99',
      rock: '#88CCEE',
      rubble: '#332288',
      sand: '#DECC77',
      seagrass: '#117733',
    }

    it('starts with "case"', () => {
      const expr = buildBenthicFillExpression(colors)
      expect(expr[0]).toBe('case')
    })

    it('ends with the transparent fallback', () => {
      const expr = buildBenthicFillExpression(colors)
      expect(expr[expr.length - 1]).toBe(transparent)
    })

    it('maps each class_name condition to the correct colour', () => {
      const expr = buildBenthicFillExpression(colors)

      const coralIdx = (expr as unknown[]).findIndex(
        (e) => Array.isArray(e) && (e as unknown[])[2] === 'Coral/Algae',
      )
      expect(coralIdx).toBeGreaterThan(-1)
      expect(expr[coralIdx + 1]).toBe(colors['coral_algae'])

      const sandIdx = (expr as unknown[]).findIndex(
        (e) => Array.isArray(e) && (e as unknown[])[2] === 'Sand',
      )
      expect(sandIdx).toBeGreaterThan(-1)
      expect(expr[sandIdx + 1]).toBe(colors['sand'])
    })
  })

  describe('postZonalStats', () => {
    it('returns parsed JSON on a successful response', async () => {
      const mockData = { result: 'ok' }
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      const result = await postZonalStats({ aoi: null })
      expect(result).toEqual(mockData)
    })

    it('throws when the response status is not ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 422,
      } as Response)

      await expect(postZonalStats({ aoi: null })).rejects.toThrow()
    })

    it('throws on a network-level error', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'))

      await expect(postZonalStats({ aoi: null })).rejects.toThrow()
    })
  })

  describe('prepareZonalStatsCall', () => {
    it('POSTs to BASE_ZONAL_STATS_API with the correct payload shape', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      await prepareZonalStatsCall({ lng: 179.0, lat: -18.0 }, 2020)

      const [url, options] = fetchSpy.mock.calls[0]
      expect(url).toBe(BASE_ZONAL_STATS_API)

      const body = JSON.parse(options!.body as string)
      expect(body.aoi).toEqual({ type: 'Point', coordinates: [179.0, -18.0] })
      expect(body.url).toBe(SEDIMENT_EXPOSURE_2020_URL)
      expect(body.bands).toEqual([1, 2, 3, 4, 5, 6, 7])
      expect(body.stats).toEqual(['majority'])
    })

    it('uses the correct COG URL for the requested year', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      await prepareZonalStatsCall({ lng: 178.0, lat: -17.0 }, 2000)

      const [, options] = fetchSpy.mock.calls[0]
      const body = JSON.parse(options!.body as string)
      expect(body.url).toBe(SEDIMENT_EXPOSURE_2000_URL)
    })

    it('throws with a descriptive error for an unmapped year', async () => {
      await expect(prepareZonalStatsCall({ lng: 179.0, lat: -18.0 }, 1999)).rejects.toThrow(
        'No sediment exposure URL available for year: 1999',
      )
    })
  })

  describe('getAllYearZonalStats', () => {
    it('calls for all 5 years and merges their results', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ band_1: { majority: 3 } }),
      } as Response)

      const result = await getAllYearZonalStats({ lng: 179.0, lat: -18.0 })

      expect(fetch).toHaveBeenCalledTimes(5)
      expect(result).toHaveProperty('2000')
      expect(result).toHaveProperty('2005')
      expect(result).toHaveProperty('2010')
      expect(result).toHaveProperty('2015')
      expect(result).toHaveProperty('2020')
    })

    it('returns an empty object for a failing year without throwing', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Network failure')) // year 2000 fails
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ band_1: { majority: 1 } }),
        } as Response)

      const result = await getAllYearZonalStats({ lng: 179.0, lat: -18.0 })

      expect(result[2000]).toEqual({})
      expect(result[2005]).toEqual({ band_1: { majority: 1 } })
    })
  })

  describe('resolveBasemapBeforeId', () => {
    it('returns the first symbol layer after the last blocking layer', () => {
      const layers = [
        { id: 'fill-layer', type: 'fill' },
        { id: 'label-before-blocking', type: 'symbol' },
        { id: 'hillshade-layer', type: 'hillshade' },
        { id: 'label-after-blocking', type: 'symbol' },
      ]
      expect(resolveBasemapBeforeId(layers)).toBe('label-after-blocking')
    })

    it('falls back to the first symbol when there are no blocking layers', () => {
      const layers = [
        { id: 'first-symbol', type: 'symbol' },
        { id: 'line-layer', type: 'line' },
        { id: 'second-symbol', type: 'symbol' },
      ]
      expect(resolveBasemapBeforeId(layers)).toBe('first-symbol')
    })

    it('returns the first non-background layer when there are no symbol layers at all', () => {
      const layers = [
        { id: 'bg', type: 'background' },
        { id: 'road', type: 'line' },
        { id: 'border', type: 'line' },
      ]
      expect(resolveBasemapBeforeId(layers)).toBe('road')
    })

    it('returns undefined when the layers array is empty', () => {
      expect(resolveBasemapBeforeId([])).toBeUndefined()
    })
  })

  describe('querySourceFeatureWhenReady', () => {
    afterEach(() => {
      jest.useRealTimers()
    })

    it('calls onResult synchronously and returns a no-op cancel when a feature is found immediately', () => {
      const mockFeature = {
        id: 'f1',
        geometry: { type: 'Polygon' },
      } as unknown as MapGeoJSONFeature
      const map = makeQueryMap()
      ;(map.querySourceFeatures as jest.Mock).mockReturnValue([mockFeature])
      const onResult = jest.fn()

      const cancel = querySourceFeatureWhenReady(
        map,
        'src',
        'layer',
        [] as unknown as FilterSpecification,
        onResult,
      )

      expect(onResult).toHaveBeenCalledWith(mockFeature)
      expect(map.on).not.toHaveBeenCalled()

      cancel() // no-op — should not call onResult a second time
      expect(onResult).toHaveBeenCalledTimes(1)
    })

    it('registers a sourcedata listener when no feature is found immediately', () => {
      const map = makeQueryMap()
      const onResult = jest.fn()

      const cancel = querySourceFeatureWhenReady(
        map,
        'src',
        'layer',
        [] as unknown as FilterSpecification,
        onResult,
        10_000,
      )

      expect(onResult).not.toHaveBeenCalled()
      expect(map.on).toHaveBeenCalledWith('sourcedata', expect.any(Function))
      cancel()
    })

    it('calls onResult with the feature once the sourcedata event fires', () => {
      const mockFeature = {
        id: 'f2',
        geometry: { type: 'Polygon' },
      } as unknown as MapGeoJSONFeature
      const map = makeQueryMap()
      ;(map.querySourceFeatures as jest.Mock)
        .mockReturnValueOnce([]) // no feature on first try
        .mockReturnValue([mockFeature])
      const onResult = jest.fn()

      querySourceFeatureWhenReady(
        map,
        'src',
        'layer',
        [] as unknown as FilterSpecification,
        onResult,
        10_000,
      )

      const sourcedataHandler = (map.on as jest.Mock).mock.calls.find(
        (c) => c[0] === 'sourcedata',
      )[1]
      sourcedataHandler({ sourceId: 'src' })

      expect(onResult).toHaveBeenCalledWith(mockFeature)
      expect(map.off).toHaveBeenCalledWith('sourcedata', sourcedataHandler)
    })

    it('calls onResult(null) and cleans up when cancel is invoked', () => {
      const map = makeQueryMap()
      const onResult = jest.fn()

      const cancel = querySourceFeatureWhenReady(
        map,
        'src',
        'layer',
        [] as unknown as FilterSpecification,
        onResult,
        10_000,
      )

      cancel()

      expect(onResult).toHaveBeenCalledWith(null)
      expect(map.off).toHaveBeenCalled()
    })

    it('calls onResult(null) after the timeout elapses', () => {
      jest.useFakeTimers()
      const map = makeQueryMap()
      const onResult = jest.fn()

      querySourceFeatureWhenReady(
        map,
        'src',
        'layer',
        [] as unknown as FilterSpecification,
        onResult,
        5_000,
      )

      expect(onResult).not.toHaveBeenCalled()
      jest.advanceTimersByTime(5_000)
      expect(onResult).toHaveBeenCalledWith(null)
    })
  })

  describe('querySourceFeatureAtPointWhenReady', () => {
    const point = { lng: 179.0, lat: -18.0 }

    beforeEach(() => {
      ;(booleanPointInPolygon as jest.Mock).mockReturnValue(false)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('calls onResult synchronously with the matching feature when a polygon contains the point', () => {
      const mockFeature = {
        id: 'poly-1',
        geometry: { type: 'Polygon' },
      } as unknown as MapGeoJSONFeature
      const map = makeQueryMap()
      ;(map.querySourceFeatures as jest.Mock).mockReturnValue([mockFeature])
      ;(booleanPointInPolygon as jest.Mock).mockReturnValue(true)
      const onResult = jest.fn()

      querySourceFeatureAtPointWhenReady(map, 'src', 'layer', point, onResult)

      expect(onResult).toHaveBeenCalledWith(mockFeature)
      expect(map.on).not.toHaveBeenCalled()
    })

    it('calls onResult(null) synchronously when the source is already loaded but contains no match', () => {
      const map = makeQueryMap()
      ;(map.querySourceFeatures as jest.Mock).mockReturnValue([])
      ;(map.isSourceLoaded as jest.Mock).mockReturnValue(true)
      const onResult = jest.fn()

      querySourceFeatureAtPointWhenReady(map, 'src', 'layer', point, onResult)

      expect(onResult).toHaveBeenCalledWith(null)
      expect(map.on).not.toHaveBeenCalled()
    })

    it('calls onResult(null) when cancel is invoked before tiles finish loading', () => {
      const map = makeQueryMap()
      ;(map.isSourceLoaded as jest.Mock).mockReturnValue(false)
      const onResult = jest.fn()

      const cancel = querySourceFeatureAtPointWhenReady(map, 'src', 'layer', point, onResult)
      cancel()

      expect(onResult).toHaveBeenCalledWith(null)
      expect(map.off).toHaveBeenCalled()
    })

    it('calls onResult(null) after the timeout elapses with no matching feature', () => {
      jest.useFakeTimers()
      const map = makeQueryMap()
      ;(map.isSourceLoaded as jest.Mock).mockReturnValue(false)
      const onResult = jest.fn()

      querySourceFeatureAtPointWhenReady(map, 'src', 'layer', point, onResult, 3_000)

      expect(onResult).not.toHaveBeenCalled()
      jest.advanceTimersByTime(3_000)
      expect(onResult).toHaveBeenCalledWith(null)
    })
  })
})
