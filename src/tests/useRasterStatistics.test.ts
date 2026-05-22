/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useRasterStatistics from '../hooks/useRasterStatistics'
import * as titilerUtils from '../utils/titilerUtils'
import { RegionOption } from '../types/RegionDataTypes'
import { SED_DISPERSAL_STATS_YEAR } from '../constants'

// Avoid importing LngLat directly — maplibre-gl uses browser APIs unavailable in jsdom
const makeRegion = (overrides: Partial<RegionOption> = {}): RegionOption =>
  ({
    id: 'test',
    regionType: 'global',
    label: 'Global',
    centerCoord: { lng: 0, lat: 0 },
    zoomLevel: 2,
    ...overrides,
  }) as RegionOption

// Unique collection IDs prevent cross-test cache hits within the same jest run
let uid = 0
const nextCollection = () => `test_collection_${uid++}`

describe('useRasterStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  it('starts with null values and isLoading true', () => {
    jest.spyOn(titilerUtils, 'fetchStatistics').mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useRasterStatistics(nextCollection(), makeRegion()))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('returns min/max and clears loading after a successful fetch', async () => {
    jest.spyOn(titilerUtils, 'fetchStatistics').mockResolvedValue({ min: 1.5, max: 99.9 })
    const { result } = renderHook(() => useRasterStatistics(nextCollection(), makeRegion()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBe(1.5)
    expect(result.current.maxValue).toBe(99.9)
  })

  it('sets isLoading false and keeps null values when API returns null', async () => {
    jest.spyOn(titilerUtils, 'fetchStatistics').mockResolvedValue(null)
    const { result } = renderHook(() => useRasterStatistics(nextCollection(), makeRegion()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('passes expression and assetBidx derived from region to fetchStatistics', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchStatistics')
      .mockResolvedValue({ min: 0, max: 10 })
    const region = makeRegion({ regionType: 'country', bandId: 42 })
    const { result } = renderHook(() => useRasterStatistics(nextCollection(), region))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'where((cog_b8==42), cog_b1, 0)',
      'cog|1,8',
      expect.any(AbortSignal),
    )
  })

  it('always fetches stats using the latest stats year regardless of selected year', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchStatistics')
      .mockResolvedValue({ min: 0, max: 10 })
    const collectionId = nextCollection()
    const { result } = renderHook(() => useRasterStatistics(collectionId, makeRegion()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchSpy.mock.calls[0][1]).toBe(`gpw_sediment_exposure_${SED_DISPERSAL_STATS_YEAR}`)
  })

  it('serves a cached result synchronously without re-fetching', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchStatistics')
      .mockResolvedValue({ min: 5, max: 50 })
    const collectionId = nextCollection()
    const region = makeRegion()

    // First render — populates cache
    const { result: r1, unmount } = renderHook(() => useRasterStatistics(collectionId, region))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    // Second render with same params — should hit cache immediately (isLoading stays false)
    const { result: r2 } = renderHook(() => useRasterStatistics(collectionId, region))
    expect(r2.current.isLoading).toBe(false)
    expect(r2.current.minValue).toBe(5)
    expect(r2.current.maxValue).toBe(50)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('does not re-fetch when year changes', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchStatistics')
      .mockResolvedValue({ min: 10, max: 200 })
    const collectionId = nextCollection()
    const region = makeRegion()

    // Render hook — year is not a parameter, so we simulate a parent re-render with a new year
    // by re-rendering with no argument change (hook has no year param)
    const { result, rerender } = renderHook(() => useRasterStatistics(collectionId, region))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender()
    // Still not loading — no re-fetch triggered
    expect(result.current.isLoading).toBe(false)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
