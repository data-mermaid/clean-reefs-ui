import { useState, useEffect } from 'react'
import {
  STAC_API_BASE_URL,
  STAC_API_TIMEOUT,
  SED_EXPOSURE_COLLECTION_ID,
  FALLBACK_AVAILABLE_YEARS,
  FALLBACK_LATEST_YEAR,
} from '../constants'

interface AvailableYears {
  availableYears: number[]
  latestYear: number
  isLoading: boolean
}

interface StacFeature {
  properties: {
    datetime: string
  }
}

interface StacItemsResponse {
  features: StacFeature[]
}

const useAvailableYears = (): AvailableYears => {
  const [availableYears, setAvailableYears] = useState<number[]>(FALLBACK_AVAILABLE_YEARS)
  const [latestYear, setLatestYear] = useState<number>(FALLBACK_LATEST_YEAR)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = true
    const timeoutId = setTimeout(() => controller.abort(), STAC_API_TIMEOUT)

    fetch(`${STAC_API_BASE_URL}/collections/${SED_EXPOSURE_COLLECTION_ID}/items`, {
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId)
        if (!res.ok) {
          throw new Error()
        }
        return res.json() as Promise<StacItemsResponse>
      })
      .then((data) => {
        if (!cancelled) {
          return
        }
        const years = [
          ...new Set(
            data.features
              .map((feature) => {
                const datetime = feature.properties?.datetime
                if (typeof datetime !== 'string' || datetime.trim() === '') {
                  return null
                }
                const year = new Date(datetime).getUTCFullYear()
                return Number.isFinite(year) ? year : null
              })
              .filter((year): year is number => year !== null),
          ),
        ].sort((yearA, yearB) => yearB - yearA)

        if (years.length > 0) {
          setAvailableYears(years)
          setLatestYear(years[0])
        }
        setIsLoading(false)
      })
      .catch(() => {
        clearTimeout(timeoutId)
        if (cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [])

  return { availableYears, latestYear, isLoading }
}

export default useAvailableYears
