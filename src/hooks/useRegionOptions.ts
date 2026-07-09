import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures, fetchCountryRegionMap } from '../utils/pmtilesUtils'
import { KNOWN_REGIONS, COUNTRY_REGION_MAP } from '../data/coralReefRegions'
import {
  defaultGlobalRegionOption,
  fallbackRegionOptions,
  watershedAndDispersalRegions,
} from '../data/regionData'

interface RegionOptionsResult {
  regionOptions: RegionOption[]
  loading: boolean
}

// Ensure all 5 coral reef regions are present: use the API version (with bandId + extent)
// when available, otherwise fall back to a minimal entry from KNOWN_REGIONS so that
// COUNTRY_REGION_MAP parent lookups always resolve.
function mergeRegions(apiRegions: RegionOption[]): RegionOption[] {
  return KNOWN_REGIONS.map((knownRegion) => {
    const fallback: RegionOption = {
      id: knownRegion.id,
      regionType: 'region',
      label: knownRegion.label,
    }
    return apiRegions.find((r) => r.id === knownRegion.id) ?? fallback
  })
}

function enrichCountries(
  countries: RegionOption[],
  countryRegionMap: Record<string, string[]>,
  validRegionIds: Set<string>,
): RegionOption[] {
  return countries.map((c) => {
    const rawIds = countryRegionMap[c.id] ?? COUNTRY_REGION_MAP[c.id] ?? []
    const parentRegionIds = rawIds.filter((id) => validRegionIds.has(id))
    return { ...c, parentRegionIds }
  })
}

const useRegionOptions = (): RegionOptionsResult => {
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>(fallbackRegionOptions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchAllBoundaryFeatures('region'),
      fetchAllBoundaryFeatures('country'),
      fetchCountryRegionMap(),
    ]).then(([regions, countries, countryRegionMap]) => {
      if (cancelled) {
        return
      }
      if (regions.length === 0 && countries.length === 0) {
        setLoading(false)
        return
      }
      const validRegionIds = new Set(regions.map((r) => r.id))
      const enriched = enrichCountries(countries, countryRegionMap, validRegionIds)
      setRegionOptions([
        defaultGlobalRegionOption,
        ...mergeRegions(regions),
        ...enriched,
        ...watershedAndDispersalRegions,
      ])
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { regionOptions, loading }
}

export default useRegionOptions
