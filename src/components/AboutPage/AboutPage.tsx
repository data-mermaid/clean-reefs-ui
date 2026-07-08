import { useEffect, useRef, useState } from 'react'
import { Link as InternalLink } from 'react-router'
import { Trans, useTranslation } from 'react-i18next'
import { Button, ClickAwayListener, IconButton } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import TocIcon from '@mui/icons-material/Toc'

import { INVEST_URL, SCROLL_TO_SECTION_OFFSET } from '../../constants'
import styles from './AboutPage.module.scss'

const sections = [
  { id: 'about', labelKey: 'about' },
  { id: 'contact-us', labelKey: 'about_page.sections.contact_us' },
]

export default function AboutPage() {
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
    <div className={styles['about-page']}>
      <ClickAwayListener onClickAway={() => setSidebarOpen(false)}>
        <aside
          className={`${styles['about-page__sidebar']} ${sidebarOpen ? styles['about-page__sidebar--open'] : ''}`}
        >
          <Button
            component={InternalLink}
            to={lastMapUrl}
            variant="contained"
            startIcon={<MapIcon />}
            className={styles['about-page__back-button']}
            disableElevation
          >
            <span className={styles['about-page__back-button-text']}>{t('back_to_map')}</span>
          </Button>

          <IconButton
            onClick={() => setSidebarOpen((prev) => !prev)}
            className={styles['about-page__toc-toggle']}
            aria-label={t('toggle_navigation_menu')}
            disableRipple
          >
            <TocIcon />
          </IconButton>

          <nav className={styles['about-page__section-nav']}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${styles['about-page__nav-link']}${activeId === section.id ? ` ${styles['about-page__nav-link--active']}` : ''}`}
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

      <main className={styles['about-page__content']}>
        <section id="about" className={styles['about-page__section']}>
          <h2 className={styles['about-page__section-heading']}>{t('about')}</h2>
          <hr className={styles['about-page__section-divider']} />
          <p>{t('about_page.para1')}</p>
          <p>{t('about_page.para2')}</p>
          <p>
            <Trans
              i18nKey="about_page.para3"
              components={{
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                invest: <a href={INVEST_URL} target="_blank" rel="noopener noreferrer" />,
              }}
            />
          </p>
          <p>
            <Trans i18nKey="about_page.para4" components={{ em: <em /> }} />
          </p>
        </section>

        <section id="contact-us" className={styles['about-page__section']}>
          <h2 className={styles['about-page__section-heading']}>
            {t('about_page.sections.contact_us')}
          </h2>
          <hr className={styles['about-page__section-divider']} />
          <p>
            <Trans
              i18nKey="about_page.contact_para"
              components={{
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                email: <a href="mailto:info@globalpollutionwatch.org" />,
              }}
            />
          </p>
        </section>
      </main>
    </div>
  )
}
