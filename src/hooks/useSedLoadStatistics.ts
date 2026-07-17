import { useState, useEffect } from 'react'
import { fetchSedLoadStatistics } from '../utils/titilerUtils'
import { SED_LOAD_COLLECTION_ID } from '../constants'
import { RegionOption } from '../types/RegionDataTypes'

interface SedLoadStatistics {
  minValue: number | null
  maxValue: number | null
  p98Value: number | null
  isLoading: boolean
}

interface CachedStats {
  min: number
  max: number
  p98: number | null
}

const statsCache = new Map<string, CachedStats>()

const useSedLoadStatistics = (latestYear: number, selectedRegion: RegionOption): SedLoadStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [p98Value, setP98Value] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cacheKey = `${SED_LOAD_COLLECTION_ID}|${latestYear}|${selectedRegion.id}`

    const cached = statsCache.get(cacheKey)
    if (cached) {
      setMinValue(cached.min)
      setMaxValue(cached.max)
      setP98Value(cached.p98)
      setIsLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let cancelled = false

    // Don't reset min/max to null — keep stale values while loading so the layer
    // stays mounted in MapLibre and the tile cache stays warm.
    setIsLoading(true)

    fetchSedLoadStatistics(latestYear, selectedRegion, controller.signal).then((result) => {
      if (cancelled) {
        return
      }
      if (result) {
        statsCache.set(cacheKey, result)
        setMinValue(result.min)
        setMaxValue(result.max)
        setP98Value(result.p98)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [latestYear, selectedRegion])

  return { minValue, maxValue, p98Value, isLoading }
}

export default useSedLoadStatistics
