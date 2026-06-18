import { type MouseEvent, useState } from 'react'

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

export default function NavigationHeader() {
  const { t } = useTranslation()
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const navItems = [
    { label: t('science_and_methods'), href: '#' },
    { label: t('contact'), href: '#' },
  ]

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <header className={styles['header']}>
      <div className={styles['brand']}>
        <Typography className={styles['wordmark']}>{t('app_title')}</Typography>
        <Chip
          label={t('beta')}
          size="small"
          classes={{ root: styles['beta-chip'], label: styles['beta-chip__label'] }}
        />
      </div>
      <div className={styles['actions']}>
        <IconButton
          aria-label={t('buttons.share_view')}
          className={styles['action-button']}
          onClick={() => setShareOpen(true)}
        >
          <ShareIcon className={styles['action-icon']} />
        </IconButton>
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['nav-link']}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles['hamburger']}>
          <IconButton
            aria-label={t('toggle_navigation_menu')}
            aria-controls="menu-appbar"
            aria-haspopup="true"
            className={styles['action-button']}
            onClick={handleOpenNavMenu}
          >
            <MenuIcon className={styles['action-icon']} />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorElNav}
            {...menuOriginConfig}
            keepMounted
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            slotProps={{
              paper: {
                className: styles['mobile-menu'],
              },
            }}
          >
            {navItems.map((item) => (
              <MenuItem key={item.label} onClick={handleCloseNavMenu}>
                <Typography className={styles['mobile-menu-item']}>{item.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
    </header>
  )
}
