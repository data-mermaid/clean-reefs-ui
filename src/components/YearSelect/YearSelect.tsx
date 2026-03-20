import React, { useState, useRef, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import clsx from 'clsx'

import styles from './YearSelect.module.scss'
import { useTranslation } from 'react-i18next'
import { availableYears } from '../../data/mapData'

export interface YearSelectProps {
  selectedYear: number
  onChange?: (year: number) => void
  className?: string
  disabled?: boolean
}

export const YearSelect = ({
  selectedYear,
  onChange,
  className,
  disabled = false,
}: YearSelectProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleToggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }, [disabled])

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCloseDropdown()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCloseDropdown])

  return (
    <Box ref={containerRef} className={clsx(styles['dropdown'], className)}>
      <Button
        size="small"
        variant="contained"
        aria-label={t('select_year')}
        disabled={disabled}
        onClick={handleToggleDropdown}
        className={clsx(
          styles['dropdown__button'],
          isOpen && styles['dropdown__button--open'],
          disabled && styles['dropdown__button--disabled'],
        )}
      >
        {selectedYear}
      </Button>

      {isOpen && (
        <List className={styles['dropdown__list']}>
          {availableYears.map((year) => {
            const isSelected = year === selectedYear

            return (
              <ListItem key={year} disablePadding>
                <Button
                  onClick={() => onChange?.(year)}
                  className={clsx(
                    styles['dropdown__option'],
                    isSelected && styles['dropdown__option--selected'],
                  )}
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
