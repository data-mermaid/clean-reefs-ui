import { availableYears } from '../constants'

export const isValidYear = (year: string): boolean => {
  return availableYears.includes(year)
}

export const getDefaultYear = (): string => {
  return availableYears[0]
}
