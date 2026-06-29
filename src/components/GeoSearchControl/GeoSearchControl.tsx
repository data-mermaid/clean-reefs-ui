import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useControl } from 'react-map-gl/maplibre'
import { useTranslation } from 'react-i18next'
import {
  ClickAwayListener,
  IconButton,
  List,
  ListItemButton,
  Popper,
  Typography,
} from '@mui/material'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import MapIcon from '@mui/icons-material/Map'
import CloseIcon from '@mui/icons-material/Close'
import type { IControl } from 'maplibre-gl'
import { useMapStore } from '../../stores/mapStore'
import useResponsive from '../../hooks/useResponsive'
import { useGeoSearch } from './useGeoSearch'
import styles from './GeoSearchControl.module.scss'

class ContainerControl implements IControl {
  private container: HTMLDivElement | null = null
  private onContainerReady: (el: HTMLDivElement) => void

  constructor(onContainerReady: (el: HTMLDivElement) => void) {
    this.onContainerReady = onContainerReady
  }

  onAdd() {
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group geo-lookup-ctrl'
    this.onContainerReady(this.container)
    return this.container
  }

  onRemove() {
    this.container?.remove()
    this.container = null
  }
}

export default function GeoSearchControl() {
  const { t } = useTranslation()
  const { isPanelMobile } = useResponsive()
  const isGeoSearchOpen = useMapStore((s) => s.isGeoSearchOpen)
  const openGeoSearch = useMapStore((s) => s.openGeoSearch)

  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const {
    query,
    results,
    error,
    activeIndex,
    handleQueryChange,
    handleSelect,
    handleClose,
    handleKeyDown,
  } = useGeoSearch()

  useControl(() => new ContainerControl((el) => setContainer(el)), {
    position: 'bottom-right',
  })

  useEffect(() => {
    if (isGeoSearchOpen && !isPanelMobile) {
      inputRef.current?.focus()
    }
  }, [isGeoSearchOpen, isPanelMobile])

  useEffect(() => {
    if (results.length > 0 && !isPanelMobile) {
      inputRef.current?.focus()
    }
  }, [results, isPanelMobile])

  const handleToggle = () => {
    if (isGeoSearchOpen) {
      handleClose()
    } else {
      openGeoSearch()
    }
  }

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (buttonRef.current?.contains(event.target as Node)) {
      return
    }
    handleClose()
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleQueryChange(e.target.value)
  }

  if (!container) {
    return null
  }

  const showPanel = isGeoSearchOpen && !isPanelMobile

  return (
    <>
      {createPortal(
        <IconButton
          ref={buttonRef}
          aria-label={t('geo_lookup.aria_label')}
          aria-expanded={isGeoSearchOpen}
          title={t('geo_lookup.aria_label')}
          onClick={handleToggle}
          className={`${styles['geo-lookup__button']} ${isGeoSearchOpen ? styles['geo-lookup__button--active'] : ''}`}
        >
          <TravelExploreIcon className={styles['geo-lookup__icon']} />
        </IconButton>,
        container,
      )}
      <Popper
        open={showPanel}
        anchorEl={buttonRef.current}
        placement="left-end"
        className={styles['geo-lookup__popper']}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <div className={styles['geo-lookup__panel']}>
            {results.length > 0 && (
              <List
                dense
                disablePadding
                className={styles['geo-lookup__results']}
                role="listbox"
                aria-label={t('geo_lookup.aria_label')}
              >
                {results.map((result, i) => (
                  <ListItemButton
                    key={result.osm_id}
                    selected={i === activeIndex}
                    tabIndex={-1}
                    onClick={() => handleSelect(result)}
                    className={styles['geo-lookup__result-item']}
                    role="option"
                    aria-selected={i === activeIndex}
                  >
                    <Typography component="span" className={styles['geo-lookup__result-name']}>
                      {result.display_name}
                    </Typography>
                    <Typography component="span" className={styles['geo-lookup__result-type']}>
                      {result.addresstype.replace(/_/g, ' ')}
                    </Typography>
                  </ListItemButton>
                ))}
              </List>
            )}
            {error && <Typography className={styles['geo-lookup__error']}>{error}</Typography>}
            <div className={styles['geo-lookup__input-row']}>
              <MapIcon className={styles['geo-lookup__map-icon']} />
              <input
                ref={inputRef}
                type="text"
                placeholder={t('geo_lookup.placeholder')}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={styles['geo-lookup__input']}
                aria-label={t('geo_lookup.aria_label')}
              />
              <IconButton
                size="small"
                onClick={handleClose}
                aria-label={t('geo_lookup.close')}
                className={styles['geo-lookup__close-button']}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
