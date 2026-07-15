import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures, fetchCountryRegionMap } from '../utils/pmtilesUtils'
import {
  defaultGlobalRegionOption,
  fallbackRegionOptions,
  watershedAndDispersalRegions,
} from '../data/regionData'

interface RegionOptionsResult {
  regionOptions: RegionOption[]
  loading: boolean
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

// Resolves each country's parentRegionIds from the watershed PMTiles COUNTRY_ID → REALM_ID mapping.
// Countries with no watershed data are excluded entirely — they have no drill-down path.
function enrichCountries(
  countries: RegionOption[],
  countryRegionMap: Record<number, number[]>,
  regions: RegionOption[],
): RegionOption[] {
  return countries.flatMap((c) => {
    if (c.bandId !== undefined && countryRegionMap[c.bandId]?.length) {
      const parentRegionIds = countryRegionMap[c.bandId]
        .map((realmId) => regions.find((r) => r.bandId === realmId)?.id)
        .filter((id): id is string => id !== undefined)
      if (parentRegionIds.length > 0) {
        return [{ ...c, parentRegionIds }]
      }
    }
    return []
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
      const deduped = deduplicateCountries(countries, countryRegionMap)
      const enriched = enrichCountries(deduped, countryRegionMap, regions)
      setRegionOptions([
        defaultGlobalRegionOption,
        ...regions,
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
