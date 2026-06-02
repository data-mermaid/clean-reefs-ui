import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { fetchAllBoundaryFeatures } from '../utils/pmtilesUtils'
import { defaultGlobalRegionOption, fallbackRegionOptions } from '../data/regionData'

const FIXED_TRAILING: RegionOption[] = [
  { id: 'watershed', regionType: 'watershed', label: 'Watershed' },
  { id: 'plume', regionType: 'plume', label: 'Plume' },
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

    Promise.all([fetchAllBoundaryFeatures('region'), fetchAllBoundaryFeatures('country')])
      .then(([regions, countries]) => {
        if (cancelled) {
          return
        }
        setRegionOptions([defaultGlobalRegionOption, ...regions, ...countries, ...FIXED_TRAILING])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { regionOptions, loading }
}

export default useRegionOptions
