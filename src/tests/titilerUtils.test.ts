import { LngLat } from 'maplibre-gl'
import {
  buildExpression,
  buildItemId,
  buildTileUrlTemplate,
  fetchStatistics,
} from '../utils/titilerUtils'
import { RegionOption } from '../types/RegionDataTypes'
import { SED_DISPERSAL_COLLECTION_ID, TITILER_API_BASE_URL } from '../constants'

const makeRegion = (overrides: Partial<RegionOption>): RegionOption => ({
  id: 'test',
  regionType: 'global',
  label: 'Test',
  centerCoord: new LngLat(0, 0),
  zoomLevel: 5,
  ...overrides,
})

describe('buildExpression', () => {
  it('returns null expression and base bidx for global region', () => {
    expect(buildExpression(makeRegion({ regionType: 'global' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns null expression and base bidx for region without bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'country' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns null expression and base bidx for watershed without bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'watershed' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns country expression and band 8 bidx for country with bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'country', bandId: 54 }))).toEqual({
      expression: 'where((cog_b8==54), cog_b1, 0)',
      assetBidx: 'cog|1,8',
    })
  })

  it('returns region expression and band 9 bidx for region with bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'region', bandId: 2 }))).toEqual({
      expression: 'where((cog_b9==2), cog_b1, 0)',
      assetBidx: 'cog|1,9',
    })
  })
})

describe('buildItemId', () => {
  it.each([2000, 2005, 2010, 2015, 2020])('builds item ID for year %i', (year) => {
    expect(buildItemId(year)).toBe(`${SED_DISPERSAL_COLLECTION_ID}_${year}`)
  })
})

describe('buildTileUrlTemplate', () => {
  const max = 260.8
  const template = buildTileUrlTemplate('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', max)
  const [pathPart, queryPart] = template.split('?')
  const params = new URLSearchParams(queryPart)

  it('contains MapLibre tile placeholders in path', () => {
    expect(pathPart).toContain('{z}/{x}/{y}')
  })

  it('targets the correct tile path', () => {
    expect(pathPart).toContain(
      '/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2020/tiles/WebMercatorQuad/{z}/{x}/{y}',
    )
  })

  it('sets rescale from 0 to max', () => {
    expect(params.get('rescale')).toBe(`0,${max}`)
  })

  it('uses viridis colormap', () => {
    expect(params.get('colormap_name')).toBe('viridis')
  })

  it('clamps expression at max', () => {
    expect(params.get('expression')).toBe(`where(cog_b1>${max},${max},cog_b1)`)
  })
})

describe('fetchStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  const mockStats = (expression: string) => ({
    [expression]: { min: 0.0, max: 500.0, percentile_2: 1.234, percentile_98: 234.567 },
  })

  it('returns rounded percentile_2/percentile_98 for global (null expression)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toEqual({ min: 1.2, max: 234.6 })
  })

  it('returns rounded percentile_2/percentile_98 for regional expression', async () => {
    const expression = 'where((cog_b9==2), cog_b1, 0)'
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      expression,
      'cog|1,9',
    )
    expect(result).toEqual({ min: 1.2, max: 234.6 })
  })

  it('returns null when percentiles are missing from response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cog_b1: { min: 0.0, max: 500.0 } }),
    } as Response)
    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('sends correct asset_bidx for global (null expression)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', null, 'cog|1')
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1')
  })

  it('sends correct asset_bidx for country expression (band 8)', async () => {
    const expression = 'where((cog_b8==54), cog_b1, 0)'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      expression,
      'cog|1,8',
    )
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1,8')
  })

  it('sends correct asset_bidx for realm expression (band 9)', async () => {
    const expression = 'where((cog_b9==2), cog_b1, 0)'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      expression,
      'cog|1,9',
    )
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1,9')
  })

  it('includes correct base URL and path', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', null, 'cog|1')
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.origin).toBe(TITILER_API_BASE_URL)
    expect(calledUrl.pathname).toBe(
      '/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2020/statistics',
    )
  })

  it('returns null when API response is not ok', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' } as Response)
    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('returns null when response is missing expected key', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)
    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('returns null on fetch error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })
})
