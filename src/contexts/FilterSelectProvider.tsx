import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDefaultYear, isValidYear } from '../utils/yearValidation'
import { FilterSelectContext, FilterSelectContextType } from './FilterSelectContext'

interface FilterSelectProviderProps {
  children: React.ReactNode
}

const latestYear = getDefaultYear

export const FilterSelectProvider = ({ children }: FilterSelectProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedYear, setSelectedYear] = useState<string>(latestYear)

  useEffect(() => {
    const yearSearchParam = searchParams.get('year')

    // No year in URL - use default
    if (!yearSearchParam) {
      setSelectedYear(latestYear)
      return
    }

    // Valid year in URL - use it
    if (isValidYear(yearSearchParam)) {
      setSelectedYear(yearSearchParam)
      return
    }

    // Invalid year in URL - reset to default and clean URL
    setSelectedYear(latestYear)
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const updateSelectedYear = useCallback(
    (year: string) => {
      if (!isValidYear(year)) {
        return
      }

      setSelectedYear(year)
      setSearchParams({ year }, { replace: true })
    },
    [setSearchParams],
  )

  const contextValue: FilterSelectContextType = {
    selectedYear,
    updateSelectedYear,
  }

  return (
    <FilterSelectContext.Provider value={contextValue}>{children}</FilterSelectContext.Provider>
  )
}
