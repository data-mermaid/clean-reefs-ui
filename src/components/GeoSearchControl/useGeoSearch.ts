import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMapStore } from '../../stores/mapStore'

const FLY_TO_ZOOM = 8
const LAT_LON_REGEX = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 3
const DEBOUNCE_MS = 300

export interface NominatimResult {
  osm_id: number
  display_name: string
  lat: string
  lon: string
  addresstype: string
}

export function useGeoSearch() {
  const { t } = useTranslation()
  const mapRef = useMapStore((s) => s.mapReference)
  const closeGeoSearch = useMapStore((s) => s.closeGeoSearch)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH || LAT_LON_REGEX.test(trimmed)) {
      abortRef.current?.abort()
      setResults([])
      setError('')
      setActiveIndex(-1)
      setIsLoading(false)
      return () => {}
    }

    debounceRef.current = setTimeout(() => {
      void fetchResults(trimmed)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
    // fetchResults is defined below — intentionally omitted from deps to avoid stale closure loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const fetchResults = async (trimmed: string) => {
    const requestId = ++requestIdRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=${MAX_RESULTS}`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'GlobalPollutionWatch/1.0 (https://globalpollutiwatch.org)',
          },
        },
      )
      const data: NominatimResult[] = await res.json()
      if (requestId !== requestIdRef.current) {
        return
      }
      setResults(data)
      setActiveIndex(-1)
      if (!data.length) {
        setError(t('geo_lookup.no_results'))
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return
      }
      setError(t('geo_lookup.search_failed'))
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }

  const flyToCoords = (lng: number, lat: number) => {
    mapRef?.getMap()?.flyTo({ center: [lng, lat], zoom: FLY_TO_ZOOM })
  }

  const handleClose = () => {
    setQuery('')
    setResults([])
    setError('')
    setActiveIndex(-1)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    abortRef.current?.abort()
    closeGeoSearch()
  }

  const handleSelect = (result: NominatimResult) => {
    flyToCoords(parseFloat(result.lon), parseFloat(result.lat))
    handleClose()
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClose()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, -1))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex])
        return
      }

      const trimmed = query.trim()
      const latLonMatch = trimmed.match(LAT_LON_REGEX)
      if (latLonMatch) {
        const lat = parseFloat(latLonMatch[1])
        const lon = parseFloat(latLonMatch[2])
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          flyToCoords(lon, lat)
          handleClose()
        }
      }
    }
  }

  return {
    query,
    results,
    isLoading,
    error,
    activeIndex,
    handleQueryChange,
    handleSelect,
    handleClose,
    handleKeyDown,
  }
}
