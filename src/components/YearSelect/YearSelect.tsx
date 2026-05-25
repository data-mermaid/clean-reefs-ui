import React from 'react'
import Box from '@mui/material/Box'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material'
import clsx from 'clsx'

import styles from './YearSelect.module.scss'
import { useTranslation } from 'react-i18next'

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

  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value))
  }

  return (
    <Box className={clsx(styles['year-select'], className)}>
      <span className={styles['year-label']}>{selectedYear}</span>
      <Select<number>
        size="small"
        aria-label={t('select_year')}
        value={selectedYear}
        onChange={handleChange}
        disabled={disabled}
        variant="outlined"
        renderValue={() => ''}
        MenuProps={{
          classes: {
            paper: styles['MuiPaper-root'],
            list: styles['MuiList-root'],
          },
        }}
        classes={{
          root: styles['MuiSelect-root'],
          select: styles['MuiSelect-select'],
        }}
      >
        {availableYears.map((year) => (
          <MenuItem key={year} value={year} className={styles['MuiMenuItem-root']}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

export default YearSelect
