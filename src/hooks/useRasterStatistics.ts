import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import {
  buildSedDispersalExpression,
  buildSedDispersalItemId,
  fetchSedDispersalStatistics,
} from '../utils/titilerUtils'

interface RasterStatistics {
  minValue: number | null
  maxValue: number | null
  isLoading: boolean
}

interface CachedStats {
  min: number
  max: number
}

const statsCache = new Map<string, CachedStats>()

const useRasterStatistics = (
  collectionId: string,
  selectedRegion: RegionOption,
  latestYear: number,
): RasterStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { expression, assetBidx } = buildSedDispersalExpression(selectedRegion)
    const itemId = buildSedDispersalItemId(latestYear)
    const cacheKey = `${collectionId}|${itemId}|${expression ?? 'global'}`

    const cached = statsCache.get(cacheKey)
    if (cached) {
      setMinValue(cached.min)
      setMaxValue(cached.max)
      setIsLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let cancelled = false

    // Keep stale min/max while reloading — avoids unmounting the tile layer and clearing the tile cache
    setIsLoading(true)

    fetchSedDispersalStatistics(
      collectionId,
      itemId,
      expression,
      assetBidx,
      controller.signal,
    ).then((result) => {
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
  }, [collectionId, selectedRegion, latestYear])

  return { minValue, maxValue, isLoading }
}

export default useRasterStatistics
