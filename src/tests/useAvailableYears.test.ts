/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import useAvailableYears from '../hooks/useAvailableYears'
import { FALLBACK_AVAILABLE_YEARS, FALLBACK_DEFAULT_YEAR } from '../data/mapData'

const makeStacResponse = (years: number[]) => ({
  features: years.map((y) => ({
    id: `gpw_sediment_exposure_${y}`,
    properties: { datetime: `${y}-01-01T00:00:00Z` },
  })),
})

// jsdom doesn't include fetch — stub it so jest.spyOn can target it
const originalFetch = global.fetch
beforeAll(() => {
  global.fetch = jest.fn()
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('useAvailableYears', () => {
  afterEach(() => jest.restoreAllMocks())

  it('starts with fallback values and isLoading true', () => {
    jest.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useAvailableYears())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.availableYears).toEqual(FALLBACK_AVAILABLE_YEARS)
    expect(result.current.defaultYear).toBe(FALLBACK_DEFAULT_YEAR)
  })

  it('returns fetched years sorted descending and sets isLoading false on success', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeStacResponse([2000, 2010, 2020, 2005, 2015])),
    } as Response)

    const { result } = renderHook(() => useAvailableYears())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.availableYears).toEqual([2020, 2015, 2010, 2005, 2000])
    expect(result.current.defaultYear).toBe(2020)
  })

  it('falls back to hardcoded values on network error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useAvailableYears())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.availableYears).toEqual(FALLBACK_AVAILABLE_YEARS)
    expect(result.current.defaultYear).toBe(FALLBACK_DEFAULT_YEAR)
  })

  it('falls back to hardcoded values on non-ok response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
    } as Response)

    const { result } = renderHook(() => useAvailableYears())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.availableYears).toEqual(FALLBACK_AVAILABLE_YEARS)
    expect(result.current.defaultYear).toBe(FALLBACK_DEFAULT_YEAR)
  })

  it('does not re-fetch when re-rendered without argument changes', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeStacResponse([2020, 2015, 2010, 2005, 2000])),
    } as Response)

    const { rerender, result } = renderHook(() => useAvailableYears())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Capture call count after initial load (may be >1 in React Strict Mode)
    const callCountAfterMount = fetchSpy.mock.calls.length
    expect(callCountAfterMount).toBeGreaterThanOrEqual(1)

    rerender()
    // Re-render must not trigger an additional fetch
    expect(fetchSpy.mock.calls.length).toBe(callCountAfterMount)
  })
})
