// Custom hooks for all app contexts
import { useContext } from 'react'
import { FilterSelectContext } from '../contexts/FilterSelectContext'

export const useFilterSelect = () => {
  const context = useContext(FilterSelectContext)

  if (context === undefined) {
    throw new Error('useFilterSelect must be used within a FilterSelectProvider')
  }

  return context
}
