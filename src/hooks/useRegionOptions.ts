import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures } from '../utils/pmtilesUtils'
import { COUNTRY_REGION_MAP, defaultGlobalRegionOption, fallbackRegionOptions } from '../data/regionData'

const FIXED_TRAILING: RegionOption[] = [
  { id: 'watershed', regionType: 'watershed', label: 'Watershed' },
  { id: 'dispersal', regionType: 'dispersal', label: 'Dispersal' },
]

interface RegionOptionsResult {
  regionOptions: RegionOption[]
  loading: boolean
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
        setRegionOptions([defaultGlobalRegionOption, ...regions, ...enrichedCountries, ...FIXED_TRAILING])
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
