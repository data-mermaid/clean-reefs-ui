import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { SED_EXPOSURE_STATS_BASE_URL } from '../constants'

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

interface StatsJson {
  index: Record<string, { min: number; max: number }>
}

function buildStatsUrl(year: number, regionType: string | undefined): string {
  const base = `${SED_EXPOSURE_STATS_BASE_URL}/gpw_sediment_exposure_${year}`
  if (regionType === 'country') {
    return `${base}/sediment_exposure_countries_${year}.json`
  }
  if (regionType === 'region') {
    return `${base}/sediment_exposure_regions_${year}.json`
  }
  return `${base}/sediment_exposure_global_${year}.json`
}

function bandKey(regionType: string | undefined, bandId: number | undefined): string {
  // Global json always uses key "1"
  if (regionType === 'country' || regionType === 'region') {
    return String(bandId)
  }
  return '1'
}

async function fetchCdnStats(
  year: number,
  regionType: string | undefined,
  bandId: number | undefined,
  signal: AbortSignal,
): Promise<CachedStats | null> {
  try {
    const url = buildStatsUrl(year, regionType)
    const response = await fetch(url, { signal })
    if (!response.ok) {
      return null
    }
    const data: StatsJson = await response.json()
    const entry = data.index[bandKey(regionType, bandId)]
    if (!entry) {
      return null
    }
    return {
      min: parseFloat(Math.max(0, entry.min).toFixed(4)),
      max: parseFloat(entry.max.toFixed(4)),
    }
  } catch {
    return null
  }
}

const useSedExposureStatistics = (
  selectedRegion: RegionOption,
  latestYear: number,
): RasterStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { regionType, bandId } = selectedRegion
    const cdnCacheKey = `cdn|${latestYear}|${regionType ?? 'global'}|${bandId ?? '1'}`

    const cdnCached = statsCache.get(cdnCacheKey)
    if (cdnCached) {
      setMinValue(cdnCached.min)
      setMaxValue(cdnCached.max)
      setIsLoading(false)
      return undefined
    }

    const controller = new AbortController()
    let cancelled = false
    setIsLoading(true)

    fetchCdnStats(latestYear, regionType, bandId, controller.signal).then((cdnResult) => {
      if (cancelled) {
        return
      }
      if (cdnResult) {
        statsCache.set(cdnCacheKey, cdnResult)
        setMinValue(cdnResult.min)
        setMaxValue(cdnResult.max)
      } else {
        // CDN entry missing — show nothing rather than falling back to the TiTiler stats API,
        // which returns global stats for countries with a mismatched COUNTRY_ID in the COG.
        setMinValue(null)
        setMaxValue(null)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [selectedRegion, latestYear])

  return { minValue, maxValue, isLoading }
}

export default useSedExposureStatistics
