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
    it('returns defaultYear (2020) for null input', () => {
      expect(getValidYear(null)).toBe(2020)
    })

    it('returns defaultYear for non-numeric string', () => {
      expect(getValidYear('not-a-year')).toBe(2020)
    })

    it('returns defaultYear for a number not in availableYears', () => {
      expect(getValidYear('1999')).toBe(2020)
    })

    it('returns defaultYear for a number outside the available range', () => {
      expect(getValidYear('2025')).toBe(2020)
    })

    it('returns parsed year when it is in availableYears', () => {
      expect(getValidYear('2020')).toBe(2020)
    })

    it('returns parsed year for each available year', () => {
      expect(getValidYear('2015')).toBe(2015)
      expect(getValidYear('2010')).toBe(2010)
      expect(getValidYear('2005')).toBe(2005)
      expect(getValidYear('2000')).toBe(2000)
    })
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
    it('returns { lat: null, lng: null } when both are null', () => {
      expect(getValidLatLng(null, null)).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lat is null', () => {
      expect(getValidLatLng(null, '100')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lng is null', () => {
      expect(getValidLatLng('45', null)).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lat is NaN', () => {
      expect(getValidLatLng('not-a-number', '100')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lng is NaN', () => {
      expect(getValidLatLng('45', 'not-a-number')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lat is below -90', () => {
      expect(getValidLatLng('-91', '100')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lat is above 90', () => {
      expect(getValidLatLng('91', '100')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lng is below -180', () => {
      expect(getValidLatLng('45', '-181')).toEqual({ lat: null, lng: null })
    })

    it('returns { lat: null, lng: null } when lng is above 180', () => {
      expect(getValidLatLng('45', '181')).toEqual({ lat: null, lng: null })
    })

    it('returns parsed floats when both lat and lng are valid', () => {
      expect(getValidLatLng('45.5', '100.25')).toEqual({ lat: 45.5, lng: 100.25 })
    })

    it('accepts boundary lat values (-90 and 90)', () => {
      expect(getValidLatLng('-90', '0')).toEqual({ lat: -90, lng: 0 })
      expect(getValidLatLng('90', '0')).toEqual({ lat: 90, lng: 0 })
    })

    it('accepts boundary lng values (-180 and 180)', () => {
      expect(getValidLatLng('0', '-180')).toEqual({ lat: 0, lng: -180 })
      expect(getValidLatLng('0', '180')).toEqual({ lat: 0, lng: 180 })
    })

    it('accepts negative valid coordinates', () => {
      expect(getValidLatLng('-17.5', '-178.5')).toEqual({ lat: -17.5, lng: -178.5 })
    })
  })

  describe('getValidDispersalPoint', () => {
    it('returns null for null input', () => {
      expect(getValidDispersalPoint(null)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(getValidDispersalPoint('')).toBeNull()
    })

    it('returns null if not two comma-separated values', () => {
      expect(getValidDispersalPoint('45')).toBeNull()
    })

    it('returns null for more than two comma-separated values', () => {
      expect(getValidDispersalPoint('45,100,200')).toBeNull()
    })

    it('returns null if lat is invalid', () => {
      expect(getValidDispersalPoint('not-a-number,100')).toBeNull()
    })

    it('returns null if lng is invalid', () => {
      expect(getValidDispersalPoint('45,not-a-number')).toBeNull()
    })

    it('returns null if lat is out of range', () => {
      expect(getValidDispersalPoint('91,100')).toBeNull()
    })

    it('returns null if lng is out of range', () => {
      expect(getValidDispersalPoint('45,181')).toBeNull()
    })

    it('returns { lat, lng } for valid "lat,lng" input', () => {
      expect(getValidDispersalPoint('45.5,100.25')).toEqual({ lat: 45.5, lng: 100.25 })
    })

    it('returns { lat, lng } for negative valid coordinates', () => {
      expect(getValidDispersalPoint('-17.5,-178.5')).toEqual({ lat: -17.5, lng: -178.5 })
    })

    it('returns { lat, lng } for boundary coordinate values', () => {
      expect(getValidDispersalPoint('90,180')).toEqual({ lat: 90, lng: 180 })
      expect(getValidDispersalPoint('-90,-180')).toEqual({ lat: -90, lng: -180 })
    })
  })
})
