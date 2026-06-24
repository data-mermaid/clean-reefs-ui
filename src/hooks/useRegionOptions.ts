import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures } from '../utils/pmtilesUtils'
import { CORAL_REEF_REGIONS, COUNTRY_REGION_MAP } from '../data/coralReefRegions'
import { defaultGlobalRegionOption, fallbackRegionOptions } from '../data/regionData'

const FIXED_TRAILING: RegionOption[] = [
  { id: 'watershed', regionType: 'watershed', label: 'Watershed' },
  { id: 'dispersal', regionType: 'dispersal', label: 'Dispersal' },
]

interface RegionOptionsResult {
  regionOptions: RegionOption[]
  loading: boolean
}

// Ensure all 5 coral reef regions are present: use the API version (with bandId + extent)
// when available, otherwise fall back to a minimal entry from CORAL_REEF_REGIONS so that
// COUNTRY_REGION_MAP parent lookups always resolve.
function mergeRegions(apiRegions: RegionOption[]): RegionOption[] {
  return CORAL_REEF_REGIONS.map((cr) => apiRegions.find((r) => r.id === cr.id) ?? { id: cr.id, regionType: 'region' as const, label: cr.label })
}

const useRegionOptions = (): RegionOptionsResult => {
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>(fallbackRegionOptions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchAllBoundaryFeatures('region'), fetchAllBoundaryFeatures('country')]).then(
      ([regions, countries]) => {
        if (cancelled) {
          return
        }
        if (regions.length === 0 && countries.length === 0) {
          setLoading(false)
          return
        }
        const enrichedCountries = countries.map((c) => ({
          ...c,
          parentRegionIds: COUNTRY_REGION_MAP[c.id],
        }))
        setRegionOptions([defaultGlobalRegionOption, ...mergeRegions(regions), ...enrichedCountries, ...FIXED_TRAILING])
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { regionOptions, loading }
}

export default useRegionOptions
