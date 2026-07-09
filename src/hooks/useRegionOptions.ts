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

// countryRegionMap uses numeric COUNTRY_ID → [REALM_ID] from the watershed PMTiles.
// mergedRegions is used to resolve REALM_ID bandIds back to region string IDs.
// Falls back to the hardcoded COUNTRY_REGION_MAP (by slug) for countries not in the watershed data.
function enrichCountries(
  countries: RegionOption[],
  countryRegionMap: Record<number, number[]>,
  mergedRegions: RegionOption[],
): RegionOption[] {
  const validRegionIds = new Set(mergedRegions.map((r) => r.id))
  return countries.map((c) => {
    if (c.bandId !== undefined && countryRegionMap[c.bandId]?.length) {
      const parentRegionIds = countryRegionMap[c.bandId]
        .map((realmId) => mergedRegions.find((r) => r.bandId === realmId)?.id)
        .filter((id): id is string => id !== undefined)
      if (parentRegionIds.length > 0) {
        return { ...c, parentRegionIds }
      }
    }
    const fallbackIds = (COUNTRY_REGION_MAP[c.id] ?? []).filter((id) => validRegionIds.has(id))
    return { ...c, parentRegionIds: fallbackIds }
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
      const mergedRegions = mergeRegions(regions)
      const enriched = enrichCountries(countries, countryRegionMap, mergedRegions)
      setRegionOptions([
        defaultGlobalRegionOption,
        ...mergedRegions,
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
