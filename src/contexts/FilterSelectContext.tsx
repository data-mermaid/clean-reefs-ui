import React, { createContext, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getDefaultYear, isValidYear } from '../utils/yearValidation'

interface FilterSelectContextType {
  selectedYear: string
  updateSelectedYear: (year: string) => void
}

const FilterSelectContext = createContext<FilterSelectContextType | undefined>(undefined)

interface FilterSelectProviderProps {
  children: React.ReactNode
}

const latestYear = getDefaultYear

export const FilterSelectProvider = ({ children }: FilterSelectProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedYear, setSelectedYear] = useState<string>(latestYear)

  // Initialize and sync with URL params
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
      if (!isValidYear(year)) return

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

export const useFilterSelect = () => {
  const context = React.useContext(FilterSelectContext)

  if (context === undefined) {
    throw new Error('useFilterSelect must be used within a FilterSelectProvider')
  }

  return context
}
