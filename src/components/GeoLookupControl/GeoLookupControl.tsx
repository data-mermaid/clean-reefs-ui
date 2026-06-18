import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useControl, useMap } from 'react-map-gl/maplibre'
import { useTranslation } from 'react-i18next'
import {
  Button,
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  TextField,
  Typography,
} from '@mui/material'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import type { IControl } from 'maplibre-gl'
import styles from './GeoLookupControl.module.scss'

const FLY_TO_ZOOM = 8
const LAT_LON_REGEX = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/

class ContainerControl implements IControl {
  private container: HTMLDivElement | null = null
  private onContainerReady: (el: HTMLDivElement) => void

  constructor(onContainerReady: (el: HTMLDivElement) => void) {
    this.onContainerReady = onContainerReady
  }

  onAdd() {
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    this.onContainerReady(this.container)
    return this.container
  }

  onRemove() {
    this.container?.remove()
    this.container = null
  }
}

export default function GeoLookupControl() {
  const { t } = useTranslation()
  const { current: map } = useMap()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useControl(() => new ContainerControl((el) => setContainer(el)), {
    position: 'bottom-right',
  })

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setError('')
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    // The toggle button has its own onClick; let it handle open/close so the
    // dropdown doesn't immediately re-close after being opened.
    if (buttonRef.current?.contains(event.target as Node)) {
      return
    }
    handleClose()
  }

  const flyToCoords = (lng: number, lat: number) => {
    map?.flyTo({ center: [lng, lat], zoom: FLY_TO_ZOOM })
    handleClose()
  }

  const handleSearch = async () => {
    setError('')
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    const latLonMatch = trimmed.match(LAT_LON_REGEX)
    if (latLonMatch) {
      const lat = parseFloat(latLonMatch[1])
      const lon = parseFloat(latLonMatch[2])
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        flyToCoords(lon, lat)
        return
      }
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data: { lat: string; lon: string }[] = await res.json()
      if (data.length) {
        flyToCoords(parseFloat(data[0].lon), parseFloat(data[0].lat))
      } else {
        setError(t('geo_lookup.no_results'))
      }
    } catch {
      setError(t('geo_lookup.search_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    } else if (event.key === 'Escape') {
      handleClose()
    }
  }

  if (!container) {
    return null
  }

  return (
    <>
      {createPortal(
        <IconButton
          ref={buttonRef}
          aria-label={t('geo_lookup.aria_label')}
          title={t('geo_lookup.aria_label')}
          onClick={handleToggle}
          className={styles['button']}
        >
          <TravelExploreIcon className={styles['icon']} />
        </IconButton>,
        container,
      )}
      <Popper
        open={isOpen}
        anchorEl={buttonRef.current}
        placement="left"
        className={styles['popper']}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper className={styles['popup']}>
            <div className={styles['input-row']}>
              <TextField
                inputRef={inputRef}
                size="small"
                placeholder={t('geo_lookup.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className={styles['input']}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading}
                className={styles['go-button']}
              >
                {t('buttons.go')}
              </Button>
            </div>
            {error && <Typography className={styles['error']}>{error}</Typography>}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  )
}
