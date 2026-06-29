import { ChangeEvent, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ClickAwayListener, IconButton, List, ListItemButton, Typography } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import CloseIcon from '@mui/icons-material/Close'
import { useGeoSearch } from './useGeoSearch'
import styles from './GeoSearchControlMobile.module.scss'

export default function GeoSearchControlMobile() {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const {
    query,
    results,
    isLoading,
    error,
    activeIndex,
    handleQueryChange,
    handleSelect,
    handleClose,
    handleKeyDown,
  } = useGeoSearch()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (results.length > 0) {
      inputRef.current?.focus()
    }
  }, [results])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleQueryChange(e.target.value)
  }

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div className={styles['geo-search-bar']}>
        <div className={styles['geo-search-bar__input-row']}>
          <MapIcon className={styles['geo-search-bar__map-icon']} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('geo_lookup.placeholder')}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={styles['geo-search-bar__input']}
            aria-label={t('geo_lookup.aria_label')}
          />
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label={t('geo_lookup.close')}
            className={styles['geo-search-bar__close-button']}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        {results.length > 0 && (
          <List
            dense
            disablePadding
            className={styles['geo-search-bar__results']}
            role="listbox"
            aria-label={t('geo_lookup.aria_label')}
          >
            {results.map((result, i) => (
              <ListItemButton
                key={result.osm_id}
                selected={i === activeIndex}
                tabIndex={-1}
                onClick={() => handleSelect(result)}
                className={styles['geo-search-bar__result-item']}
                role="option"
                aria-selected={i === activeIndex}
              >
                <Typography component="span" className={styles['geo-search-bar__result-name']}>
                  {result.display_name}
                </Typography>
                <Typography component="span" className={styles['geo-search-bar__result-type']}>
                  {result.addresstype.replace(/_/g, ' ')}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        )}
        {error && <Typography className={styles['geo-search-bar__error']}>{error}</Typography>}
      </div>
    </ClickAwayListener>
  )
}
