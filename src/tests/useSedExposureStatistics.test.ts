/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useSedExposureStatistics from '../hooks/useSedExposureStatistics'
import { RegionOption } from '../types/RegionDataTypes'

const makeRegion = (overrides: Partial<RegionOption> = {}): RegionOption =>
  ({
    id: 'test',
    regionType: 'global',
    label: 'Global',
    ...overrides,
  }) as RegionOption

const mockFetch = jest.fn()
global.fetch = mockFetch

const makeOkResponse = (data: object) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) } as Response)

// Use unique years per test to avoid cross-test cache hits (statsCache is module-level).
let yearSeed = 3000
const nextYear = () => yearSeed++

describe('useSedExposureStatistics', () => {
  afterEach(() => mockFetch.mockReset())

  it('starts with null values and isLoading true', () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '1': { min: 0, max: 100 } } }))
    const { result } = renderHook(() => useSedExposureStatistics(makeRegion(), nextYear()))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('returns min/max and clears loading after a successful fetch', async () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '1': { min: 1.5, max: 99.9 } } }))
    const { result } = renderHook(() => useSedExposureStatistics(makeRegion(), nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBe(1.5)
    expect(result.current.maxValue).toBe(99.9)
  })

  it('sets isLoading false and keeps null values when CDN returns a non-ok response', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: false } as Response))
    const { result } = renderHook(() => useSedExposureStatistics(makeRegion(), nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('fetches the country stats URL and uses bandId as the index key', async () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '42': { min: 2.0, max: 88.8 } } }))
    const region = makeRegion({ regionType: 'country', bandId: 42 })
    const { result } = renderHook(() => useSedExposureStatistics(region, nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(String(mockFetch.mock.calls[0][0])).toContain('sediment_exposure_countries_')
    expect(result.current.minValue).toBe(2)
    expect(result.current.maxValue).toBe(88.8)
  })

  it('includes the provided year in the CDN URL', async () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '1': { min: 0, max: 10 } } }))
    const year = nextYear()
    const { result } = renderHook(() => useSedExposureStatistics(makeRegion(), year))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(String(mockFetch.mock.calls[0][0])).toContain(`gpw_sediment_exposure_${year}`)
  })

  it('serves a cached result synchronously without re-fetching', async () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '1': { min: 5, max: 50 } } }))
    const region = makeRegion()
    const year = nextYear()

    // First render — populates cache
    const { result: r1, unmount } = renderHook(() => useSedExposureStatistics(region, year))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    // Second render with same params — should hit cache immediately
    const { result: r2 } = renderHook(() => useSedExposureStatistics(region, year))
    expect(r2.current.isLoading).toBe(false)
    expect(r2.current.minValue).toBe(5)
    expect(r2.current.maxValue).toBe(50)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('resets to loading and re-fetches when year changes', async () => {
    mockFetch.mockReturnValue(makeOkResponse({ index: { '1': { min: 10, max: 200 } } }))
    const region = makeRegion()
    let latestYear = nextYear()

    const { result, rerender } = renderHook(() => useSedExposureStatistics(region, latestYear))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    latestYear = nextYear()
    rerender()
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
