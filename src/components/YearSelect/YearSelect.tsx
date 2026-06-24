import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import styles from './YearSelect.module.scss'

export interface YearSelectProps {
  selectedYear: number
  availableYears: number[]
  onChange: (year: number) => void
  className?: string
  disabled?: boolean
}

export const YearSelect = ({
  selectedYear,
  availableYears,
  onChange,
  className,
  disabled = false,
}: YearSelectProps) => {
  const { t } = useTranslation()

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: number | null) => {
    if (newValue !== null) { onChange(newValue) }
  }

  return (
    <ToggleButtonGroup
      exclusive
      value={selectedYear}
      onChange={handleChange}
      aria-label={t('select_year')}
      disabled={disabled}
      className={clsx(styles['year-select'], className)}
    >
      {availableYears.map((year) => (
        <ToggleButton key={year} value={year} className={styles['year-select__button']}>
          {year}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default YearSelect
