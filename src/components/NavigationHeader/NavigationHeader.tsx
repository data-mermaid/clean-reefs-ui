import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ShareIcon from '@mui/icons-material/Share'
import { Menu, MenuItem, Link } from '@mui/material'
import { useTranslation } from 'react-i18next'
import styles from './NavigationHeader.module.scss'

const menuSx = {
  '& .MuiPaper-root': {
    backgroundColor: '#174b82',
  },
}

const menuOriginConfig = {
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'left' as const,
  },
  transformOrigin: {
    vertical: 'top' as const,
    horizontal: 'left' as const,
  },
}

export default function Header() {
  const { t } = useTranslation()
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)

  const navItems = [
    { label: t('science_and_methods'), href: '#' },
    { label: t('contact'), href: '#' },
  ]

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <Box>
      <AppBar position="sticky" className={styles['MuiAppBar-root']}>
        <Toolbar className={styles['MuiToolbar-root']}>
          <Typography className={styles['logo']}>GPW</Typography>
          <div className={styles['navigation-container']}>
            <IconButton aria-label={t('share_view')}>
              <ShareIcon className={styles['header-icon']} />
            </IconButton>
            <Box className={styles['navigation-desktop-menu-box']}>
              {navItems.map((item) => (
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['navigation-item-link']}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
            <Box className={styles['navigation-mobile-menu-box']}>
              <IconButton
                aria-label={t('toggle_navigation_menu')}
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
              >
                <MenuIcon className={styles['header-icon']} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                {...menuOriginConfig}
                keepMounted
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={menuSx}
              >
                {navItems.map((item) => (
                  <MenuItem key={item.label} onClick={handleCloseNavMenu}>
                    <Typography className={styles['navigation-menu-item']}>{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
