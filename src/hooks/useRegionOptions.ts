import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures, fetchCountryRegionMap } from '../utils/pmtilesUtils'
import { KNOWN_REGIONS } from '../data/coralReefRegions'
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

// Some countries appear under multiple COUNTRY_IDs in the boundary PMTiles (e.g. Papua New Guinea
// has both 125 and 126). The watershed PMTiles uses one specific ID. This function deduplicates
// by slug, preferring the bandId that is present in countryRegionMap (i.e. known to the watershed
// data). If neither or both are in the watershed, the first occurrence wins.
function deduplicateCountries(
  countries: RegionOption[],
  countryRegionMap: Record<number, number[]>,
): RegionOption[] {
  const bySlug = new Map<string, RegionOption>()
  for (const c of countries) {
    const existing = bySlug.get(c.id)
    if (!existing) {
      bySlug.set(c.id, c)
      continue
    }
    const existingInWatershed = existing.bandId !== undefined && countryRegionMap[existing.bandId] !== undefined
    const currentInWatershed = c.bandId !== undefined && countryRegionMap[c.bandId] !== undefined
    if (!existingInWatershed && currentInWatershed) {
      bySlug.set(c.id, c)
    }
  }
  return [...bySlug.values()]
}

// Resolves each country's parentRegionIds purely from the watershed PMTiles COUNTRY_ID → REALM_ID
// mapping. Countries not present in the watershed data get no parentRegionIds and appear ungrouped
// in the dropdown. Region assignments will be corrected when country_realm_details.csv is available.
function enrichCountries(
  countries: RegionOption[],
  countryRegionMap: Record<number, number[]>,
  mergedRegions: RegionOption[],
): RegionOption[] {
  return countries.map((c) => {
    if (c.bandId !== undefined && countryRegionMap[c.bandId]?.length) {
      const parentRegionIds = countryRegionMap[c.bandId]
        .map((realmId) => mergedRegions.find((r) => r.bandId === realmId)?.id)
        .filter((id): id is string => id !== undefined)
      if (parentRegionIds.length > 0) {
        return { ...c, parentRegionIds }
      }
    }
    return { ...c, parentRegionIds: [] }
  })
}

const useRegionOptions = (): RegionOptionsResult => {
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>(fallbackRegionOptions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetchAllBoundaryFeatures('region'),
      fetchAllBoundaryFeatures('country', false),
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
      const deduped = deduplicateCountries(countries, countryRegionMap)
      const enriched = enrichCountries(deduped, countryRegionMap, mergedRegions)
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
