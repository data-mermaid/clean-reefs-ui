import { createContext } from 'react'

export interface FilterSelectContextType {
  selectedYear: string
  updateSelectedYear: (year: string) => void
}

export const FilterSelectContext = createContext<FilterSelectContextType | undefined>(undefined)
