import React, { Dispatch, SetStateAction, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import styles from './RegionSelect.module.scss'
import { RegionOption, RegionType } from '../../types/RegionDataTypes'
import { CORAL_REEF_REGIONS } from '../../data/regionData'
import { buildBreadcrumbFromRegion } from '../../utils/mapUtils'
import {
  Autocomplete,
  IconButton,
  TextField,
} from '@mui/material'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import Box from '@mui/material/Box'
import { useMapStore } from '../../stores/mapStore'

// Extends RegionOption with a resolved group label for Autocomplete groupBy.
// Countries spanning multiple regions appear as separate entries (one per group).
type AutocompleteOption = RegionOption & { groupLabel: string }

interface RegionSelectProps {
  breadcrumb: RegionOption[]
  setBreadcrumb: Dispatch<SetStateAction<RegionOption[]>>
  selectedRegion: RegionOption
  onRegionChange: (region: RegionOption) => void
  onUpOneLevelChange: (regionType: RegionType) => void
  regionOptions: RegionOption[]
  regionOptionsLoading: boolean
}

export default function RegionSelect({
  breadcrumb,
  setBreadcrumb,
  selectedRegion,
  onRegionChange,
  onUpOneLevelChange,
  regionOptions,
  regionOptionsLoading,
}: RegionSelectProps) {
  const { t } = useTranslation()
  const jumpToRegion = useMapStore((s) => s.jumpToRegion)
  const rootRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [popperWidth, setPopperWidth] = useState<number | undefined>()

  useLayoutEffect(() => {
    if (dropdownOpen && rootRef.current) {
      setPopperWidth(rootRef.current.offsetWidth)
    }
  }, [dropdownOpen])

  const isAtGlobal = selectedRegion.regionType === 'global'

  // Build Autocomplete options: include global + regions + countries only.
  // Countries with multiple parent regions are expanded into one entry per region.
  // Options are sorted so each group's items are consecutive (required by MUI groupBy).
  const autocompleteOptions = useMemo<AutocompleteOption[]>(() => {
    const groupOrder = new Map<string, number>([['', 0]])
    CORAL_REEF_REGIONS.forEach((cr, i) => groupOrder.set(cr.label, i + 1))

    // Only show a region if at least one country in regionOptions belongs to it.
    const regionsWithCountries = new Set<string>()
    for (const option of regionOptions) {
      if (option.regionType === 'country') {
        for (const parentId of option.parentRegionIds ?? []) {
          regionsWithCountries.add(parentId)
        }
      }
    }

    const opts: AutocompleteOption[] = []
    for (const option of regionOptions) {
      if (option.regionType === 'global') {
        opts.push({ ...option, groupLabel: '' })
      } else if (option.regionType === 'region') {
        if (regionsWithCountries.has(option.id) || option.bandId !== undefined) {
          opts.push({ ...option, groupLabel: option.label })
        }
      } else if (option.regionType === 'country') {
        const parentIds = option.parentRegionIds ?? []
        if (parentIds.length === 0) {
          opts.push({ ...option, groupLabel: '' })
        } else {
          for (const parentId of parentIds) {
            const parent = regionOptions.find((r) => r.id === parentId)
            opts.push({ ...option, groupLabel: parent?.label ?? '' })
          }
        }
      }
    }

    return opts.sort((a, b) => {
      const aOrder = groupOrder.get(a.groupLabel) ?? 999
      const bOrder = groupOrder.get(b.groupLabel) ?? 999
      if (aOrder !== bOrder) { return aOrder - bOrder }
      // Within the same group, region option comes first
      if (a.regionType === 'region' && b.regionType !== 'region') { return -1 }
      if (a.regionType !== 'region' && b.regionType === 'region') { return 1 }
      return a.label.localeCompare(b.label)
    })
  }, [regionOptions])

  const updateRegion = (region: RegionOption, parentRegion?: RegionOption) => {
    if (region.regionType !== 'global') {
      jumpToRegion(region)
    }
    onRegionChange(region)
    setBreadcrumb(buildBreadcrumbFromRegion(region, regionOptions, parentRegion))
  }

  const handleAutocompleteChange = (_: React.SyntheticEvent, value: AutocompleteOption | null) => {
    if (!value) { return }
    setDropdownOpen(false)

    if (value.regionType === 'country') {
      const parentIds = value.parentRegionIds ?? []
      const parentRegion = regionOptions.find((r) =>
        r.regionType === 'region' &&
        parentIds.includes(r.id) &&
        (!value.groupLabel || r.label === value.groupLabel)
      )
      updateRegion(value, parentRegion)
    } else {
      updateRegion(value)
    }
  }

  const handleUpArrow = () => {
    const lastCrumb = breadcrumb[breadcrumb.length - 1]
    onUpOneLevelChange(lastCrumb?.regionType ?? 'global')
  }

  return (
    <Box ref={rootRef} className={clsx(styles['region-select'], dropdownOpen && styles['region-select--open'])}>
      {/* Up arrow — navigates one level up */}
      <IconButton
        size="small"
        disabled={isAtGlobal || regionOptionsLoading}
        onClick={handleUpArrow}
        className={styles['region-select__up-button']}
        aria-label={t('buttons.up_one_level')}
      >
        <SubdirectoryArrowLeftIcon className={styles['region-select__icon']} />
      </IconButton>

      {/* Center — breadcrumb when closed, search when open */}
      <div className={styles['region-select__center']}>
        {!dropdownOpen ? (
          <div className={styles['region-select__breadcrumb']}>
            {breadcrumb.map((crumb, idx) => {
              const isLast = idx === breadcrumb.length - 1
              const isFirst = idx === 0
              return (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && (
                    <span className={styles['region-select__separator']} aria-hidden>
                      ›
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => updateRegion(crumb)}
                    className={clsx(
                      styles['region-select__crumb'],
                      !isFirst && !isLast && styles['region-select__crumb--middle'],
                      isLast && styles['region-select__crumb--last'],
                    )}
                  >
                    {crumb.label}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        ) : (
          <Autocomplete<AutocompleteOption>
            open
            autoHighlight
            options={autocompleteOptions}
            groupBy={(option) => option.groupLabel}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.id === value.id && option.groupLabel === value.groupLabel
            }
            onChange={handleAutocompleteChange}
            onClose={(_, reason) => {
              if (reason !== 'selectOption') { setDropdownOpen(false) }
            }}
            filterOptions={(options, state) => {
              const input = state.inputValue.toLowerCase()
              return options.filter((o) => o.label.toLowerCase().includes(input))
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder={t('regions.search_placeholder')}
                size="small"
                className={styles['region-select__search-input']}
              />
            )}
            renderGroup={(params) => (
              <li key={params.key}>
                {params.group && (
                  <div className={styles['region-select__group-header']}>{params.group}</div>
                )}
                <ul className={styles['region-select__group-list']}>{params.children}</ul>
              </li>
            )}
            renderOption={(props, option) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { key: _key, ...optionProps } = props as React.HTMLAttributes<HTMLLIElement> & {
                key: string
              }
              return (
                <li
                  key={`${option.id}-${option.groupLabel}`}
                  {...optionProps}
                  className={clsx(
                    styles['region-select__option'],
                    option.regionType === 'region' && styles['region-select__option--region'],
                    option.regionType === 'country' && styles['region-select__option--country'],
                    option.regionType === 'global' && styles['region-select__option--global'],
                    option.id === selectedRegion.id && styles['region-select__option--selected'],
                  )}
                >
                  {option.label}
                </li>
              )
            }}
            slotProps={{
              popper: {
                anchorEl: rootRef.current,
                style: popperWidth ? { width: popperWidth } : undefined,
                className: styles['region-select__popper'],
              },
            }}
            className={styles['region-select__autocomplete']}
          />
        )}
      </div>

      {/* Chevron — opens / closes dropdown */}
      <IconButton
        size="small"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={styles['region-select__chevron']}
        aria-label={dropdownOpen ? t('regions.select_region') : t('regions.select_region')}
        aria-expanded={dropdownOpen}
      >
        {dropdownOpen ? (
          <ExpandLessIcon className={styles['region-select__icon']} />
        ) : (
          <ExpandMoreIcon className={styles['region-select__icon']} />
        )}
      </IconButton>
    </Box>
  )
}
