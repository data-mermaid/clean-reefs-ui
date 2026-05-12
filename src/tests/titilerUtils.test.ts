import { LngLat } from 'maplibre-gl'
import { buildExpression, buildItemId, buildTileUrl, fetchStatistics } from '../utils/titilerUtils'
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
  it('returns null for global region', () => {
    expect(buildExpression(makeRegion({ regionType: 'global' }))).toBeNull()
  })

  it('returns null for region without bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'country' }))).toBeNull()
  })

  it('returns null for watershed without bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'watershed' }))).toBeNull()
  })

  it('returns country expression for country with bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'country', bandId: 54 }))).toBe(
      'where((cog_b8==54), cog_b1, 0)',
    )
  })

  it('returns region expression for region with bandId', () => {
    expect(buildExpression(makeRegion({ regionType: 'region', bandId: 2 }))).toBe(
      'where((cog_b9==2), cog_b1, 0)',
    )
  })
})

describe('buildItemId', () => {
  it.each([2000, 2005, 2010, 2015, 2020])('builds item ID for year %i', (year) => {
    expect(buildItemId(year)).toBe(`${SED_DISPERSAL_COLLECTION_ID}_${year}`)
  })
})

describe('buildTileUrl', () => {
  const url = new URL(
    buildTileUrl(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      5,
      10,
      20,
      0,
      260.8,
      'cog_b1',
    ),
  )

  it('targets the correct tile path', () => {
    expect(url.pathname).toBe(
      '/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2020/tiles/WebMercatorQuad/5/10/20',
    )
  })

  it('sets rescale from min/max', () => {
    expect(url.searchParams.get('rescale')).toBe('0,260.8')
  })

  it('uses viridis colormap', () => {
    expect(url.searchParams.get('colormap_name')).toBe('viridis')
  })

  it('sets expression', () => {
    expect(url.searchParams.get('expression')).toBe('cog_b1')
  })
})

describe('fetchStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  const mockStats = (expression: string) => ({
    [expression]: { min: 0.5, max: 123.456 },
  })

  it('returns rounded min/max for global (null expression)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
    )
    expect(result).toEqual({ min: 0.5, max: 123.5 })
  })

  it('returns rounded min/max for regional expression', async () => {
    const expression = 'where((cog_b9==2), cog_b1, 0)'
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      expression,
    )
    expect(result).toEqual({ min: 0.5, max: 123.5 })
  })

  it('sends correct asset_bidx for global (null expression)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', null)
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1')
  })

  it('sends correct asset_bidx for country expression (band 8)', async () => {
    const expression = 'where((cog_b8==54), cog_b1, 0)'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', expression)
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1,8')
  })

  it('sends correct asset_bidx for realm expression (band 9)', async () => {
    const expression = 'where((cog_b9==2), cog_b1, 0)'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', expression)
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1,9')
  })

  it('includes correct base URL and path', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchStatistics('gpw_sediment_exposure', 'gpw_sediment_exposure_2020', null)
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
    )
    expect(result).toBeNull()
  })

  it('returns null on fetch error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
    )
    expect(result).toBeNull()
  })
})
