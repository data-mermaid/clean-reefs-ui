import { type MouseEvent, useEffect, useState } from 'react'
import { Link as InternalLink, useLocation, useNavigate } from 'react-router'

import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ShareIcon from '@mui/icons-material/Share'
import { Chip, Menu, MenuItem, Link, Typography } from '@mui/material'
import type { PopoverOrigin } from '@mui/material'

import { useTranslation } from 'react-i18next'

import styles from './NavigationHeader.module.scss'
import ShareModal from '../ShareModal/ShareModal'

const menuOriginConfig: {
  anchorOrigin: PopoverOrigin
  transformOrigin: PopoverOrigin
} = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
}

interface NavItem {
  label: string
  href: string
  internalLink: boolean
}

export default function NavigationHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isMapPage = location.pathname === '/'
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [menuSnapshot, setMenuSnapshot] = useState<NavItem[]>([])

  // Save map URL on every location change while on map, but only once params
  // are present — avoids overwriting with bare "/" before MapContainer restores them.
  useEffect(() => {
    if (isMapPage && location.search) {
      sessionStorage.setItem('lastMapUrl', location.pathname + location.search)
    }
  }, [isMapPage, location])

  const lastMapUrl = sessionStorage.getItem('lastMapUrl') || '/'

  const navItems: NavItem[] = [
    ...(!isMapPage ? [{ label: t('back_to_map'), href: lastMapUrl, internalLink: true }] : []),
    { label: t('science_and_methods'), href: '/science-and-methods', internalLink: true },
    { label: t('contact'), href: '#', internalLink: false },
  ]

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuSnapshot(navItems)
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleMobileNavClick = (item: NavItem) => {
    handleCloseNavMenu()
    if (item.internalLink) {
      navigate(item.href)
    } else if (item.href !== '#') {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <header className={styles['header']}>
      <div className={styles['header__brand']}>
        <Typography className={styles['header__wordmark']}>{t('app_title')}</Typography>
        <Chip
          label={t('beta')}
          size="small"
          classes={{ root: styles['header__beta-chip'], label: styles['header__beta-chip-label'] }}
        />
      </div>
      <div className={styles['header__actions']}>
        {isMapPage && (
          <>
            <IconButton
              aria-label={t('buttons.share_view')}
              className={styles['header__action-button']}
              onClick={() => setShareOpen(true)}
            >
              <ShareIcon className={styles['header__action-icon']} />
            </IconButton>
            <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
          </>
        )}
        {navItems.map((item) => {
          const isActive = item.internalLink && location.pathname === item.href
          const className = `${styles['header__nav-link']}${isActive ? ` ${styles['header__nav-link--active']}` : ''}`

          return (
            <Link
              key={item.label}
              {...(item.internalLink
                ? { component: InternalLink, to: item.href }
                : item.href !== '#'
                  ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                  : { href: item.href })}
              className={className}
            >
              {item.label}
            </Link>
          )
        })}
        <div className={styles['header__hamburger']}>
          <IconButton
            aria-label={t('toggle_navigation_menu')}
            aria-controls="menu-appbar"
            aria-haspopup="true"
            aria-expanded={Boolean(anchorElNav)}
            className={styles['header__action-button']}
            onClick={handleOpenNavMenu}
          >
            <MenuIcon className={styles['header__action-icon']} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            {...menuOriginConfig}
            keepMounted
            disableScrollLock
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            slotProps={{
              paper: {
                className: styles['header__mobile-menu'],
              },
            }}
          >
            {menuSnapshot.map((item) => {
              const isActive = item.internalLink && location.pathname === item.href
              return (
                <MenuItem key={item.label} onClick={() => handleMobileNavClick(item)}>
                  <Typography
                    className={`${styles['header__mobile-menu-item']}${isActive ? ` ${styles['header__mobile-menu-item--active']}` : ''}`}
                  >
                    {item.label}
                  </Typography>
                </MenuItem>
              )
            })}
          </Menu>
        </div>
      </div>
    </header>
  )
}
