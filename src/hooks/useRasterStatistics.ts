import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { buildExpression, buildItemId, fetchStatistics } from '../utils/titilerUtils'

interface RasterStatistics {
  minValue: number | null
  maxValue: number | null
  isLoading: boolean
}

const useRasterStatistics = (
  collectionId: string,
  selectedRegion: RegionOption,
  selectedYear: number
): RasterStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setMinValue(null)
    setMaxValue(null)
    setIsLoading(true)

    const controller = new AbortController()
    const expression = buildExpression(selectedRegion)
    const itemId = buildItemId(selectedYear)

    fetchStatistics(collectionId, itemId, expression, controller.signal).then((result) => {
      if (ignore) return
      if (result) {
        setMinValue(result.min)
        setMaxValue(result.max)
      }
      setIsLoading(false)
    })

    return () => {
      ignore = true
      controller.abort()
    }
  }, [collectionId, selectedRegion, selectedYear])

  return { minValue, maxValue, isLoading }
}

export default useRasterStatistics
