import { LngLat } from 'maplibre-gl'
import {
  buildSedExposureExpression,
  buildSedExposureItemId,
  buildSedExposureTileUrl,
  fetchSedExposureStatistics,
  fetchSedLoadStatistics,
  buildSedLoadTileUrl,
} from '../utils/titilerUtils'
import { RegionOption } from '../types/RegionDataTypes'
import {
  SED_EXPOSURE_COLLECTION_ID,
  SED_LOAD_COLLECTION_ID,
  TITILER_API_BASE_URL,
} from '../constants'

const makeRegion = (overrides: Partial<RegionOption>): RegionOption => ({
  id: 'test',
  regionType: 'global',
  label: 'Test',
  centerCoord: new LngLat(0, 0),
  zoomLevel: 5,
  ...overrides,
})

describe('buildSedExposureExpression', () => {
  it('returns null expression and base bidx for global region', () => {
    expect(buildSedExposureExpression(makeRegion({ regionType: 'global' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns null expression and base bidx for region without bandId', () => {
    expect(buildSedExposureExpression(makeRegion({ regionType: 'country' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns null expression and base bidx for watershed without bandId', () => {
    expect(buildSedExposureExpression(makeRegion({ regionType: 'watershed' }))).toEqual({
      expression: null,
      assetBidx: 'cog|1',
    })
  })

  it('returns country expression and band 8 bidx for country with bandId', () => {
    expect(buildSedExposureExpression(makeRegion({ regionType: 'country', bandId: 54 }))).toEqual({
      expression: 'where((cog_b8==54), cog_b1, 0)',
      assetBidx: 'cog|1,8',
    })
  })

  it('returns region expression and band 9 bidx for region with bandId', () => {
    expect(buildSedExposureExpression(makeRegion({ regionType: 'region', bandId: 2 }))).toEqual({
      expression: 'where((cog_b9==2), cog_b1, 0)',
      assetBidx: 'cog|1,9',
    })
  })
})

describe('buildSedExposureItemId', () => {
  it.each([2000, 2005, 2010, 2015, 2020])('builds dispersal item ID for year %i', (year) => {
    expect(buildSedExposureItemId(year)).toBe(`${SED_EXPOSURE_COLLECTION_ID}_${year}`)
  })
})

describe('buildSedExposureTileUrl', () => {
  const max = 260.8
  const template = buildSedExposureTileUrl(
    'gpw_sediment_exposure',
    'gpw_sediment_exposure_2020',
    max,
  )
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

  it('sets rescale to log10(max+1)', () => {
    const logMax = Math.log10(max + 1)
    expect(params.get('rescale')).toBe(`0,${logMax}`)
  })

  it('uses viridis colormap by default', () => {
    expect(params.get('colormap_name')).toBe('viridis')
  })

  it('applies log10 transform to global expression', () => {
    expect(params.get('expression')).toBe('log10(cog_b1+1)')
  })

  it('does not set nodata for global', () => {
    expect(params.get('nodata')).toBeNull()
  })

  describe('country region', () => {
    const countryRegion = {
      bandId: 54,
      regionType: 'country' as const,
      id: 'fiji',
      label: 'Fiji',
      parentRegionIds: [],
    }
    const countryUrl = buildSedExposureTileUrl(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      max,
      countryRegion,
    )
    const countryParams = new URLSearchParams(countryUrl.split('?')[1])

    it('masks to country band b8', () => {
      const logMax = Math.log10(max + 1)
      const logEpsilon = logMax / 127
      expect(countryParams.get('expression')).toBe(
        `where((cog_b8==54),where(log10(cog_b1+1)<${logEpsilon},${logEpsilon},log10(cog_b1+1)),0)`,
      )
    })

    it('omits asset_bidx so TiTiler resolves bands from the expression', () => {
      expect(countryParams.get('asset_bidx')).toBeNull()
    })

    it('does not set nodata', () => {
      expect(countryParams.get('nodata')).toBeNull()
    })
  })

  describe('region type', () => {
    const realmRegion = {
      bandId: 2,
      regionType: 'region' as const,
      id: 'cip',
      label: 'CIP',
      parentRegionIds: [],
    }
    const realmUrl = buildSedExposureTileUrl(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      max,
      realmRegion,
    )
    const realmParams = new URLSearchParams(realmUrl.split('?')[1])

    it('masks to realm band b9', () => {
      const logMax = Math.log10(max + 1)
      const logEpsilon = logMax / 127
      expect(realmParams.get('expression')).toBe(
        `where((cog_b9==2),where(log10(cog_b1+1)<${logEpsilon},${logEpsilon},log10(cog_b1+1)),0)`,
      )
    })

    it('omits asset_bidx so TiTiler resolves bands from the expression', () => {
      expect(realmParams.get('asset_bidx')).toBeNull()
    })

    it('does not set nodata', () => {
      expect(realmParams.get('nodata')).toBeNull()
    })
  })
})

describe('fetchSedExposureStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  const mockStats = (expression: string) => ({
    [expression]: { min: 0.0, max: 500.0, percentile_2: 1.234, percentile_98: 234.567 },
  })

  it('returns rounded min/max for global (null expression)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toEqual({ min: 0, max: 500 })
  })

  it('returns rounded min/max for regional expression', async () => {
    const expression = 'where((cog_b9==2), cog_b1, 0)'
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      expression,
      'cog|1,9',
    )
    expect(result).toEqual({ min: 0, max: 500 })
  })

  it('clamps negative min to 0', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cog_b1: { min: -0.3, max: 500.0 } }),
    } as Response)

    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toEqual({ min: 0, max: 500 })
  })

  it('returns null when min/max are missing from response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cog_b1: { percentile_2: 1.234, percentile_98: 234.567 } }),
    } as Response)
    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('sends asset_bidx=cog|1 for global (null expression)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1')
  })

  it('sends correct asset_bidx for country expression (band 8)', async () => {
    const expression = 'where((cog_b8==54), cog_b1, 0)'
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats(expression),
    } as Response)

    await fetchSedExposureStatistics(
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

    await fetchSedExposureStatistics(
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

    await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
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
    const result = await fetchSedExposureStatistics(
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
    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('returns null on fetch error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchSedExposureStatistics(
      'gpw_sediment_exposure',
      'gpw_sediment_exposure_2020',
      null,
      'cog|1',
    )
    expect(result).toBeNull()
  })

  it('returns rounded min/max for sediment load collection', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    const result = await fetchSedExposureStatistics(
      SED_LOAD_COLLECTION_ID,
      `${SED_LOAD_COLLECTION_ID}_2020`,
      null,
      'cog|1',
    )
    expect(result).toEqual({ min: 0, max: 500 })
  })

  it('sends correct path for sediment load collection', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats('cog_b1'),
    } as Response)

    await fetchSedExposureStatistics(
      SED_LOAD_COLLECTION_ID,
      `${SED_LOAD_COLLECTION_ID}_2020`,
      null,
      'cog|1',
    )
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.pathname).toBe(
      `/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${SED_LOAD_COLLECTION_ID}_2020/statistics`,
    )
  })
})

describe('fetchSedLoadStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  const mockSedLoadStats = () => ({
    cog_b1: {
      min: -1.0,
      max: 50.0,
      percentile_2: -0.23,
      percentile_98: 8.88,
    },
  })

  it('returns min/max/p98 with min clamped to 0', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSedLoadStats(),
    } as Response)

    const result = await fetchSedLoadStatistics(2020)
    expect(result).toEqual({ min: 0, max: 50, p98: 8.9 })
  })

  it('returns positive min as-is when above 0; p98 is null when percentile_98 missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cog_b1: { min: 0.4, max: 34.2 } }),
    } as Response)

    const result = await fetchSedLoadStatistics(2020)
    expect(result).toEqual({ min: 0.4, max: 34.2, p98: null })
  })

  it('sends correct path and params for the given year', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockSedLoadStats(),
    } as Response)

    await fetchSedLoadStatistics(2015)
    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string)
    expect(calledUrl.pathname).toBe(
      `/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${SED_LOAD_COLLECTION_ID}_2015/statistics`,
    )
    expect(calledUrl.searchParams.get('assets')).toBe('cog')
    expect(calledUrl.searchParams.get('asset_bidx')).toBe('cog|1')
  })

  it('returns null when min/max are missing from response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cog_b1: { percentile_2: -0.23, percentile_98: 8.88 } }),
    } as Response)
    expect(await fetchSedLoadStatistics(2020)).toBeNull()
  })

  it('returns null when API response is not ok', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' } as Response)
    expect(await fetchSedLoadStatistics(2020)).toBeNull()
  })

  it('returns null on fetch error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    expect(await fetchSedLoadStatistics(2020)).toBeNull()
  })
})

describe('buildSedLoadTileUrl', () => {
  const min = 0
  const max = 8.9
  const logMax = Math.log10(max + 1)

  describe('global (no region)', () => {
    const template = buildSedLoadTileUrl(2020, min, max)
    const [pathPart, queryPart] = template.split('?')
    const params = new URLSearchParams(queryPart)

    it('contains MapLibre tile placeholders in path', () => {
      expect(pathPart).toContain('{z}/{x}/{y}')
    })

    it('targets the correct collection and item in the path', () => {
      expect(pathPart).toContain(
        `/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${SED_LOAD_COLLECTION_ID}_2020/tiles/WebMercatorQuad/{z}/{x}/{y}`,
      )
    })

    it('sets rescale in log10 space from 0 to log10(max) when no rescaleMax provided', () => {
      expect(params.get('rescale')).toBe(`0,${logMax}`)
    })

    it('uses log10(rescaleMax+1) for rescale when rescaleMax is provided', () => {
      const p98 = 5.5
      const urlWithP98 = buildSedLoadTileUrl(2020, min, max, undefined, p98)
      const p = new URLSearchParams(urlWithP98.split('?')[1])
      expect(p.get('rescale')).toBe(`0,${Math.log10(p98 + 1)}`)
    })

    it('uses log1p expression for global view', () => {
      expect(params.get('expression')).toBe('log10(cog_b1+1)')
    })

    it('uses a global colormap where entry 0 is opaque', () => {
      const colormap = JSON.parse(params.get('colormap') ?? '{}')
      expect(colormap['0'][3]).toBe(255)
      expect(colormap['255'][3]).toBe(255)
    })

    it('uses the cog asset key', () => {
      expect(params.get('assets')).toBe('cog')
    })

    it('does not set asset_bidx or nodata', () => {
      expect(params.get('asset_bidx')).toBeNull()
      expect(params.get('nodata')).toBeNull()
    })
  })

  describe('country region filter', () => {
    const region = makeRegion({ regionType: 'country', bandId: 54 })
    const template = buildSedLoadTileUrl(2020, min, max, region)
    const [, queryPart] = template.split('?')
    const params = new URLSearchParams(queryPart)

    it('sets log1p expression with bandId * 1000 on cog_b2', () => {
      expect(params.get('expression')).toBe('where((cog_b2==54000),log10(cog_b1+1),0)')
    })

    it('sets nodata=0 to reinforce out-of-region masking', () => {
      expect(params.get('nodata')).toBe('0')
    })

    it('omits asset_bidx when expression is set', () => {
      expect(params.get('asset_bidx')).toBeNull()
    })

    it('uses a regional colormap where entry 0 is transparent', () => {
      const colormap = JSON.parse(params.get('colormap') ?? '{}')
      expect(colormap['0'][3]).toBe(0)
      expect(colormap['255'][3]).toBe(255)
    })
  })

  describe('region filter', () => {
    const region = makeRegion({ regionType: 'region', bandId: 2 })
    const template = buildSedLoadTileUrl(2020, min, max, region)
    const [, queryPart] = template.split('?')
    const params = new URLSearchParams(queryPart)

    it('sets log1p expression with bandId * 1000 on cog_b3', () => {
      expect(params.get('expression')).toBe('where((cog_b3==2000),log10(cog_b1+1),0)')
    })

    it('sets nodata=0 to reinforce out-of-region masking', () => {
      expect(params.get('nodata')).toBe('0')
    })
  })

  describe('global region with no bandId', () => {
    const region = makeRegion({ regionType: 'global' })
    const template = buildSedLoadTileUrl(2020, min, max, region)
    const [, queryPart] = template.split('?')
    const params = new URLSearchParams(queryPart)

    it('uses log1p global expression when no bandId', () => {
      expect(params.get('expression')).toBe('log10(cog_b1+1)')
      expect(params.get('asset_bidx')).toBeNull()
    })
  })
})
