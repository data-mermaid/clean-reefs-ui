import {
  getValidRegion,
  getValidWatershed,
  getValidYear,
  getValidLayers,
  getValidZoom,
  getValidLatLng,
  getValidDispersalPoint,
} from '../utils/routeUtils'

jest.mock('../data/mapData', () => ({
  availableYears: [2020, 2015, 2010, 2005, 2000],
  defaultYear: 2020,
  defaultLayersToShow: ['sed_export', 'sed_dispersal', 'plumes'],
  urlControlledLayerIds: ['none', 'sed_export', 'lulc', 'sed_dispersal', 'plumes'],
}))

jest.mock('../data/regionData', () => ({
  defaultGlobalRegionOption: { id: 'global', regionType: 'global', label: 'Global' },
  regionOptions: [
    { id: 'global', regionType: 'global', label: 'Global' },
    { id: 'fiji', regionType: 'country', label: 'Fiji' },
    { id: 'solomon-islands', regionType: 'country', label: 'Solomon Islands' },
  ],
}))

describe('route parameter utilities', () => {
  describe('getValidRegion', () => {
    it('returns defaultGlobalRegionOption when param is null', () => {
      expect(getValidRegion(null)).toEqual({ id: 'global', regionType: 'global', label: 'Global' })
    })

    it('returns defaultGlobalRegionOption when param does not match any region id', () => {
      expect(getValidRegion('unknown-region')).toEqual({
        id: 'global',
        regionType: 'global',
        label: 'Global',
      })
    })

    it('returns matched regionOption when id matches', () => {
      expect(getValidRegion('fiji')).toEqual({ id: 'fiji', regionType: 'country', label: 'Fiji' })
    })

    it('returns defaultGlobalRegionOption for empty string', () => {
      expect(getValidRegion('')).toEqual({ id: 'global', regionType: 'global', label: 'Global' })
    })
  })

  describe('getValidWatershed', () => {
    it('returns null for null input', () => {
      expect(getValidWatershed(null)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(getValidWatershed('')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      expect(getValidWatershed('   ')).toBeNull()
    })

    it('trims leading and trailing whitespace from valid input', () => {
      expect(getValidWatershed('  watershed-123  ')).toBe('watershed-123')
    })
  })

  describe('getValidYear', () => {
    it.each([null, 'not-a-year', '1999', '2025'] as const)(
      'returns defaultYear (2020) for invalid input (%s)',
      (input) => {
        expect(getValidYear(input)).toBe(2020)
      },
    )

    it.each(['2020', '2015', '2010', '2005', '2000'] as const)(
      'returns parsed year for each available year (%s)',
      (year) => {
        expect(getValidYear(year)).toBe(Number(year))
      },
    )
  })

  describe('getValidLayers', () => {
    it('returns defaultLayersToShow for null input', () => {
      expect(getValidLayers(null)).toEqual(['sed_export', 'sed_dispersal', 'plumes'])
    })

    it('returns empty array for "none"', () => {
      expect(getValidLayers('none')).toEqual([])
    })

    it('returns parsed layer array for valid comma-separated known layer ids', () => {
      expect(getValidLayers('sed_export,lulc')).toEqual(['sed_export', 'lulc'])
    })

    it('returns a single valid layer', () => {
      expect(getValidLayers('plumes')).toEqual(['plumes'])
    })

    it('returns defaultLayersToShow if any layer id is unknown', () => {
      expect(getValidLayers('sed_export,unknown_layer')).toEqual([
        'sed_export',
        'sed_dispersal',
        'plumes',
      ])
    })

    it('returns defaultLayersToShow for empty string', () => {
      expect(getValidLayers('')).toEqual(['sed_export', 'sed_dispersal', 'plumes'])
    })

    it('returns defaultLayersToShow if all layer ids are unknown', () => {
      expect(getValidLayers('foo,bar')).toEqual(['sed_export', 'sed_dispersal', 'plumes'])
    })
  })

  describe('getValidZoom', () => {
    it('returns null for null input', () => {
      expect(getValidZoom(null)).toBeNull()
    })

    it('returns null for non-numeric string', () => {
      expect(getValidZoom('not-a-zoom')).toBeNull()
    })

    it('returns null for zoom below 0', () => {
      expect(getValidZoom('-1')).toBeNull()
    })

    it('returns null for zoom above 24', () => {
      expect(getValidZoom('25')).toBeNull()
    })

    it('returns parsed float for minimum valid zoom (0)', () => {
      expect(getValidZoom('0')).toBe(0)
    })

    it('returns parsed float for maximum valid zoom (24)', () => {
      expect(getValidZoom('24')).toBe(24)
    })

    it('returns parsed float for a mid-range zoom value', () => {
      expect(getValidZoom('10.5')).toBe(10.5)
    })

    it('returns null for empty string', () => {
      expect(getValidZoom('')).toBeNull()
    })
  })

  describe('getValidLatLng', () => {
    it.each([
      [null, null],
      [null, '100'],
      ['45', null],
      ['not-a-number', '100'],
      ['45', 'not-a-number'],
      ['-91', '100'],
      ['91', '100'],
      ['45', '-181'],
      ['45', '181'],
    ] as const)('returns null/null for invalid input (%s, %s)', (lat, lng) => {
      expect(getValidLatLng(lat, lng)).toEqual({ lat: null, lng: null })
    })

    it.each([
      ['45.5', '100.25', 45.5, 100.25],
      ['-90', '0', -90, 0],
      ['90', '0', 90, 0],
      ['0', '-180', 0, -180],
      ['0', '180', 0, 180],
      ['-17.5', '-178.5', -17.5, -178.5],
    ] as const)(
      'returns parsed floats for valid input (%s, %s)',
      (lat, lng, expectedLat, expectedLng) => {
        expect(getValidLatLng(lat, lng)).toEqual({ lat: expectedLat, lng: expectedLng })
      },
    )
  })

  describe('getValidDispersalPoint', () => {
    it.each([null, '', '   '] as const)('returns null for falsy input (%s)', (input) => {
      expect(getValidDispersalPoint(input)).toBeNull()
    })

    it.each(['45', '45,100,200'] as const)(
      'returns null for wrong number of parts (%s)',
      (input) => {
        expect(getValidDispersalPoint(input)).toBeNull()
      },
    )

    it('returns { lat, lng } for a valid comma-separated pair', () => {
      expect(getValidDispersalPoint('45.5,100.25')).toEqual({ lat: 45.5, lng: 100.25 })
    })
  })
})
