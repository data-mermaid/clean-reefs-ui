import { useState, useEffect } from 'react'
import { STAC_API_BASE_URL, STAC_API_TIMEOUT, SED_DISPERSAL_COLLECTION_ID } from '../constants'
import { FALLBACK_AVAILABLE_YEARS, FALLBACK_DEFAULT_YEAR } from '../data/mapData'

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
  const [latestYear, setLatestYear] = useState<number>(FALLBACK_DEFAULT_YEAR)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), STAC_API_TIMEOUT)

    fetch(`${STAC_API_BASE_URL}/collections/${SED_DISPERSAL_COLLECTION_ID}/items`, {
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
        const years = data.features
          .map((f) => new Date(f.properties.datetime).getUTCFullYear())
          .filter((y) => !isNaN(y))
          .sort((a, b) => b - a)

        if (years.length > 0) {
          setAvailableYears(years)
          setLatestYear(years[0])
        }
        setIsLoading(false)
      })
      .catch(() => {
        clearTimeout(timeoutId)
        setIsLoading(false)
      })

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [])

  return { availableYears, latestYear, isLoading }
}

export default useAvailableYears
