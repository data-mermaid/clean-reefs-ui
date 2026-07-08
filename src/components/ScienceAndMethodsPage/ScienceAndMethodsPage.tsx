import { useEffect, useRef, useState } from 'react'
import { Link as InternalLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button, ClickAwayListener, IconButton } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import TocIcon from '@mui/icons-material/Toc'

import { SCROLL_TO_SECTION_OFFSET } from '../../constants'
import styles from './ScienceAndMethodsPage.module.scss'

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

const sections = [
  { id: 'overview', labelKey: 'science_and_methods_page.sections.overview' },
  { id: 'data-sources', labelKey: 'science_and_methods_page.sections.data_sources' },
  { id: 'spatial-resolution', labelKey: 'science_and_methods_page.sections.spatial_resolution' },
  { id: 'methodology', labelKey: 'science_and_methods_page.sections.methodology' },
  { id: 'coral-reef-regions', labelKey: 'science_and_methods_page.sections.coral_reef_regions' },
  { id: 'validation', labelKey: 'science_and_methods_page.sections.validation' },
  {
    id: 'citing-this-platform',
    labelKey: 'science_and_methods_page.sections.citing_this_platform',
  },
]

export default function ScienceAndMethodsPage() {
  const { t } = useTranslation()
  const lastMapUrl = sessionStorage.getItem('lastMapUrl') || '/'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState(sections[0].id)
  const suppressObserver = useRef(false)
  const suppressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver.current) {
          return
        }
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) {
          setActiveId(visible.target.id)
        }
      },
      { rootMargin: '-10% 0px -60% 0px' },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
      }
    })

    return () => {
      observer.disconnect()
      if (suppressTimeout.current) {
        clearTimeout(suppressTimeout.current)
      }
    }
  }, [])

  return (
    <div className={styles['science-page']}>
      <ClickAwayListener onClickAway={() => setSidebarOpen(false)}>
        <aside
          className={`${styles['science-page__sidebar']} ${sidebarOpen ? styles['science-page__sidebar--open'] : ''}`}
        >
          <Button
            component={InternalLink}
            to={lastMapUrl}
            variant="contained"
            startIcon={<MapIcon />}
            className={styles['science-page__back-button']}
            disableElevation
          >
            <span className={styles['science-page__back-button-text']}>{t('back_to_map')}</span>
          </Button>

          {/* Mobile only: TOC expand/collapse toggle — always at same position */}
          <IconButton
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={styles['science-page__toc-toggle']}
            aria-label={t('toggle_navigation_menu')}
            aria-expanded={sidebarOpen}
            disableRipple
          >
            <TocIcon />
          </IconButton>

          <nav className={styles['science-page__section-nav']}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${styles['science-page__nav-link']}${activeId === section.id ? ` ${styles['science-page__nav-link--active']}` : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  const target = document.getElementById(section.id)
                  if (target) {
                    window.scrollTo({
                      top:
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        SCROLL_TO_SECTION_OFFSET,
                      behavior: 'smooth',
                    })
                  }
                  setActiveId(section.id)
                  suppressObserver.current = true
                  if (suppressTimeout.current) {
                    clearTimeout(suppressTimeout.current)
                  }
                  suppressTimeout.current = setTimeout(() => {
                    suppressObserver.current = false
                  }, 1000)
                  setSidebarOpen(false)
                }}
              >
                {t(section.labelKey)}
              </a>
            ))}
          </nav>
        </aside>
      </ClickAwayListener>

      <main className={styles['science-page__content']}>
        <h1 className={styles['science-page__title']}>{t('science_and_methods')}</h1>
        <p className={styles['science-page__subtitle']}>{t('science_and_methods_page.subtitle')}</p>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className={styles['science-page__section']}>
            <h2 className={styles['science-page__section-heading']}>{t(section.labelKey)}</h2>
            <hr className={styles['science-page__section-divider']} />
            <p>{LOREM}</p>
            <p>{LOREM}</p>
          </section>
        ))}
      </main>
    </div>
  )
}
