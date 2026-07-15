import {
  fetchAllBoundaryFeatures,
  fetchCountryRegionMap,
  fetchGlobalBoundaryProperties,
  fetchWatershedIdsForRegion,
} from '../utils/pmtilesUtils'

// mockGetZxy is declared before jest.mock so the factory can close over it.
// The pmtilesCache in pmtilesUtils reuses the first-created instance, so all
// tests must reconfigure this single fn rather than swap out the constructor.
const mockGetZxy = jest.fn()

jest.mock('pmtiles', () => ({
  PMTiles: jest.fn().mockImplementation(() => ({ getZxy: mockGetZxy })),
  FetchSource: jest.fn(),
}))

jest.mock('@mapbox/vector-tile', () => ({
  VectorTile: jest.fn(),
}))

jest.mock('pbf', () => jest.fn())

jest.mock('../data/countryExtents', () => ({
  COUNTRY_EXTENTS: {
    Fiji: [174.5889, -21.7111, 181.7839, -12.4753],
  },
}))

jest.mock('../data/regionExtents', () => ({
  REGION_EXTENTS: {
    'Central Indo-Pacific': [93.4884, -34.9659, 193.5472, 31.8309],
  },
}))

import { VectorTile } from '@mapbox/vector-tile'

const makeTile = (features: { properties: Record<string, unknown> }[]) => ({
  layers: {
    data: {
      length: features.length,
      feature: (i: number) => features[i],
    },
  },
})

describe('fetchAllBoundaryFeatures', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns only features where total_sed_load_2020 is present', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 54, TERRITORY1: 'Fiji', total_sed_load_2020: 1234 } },
        { properties: { COUNTRY_ID: 999, TERRITORY1: 'NoReef', total_sed_load_2020: null } },
        { properties: { COUNTRY_ID: 138, TERRITORY1: 'Solomon Islands' } },
      ]),
    )

    const results = await fetchAllBoundaryFeatures('country')

    expect(results).toHaveLength(1)
    expect(results[0].label).toBe('Fiji')
    expect(results[0].bandId).toBe(54)
    expect(results[0].id).toBe('fiji')
    expect(results[0].regionType).toBe('country')
  })

  it('sets extent when label exists in static map', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([{ properties: { COUNTRY_ID: 54, TERRITORY1: 'Fiji', total_sed_load_2020: 1234 } }]),
    )

    const results = await fetchAllBoundaryFeatures('country')

    expect(results[0].extent).toEqual([174.5889, -21.7111, 181.7839, -12.4753])
  })

  it('omits extent when label is not in static map', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 999, TERRITORY1: 'Unknown Island', total_sed_load_2020: 1 } },
      ]),
    )

    const results = await fetchAllBoundaryFeatures('country')

    expect(results[0].extent).toBeUndefined()
  })

  it('returns empty array when tile data is absent', async () => {
    mockGetZxy.mockResolvedValue(null)

    const results = await fetchAllBoundaryFeatures('country')

    expect(results).toEqual([])
  })

  it('returns empty array on error', async () => {
    mockGetZxy.mockRejectedValue(new Error('network'))

    const results = await fetchAllBoundaryFeatures('country')

    expect(results).toEqual([])
  })

  it('maps region type correctly using REALM and REALM_ID', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        {
          properties: {
            REALM_ID: 2,
            REALM: 'Central Indo-Pacific',
            total_sed_load_2020: 5678,
          },
        },
      ]),
    )

    const results = await fetchAllBoundaryFeatures('region')

    expect(results[0].regionType).toBe('region')
    expect(results[0].label).toBe('Central Indo-Pacific')
    expect(results[0].bandId).toBe(2)
    expect(results[0].id).toBe('central-indo-pacific')
    expect(results[0].extent).toEqual([93.4884, -34.9659, 193.5472, 31.8309])
  })

  it('generates ASCII-safe id slugs for labels with accents and special characters', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 384, TERRITORY1: "Côte d'Ivoire", total_sed_load_2020: 1 } },
      ]),
    )

    const results = await fetchAllBoundaryFeatures('country')

    expect(results[0].id).toBe('cote-divoire')
    expect(results[0].label).toBe("Côte d'Ivoire")
  })
})

describe('fetchWatershedIdsForRegion', () => {
  afterEach(() => jest.clearAllMocks())

  const watershedFeatures = [
    { properties: { watershed_id: 1, REALM_ID: 2, COUNTRY_ID: 54 } },
    { properties: { watershed_id: 2, REALM_ID: 2, COUNTRY_ID: 138 } },
    { properties: { watershed_id: 3, REALM_ID: 5, COUNTRY_ID: 54 } },
    { properties: { watershed_id: 4, REALM_ID: 5, COUNTRY_ID: 99 } },
  ]

  it('returns all watershed_ids when no filter is provided', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(watershedFeatures))

    const ids = await fetchWatershedIdsForRegion()

    expect(ids).toEqual([1, 2, 3, 4])
  })

  it('filters by realmId', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(watershedFeatures))

    const ids = await fetchWatershedIdsForRegion(2)

    expect(ids).toEqual([1, 2])
  })

  it('filters by countryId', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(watershedFeatures))

    const ids = await fetchWatershedIdsForRegion(undefined, 54)

    expect(ids).toEqual([1, 3])
  })

  it('filters by both realmId and countryId', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(watershedFeatures))

    const ids = await fetchWatershedIdsForRegion(2, 54)

    expect(ids).toEqual([1])
  })

  it('returns empty array when tile data is absent', async () => {
    mockGetZxy.mockResolvedValue(null)

    const ids = await fetchWatershedIdsForRegion(2)

    expect(ids).toEqual([])
  })

  it('returns empty array on error', async () => {
    mockGetZxy.mockRejectedValue(new Error('network'))

    const ids = await fetchWatershedIdsForRegion(2)

    expect(ids).toEqual([])
  })
})

describe('fetchGlobalBoundaryProperties', () => {
  afterEach(() => jest.clearAllMocks())

  const twoCountries = [
    {
      properties: {
        COUNTRY_ID: 54,
        TERRITORY1: 'Fiji',
        total_area_ha: 1000,
        total_sed_load_2020: 100,
        reef_exposed_2020: 500,
        coralg_exposed_2020: 200,
        seag_exposed_2020: 50,
        Bare_Gr_pct_2020: 10,
        Crop_pct_2020: 20,
      },
    },
    {
      properties: {
        COUNTRY_ID: 138,
        TERRITORY1: 'Solomon Islands',
        total_area_ha: 3000,
        total_sed_load_2020: 300,
        reef_exposed_2020: 1500,
        coralg_exposed_2020: 600,
        seag_exposed_2020: 150,
        Bare_Gr_pct_2020: 30,
        Crop_pct_2020: 40,
      },
    },
  ]

  it('sums absolute values across all countries', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(twoCountries))

    const result = await fetchGlobalBoundaryProperties()

    expect(result?.['total_sed_load_2020']).toBe(400)
    expect(result?.['reef_exposed_2020']).toBe(2000)
    expect(result?.['coralg_exposed_2020']).toBe(800)
    expect(result?.['seag_exposed_2020']).toBe(200)
  })

  it('computes area-weighted average for land-use percentages', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() => makeTile(twoCountries))

    const result = await fetchGlobalBoundaryProperties()

    // Bare_Gr_pct_2020: (10 * 1000 + 30 * 3000) / (1000 + 3000) = 100000 / 4000 = 25
    expect(result?.['Bare_Gr_pct_2020']).toBe(25)
    // Crop_pct_2020: (20 * 1000 + 40 * 3000) / 4000 = 140000 / 4000 = 35
    expect(result?.['Crop_pct_2020']).toBe(35)
  })

  it('returns null when tile data is absent', async () => {
    mockGetZxy.mockResolvedValue(null)

    const result = await fetchGlobalBoundaryProperties()

    expect(result).toBeNull()
  })

  it('returns null on error', async () => {
    mockGetZxy.mockRejectedValue(new Error('network'))

    const result = await fetchGlobalBoundaryProperties()

    expect(result).toBeNull()
  })

  it('skips features with missing total_area_ha when computing weighted averages', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 54, Bare_Gr_pct_2020: 20, total_area_ha: 2000 } },
        { properties: { COUNTRY_ID: 138, Bare_Gr_pct_2020: 40 } }, // no total_area_ha → treated as 0
      ]),
    )

    const result = await fetchGlobalBoundaryProperties()

    // (20 * 2000 + 40 * 0) / (2000 + 0) = 20
    expect(result?.['Bare_Gr_pct_2020']).toBe(20)
  })
})

describe('fetchCountryRegionMap', () => {
  afterEach(() => jest.clearAllMocks())

  it('merges country→realm entries across all 16 z=2 tiles', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    // First tile has Fiji (54→2), second tile has New Caledonia (136→2), rest are empty
    let call = 0
    ;(VectorTile as jest.Mock).mockImplementation(() => {
      call++
      if (call === 1) {
        return makeTile([{ properties: { COUNTRY_ID: 54, REALM_ID: 2 } }])
      }
      if (call === 2) {
        return makeTile([{ properties: { COUNTRY_ID: 136, REALM_ID: 2 } }])
      }
      return makeTile([])
    })

    const result = await fetchCountryRegionMap()

    expect(result[54]).toEqual([2])
    expect(result[136]).toEqual([2])
  })

  it('deduplicates realm IDs when the same country appears in multiple tiles', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([{ properties: { COUNTRY_ID: 54, REALM_ID: 2 } }]),
    )

    const result = await fetchCountryRegionMap()

    expect(result[54]).toEqual([2])
  })

  it('skips a rejected tile and still returns data from the rest', async () => {
    let call = 0
    mockGetZxy.mockImplementation(() => {
      call++
      if (call === 1) {
        return Promise.reject(new Error('network'))
      }
      return Promise.resolve({ data: new ArrayBuffer(0) })
    })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([{ properties: { COUNTRY_ID: 54, REALM_ID: 2 } }]),
    )

    const result = await fetchCountryRegionMap()

    expect(result[54]).toEqual([2])
  })

  it('returns empty map when all tiles return no data', async () => {
    mockGetZxy.mockResolvedValue(null)

    const result = await fetchCountryRegionMap()

    expect(result).toEqual({})
  })

  it('returns empty map on unexpected error', async () => {
    mockGetZxy.mockRejectedValue(new Error('fatal'))

    const result = await fetchCountryRegionMap()

    expect(result).toEqual({})
  })
})
