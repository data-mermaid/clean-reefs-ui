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
    setMinValue(null)
    setMaxValue(null)
    setIsLoading(true)

    const expression = buildExpression(selectedRegion)
    const itemId = buildItemId(selectedYear)

    fetchStatistics(collectionId, itemId, expression).then((result) => {
      if (result) {
        setMinValue(result.min)
        setMaxValue(result.max)
      }
      setIsLoading(false)
    })
  }, [collectionId, selectedRegion, selectedYear])

  return { minValue, maxValue, isLoading }
}

export default useRasterStatistics
