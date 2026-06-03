import { useState, useEffect } from 'react'
import { fetchSedLoadStatistics } from '../utils/titilerUtils'
import { SED_LOAD_COLLECTION_ID } from '../constants'

interface SedLoadStatistics {
  minValue: number | null
  maxValue: number | null
  isLoading: boolean
}

interface CachedStats {
  min: number
  max: number
}

const statsCache = new Map<string, CachedStats>()

const useSedLoadStatistics = (latestYear: number): SedLoadStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cacheKey = `${SED_LOAD_COLLECTION_ID}|${latestYear}`

    const cached = statsCache.get(cacheKey)
    if (cached) {
      setMinValue(cached.min)
      setMaxValue(cached.max)
      setIsLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let cancelled = false

    // Don't reset min/max to null — keep stale values while loading so the layer
    // stays mounted in MapLibre and the tile cache stays warm.
    setIsLoading(true)

    fetchSedLoadStatistics(latestYear, controller.signal).then((result) => {
      if (cancelled) {
        return
      }
      if (result) {
        statsCache.set(cacheKey, result)
        setMinValue(result.min)
        setMaxValue(result.max)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [latestYear])

  return { minValue, maxValue, isLoading }
}

export default useSedLoadStatistics
