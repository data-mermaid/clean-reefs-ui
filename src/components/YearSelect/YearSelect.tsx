import React, { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import clsx from 'clsx'

import styles from './YearSelect.module.scss'

const AVAILABLE_YEARS = [2020, 2015, 2010, 2005, 2000] as const

export interface YearSelectProps {
  selectedYear: number
  onChange: (year: number) => void
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export const YearSelect = ({
  selectedYear,
  onChange,
  className,
  disabled = false,
  'aria-label': ariaLabel = 'Select year',
}: YearSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }, [disabled])

  const handleYearSelect = useCallback(
    (year: number) => {
      onChange(year)
      setIsOpen(false)
    },
    [onChange],
  )

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCloseDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleCloseDropdown])

  // Simple escape key handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDropdown()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCloseDropdown])

  return (
    <Box ref={containerRef} className={clsx(styles.dropdownContainer, className)}>
      <Button
        size="small"
        variant="contained"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={handleToggleDropdown}
        className={clsx(
          styles.selectedYearButton,
          isOpen && styles.open,
          disabled && styles.disabled,
        )}
      >
        {selectedYear}
      </Button>

      {isOpen && (
        <List className={styles.yearList}>
          {AVAILABLE_YEARS.map((year) => {
            const isSelected = year === selectedYear

            return (
              <ListItem key={year} disablePadding>
                <Button
                  onClick={() => handleYearSelect(year)}
                  className={clsx(styles.yearButton, isSelected && styles.selected)}
                >
                  {year}
                </Button>
              </ListItem>
            )
          })}
        </List>
      )}
    </Box>
  )
}

export default YearSelect
