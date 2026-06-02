import { fetchAllBoundaryFeatures } from '../utils/pmtilesUtils'

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

  it('returns only features where reef_exposed_2020 is present', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 54, TERRITORY1: 'Fiji', reef_exposed_2020: 1234 } },
        { properties: { COUNTRY_ID: 999, TERRITORY1: 'NoReef', reef_exposed_2020: null } },
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
      makeTile([{ properties: { COUNTRY_ID: 54, TERRITORY1: 'Fiji', reef_exposed_2020: 1234 } }]),
    )

    const results = await fetchAllBoundaryFeatures('country')

    expect(results[0].extent).toEqual([174.5889, -21.7111, 181.7839, -12.4753])
  })

  it('omits extent when label is not in static map', async () => {
    mockGetZxy.mockResolvedValue({ data: new ArrayBuffer(0) })
    ;(VectorTile as jest.Mock).mockImplementation(() =>
      makeTile([
        { properties: { COUNTRY_ID: 999, TERRITORY1: 'Unknown Island', reef_exposed_2020: 1 } },
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
            reef_exposed_2020: 5678,
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
})
