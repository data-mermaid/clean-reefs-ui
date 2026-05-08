import { useState, useEffect } from 'react'
import { RegionOption } from '../types/RegionDataTypes'
import { buildExpression, buildItemId, fetchStatistics } from '../utils/titilerUtils'

interface RasterStatistics {
  minValue: number | null
  maxValue: number | null
}

const useRasterStatistics = (
  collectionId: string,
  selectedRegion: RegionOption,
  selectedYear: number
): RasterStatistics => {
  const [minValue, setMinValue] = useState<number | null>(null)
  const [maxValue, setMaxValue] = useState<number | null>(null)

  useEffect(() => {
    const expression = buildExpression(selectedRegion)
    const itemId = buildItemId(selectedYear)

    fetchStatistics(collectionId, itemId, expression).then((result) => {
      if (result) {
        setMinValue(result.min)
        setMaxValue(result.max)
      } else {
        // API failure — fall back to null so the legend shows default labels
        setMinValue(null)
        setMaxValue(null)
      }
    })
  }, [collectionId, selectedRegion, selectedYear])

  return { minValue, maxValue }
}

export default useRasterStatistics
