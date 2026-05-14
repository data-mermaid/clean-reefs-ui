/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useSedExportStatistics from '../hooks/useSedExportStatistics'
import * as titilerUtils from '../utils/titilerUtils'

// Unique year values prevent cross-test cache hits (module-level statsCache persists per jest run)
let uid = 1000
const nextYear = () => uid++

describe('useSedExportStatistics', () => {
  afterEach(() => jest.restoreAllMocks())

  it('starts with null values and isLoading true', () => {
    jest.spyOn(titilerUtils, 'fetchSedExportStatistics').mockResolvedValue({ min: 0, max: 10 })
    const { result } = renderHook(() => useSedExportStatistics(nextYear()))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('returns min/max and clears loading after a successful fetch', async () => {
    jest.spyOn(titilerUtils, 'fetchSedExportStatistics').mockResolvedValue({ min: 0, max: 8.9 })
    const { result } = renderHook(() => useSedExportStatistics(nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBe(0)
    expect(result.current.maxValue).toBe(8.9)
  })

  it('sets isLoading false and keeps null values when API returns null', async () => {
    jest.spyOn(titilerUtils, 'fetchSedExportStatistics').mockResolvedValue(null)
    const { result } = renderHook(() => useSedExportStatistics(nextYear()))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.minValue).toBeNull()
    expect(result.current.maxValue).toBeNull()
  })

  it('passes the year to fetchSedExportStatistics', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchSedExportStatistics')
      .mockResolvedValue({ min: 0, max: 5 })
    const year = nextYear()
    const { result } = renderHook(() => useSedExportStatistics(year))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchSpy).toHaveBeenCalledWith(year, expect.any(AbortSignal))
  })

  it('serves a cached result synchronously without re-fetching', async () => {
    const fetchSpy = jest
      .spyOn(titilerUtils, 'fetchSedExportStatistics')
      .mockResolvedValue({ min: 0, max: 6.2 })
    const year = nextYear()

    // First render — populates cache
    const { result: r1, unmount } = renderHook(() => useSedExportStatistics(year))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    // Second render with same year — should hit cache immediately
    const { result: r2 } = renderHook(() => useSedExportStatistics(year))
    expect(r2.current.isLoading).toBe(false)
    expect(r2.current.minValue).toBe(0)
    expect(r2.current.maxValue).toBe(6.2)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('resets to loading and re-fetches when year changes', async () => {
    jest.spyOn(titilerUtils, 'fetchSedExportStatistics').mockResolvedValue({ min: 0, max: 7 })
    let year = nextYear()

    const { result, rerender } = renderHook(() => useSedExportStatistics(year))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    year = nextYear()
    rerender()
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})
