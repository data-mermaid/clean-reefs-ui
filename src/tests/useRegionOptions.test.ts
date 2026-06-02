/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useRegionOptions from '../hooks/useRegionOptions'
import { fallbackRegionOptions } from '../data/regionData'

jest.mock('../utils/pmtilesUtils', () => ({
  fetchAllBoundaryFeatures: jest.fn(),
}))

jest.mock('../data/regionData', () => ({
  defaultGlobalRegionOption: { id: 'global', regionType: 'global', label: 'Global' },
  fallbackRegionOptions: [
    { id: 'global', regionType: 'global', label: 'Global' },
    { id: 'fiji', regionType: 'country', label: 'Fiji', bandId: 54 },
  ],
}))

import { fetchAllBoundaryFeatures } from '../utils/pmtilesUtils'

const mockFetch = fetchAllBoundaryFeatures as jest.Mock

describe('useRegionOptions', () => {
  afterEach(() => jest.clearAllMocks())

  it('starts with fallbackRegionOptions and loading true', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useRegionOptions())
    expect(result.current.loading).toBe(true)
    expect(result.current.regionOptions).toEqual(fallbackRegionOptions)
  })

  it('merges dynamic results with fixed entries in order', async () => {
    mockFetch.mockImplementation((type: string) => {
      if (type === 'region') {
        return Promise.resolve([
          {
            id: 'central-indo-pacific',
            regionType: 'region',
            label: 'Central Indo-Pacific',
            bandId: 2,
          },
        ])
      }
      return Promise.resolve([{ id: 'fiji', regionType: 'country', label: 'Fiji', bandId: 54 }])
    })

    const { result } = renderHook(() => useRegionOptions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ids = result.current.regionOptions.map((o) => o.id)
    expect(ids[0]).toBe('global')
    expect(ids).toContain('central-indo-pacific')
    expect(ids).toContain('fiji')
    expect(ids[ids.length - 2]).toBe('watershed')
    expect(ids[ids.length - 1]).toBe('plume')
  })

  it('keeps fallbackRegionOptions and sets loading false on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useRegionOptions())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.regionOptions).toEqual(fallbackRegionOptions)
  })
})
