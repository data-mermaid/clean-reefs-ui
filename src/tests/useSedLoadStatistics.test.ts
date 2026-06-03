/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useSedLoadStatistics from '../hooks/useSedLoadStatistics'
import * as titilerUtils from '../utils/titilerUtils'

// Unique year values prevent cross-test cache hits (module-level statsCache persists per jest run)
let uid = 1000
const nextYear = () => uid++

describe('useSedLoadStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  it('starts with null values and isLoading true', () => {
    jest.spyOn(titilerUtils, 'fetchSedLoadStatistics').mockResolvedValue({ min: 0, max: 10 })
    const { result } = renderHook(() => useSedLoadStatistics(nextYear()))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('returns min/max and clears loading after a successful fetch', async () => {
    jest.spyOn(titilerUtils, 'fetchSedLoadStatistics').mockResolvedValue({ min: 0, max: 8.9 })
    const { result } = renderHook(() => useSedLoadStatistics(nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBe(0)
    expect(result.current.maxValue).toBe(8.9)
  })

  it('sets isLoading false and keeps null values when API returns null', async () => {
    jest.spyOn(titilerUtils, 'fetchSedLoadStatistics').mockResolvedValue(null)
    const { result } = renderHook(() => useSedLoadStatistics(nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('passes the year to fetchSedLoadStatistics', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchSedLoadStatistics')
      .mockResolvedValue({ min: 0, max: 5 })
    const year = nextYear()
    const { result } = renderHook(() => useSedLoadStatistics(year))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchSpy).toHaveBeenCalledWith(year, expect.any(AbortSignal))
  })

  it('serves a cached result synchronously without re-fetching', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchSedLoadStatistics')
      .mockResolvedValue({ min: 0, max: 6.2 })
    const year = nextYear()

    // First render — populates cache
    const { result: r1, unmount } = renderHook(() => useSedLoadStatistics(year))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    // Second render with same year — should hit cache immediately
    const { result: r2 } = renderHook(() => useSedLoadStatistics(year))
    expect(r2.current.isLoading).toBe(false)
    expect(r2.current.minValue).toBe(0)
    expect(r2.current.maxValue).toBe(6.2)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('re-fetches when latestYear changes', async () => {
    jest.spyOn(titilerUtils, 'fetchSedLoadStatistics').mockResolvedValue({ min: 0, max: 7 })
    let latestYear = nextYear()

    const { result, rerender } = renderHook(() => useSedLoadStatistics(latestYear))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    latestYear = nextYear()
    rerender()
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
