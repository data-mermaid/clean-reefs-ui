import { Link as InternalLink } from 'react-router'
import { Trans, useTranslation } from 'react-i18next'
import { Button, ClickAwayListener, IconButton } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import TocIcon from '@mui/icons-material/Toc'

import { INVEST_URL } from '../../constants'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import styles from './AboutPage.module.scss'

const sections = [
  { id: 'about', labelKey: 'about' },
  { id: 'contact-us', labelKey: 'about_page.sections.contact_us' },
]

export default function AboutPage() {
  const { t } = useTranslation()
  const lastMapUrl = sessionStorage.getItem('lastMapUrl') || '/'
  const { activeId, sidebarOpen, setSidebarOpen, handleNavClick } = useScrollSpy(sections)

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
            aria-expanded={sidebarOpen}
            disableRipple
          >
            <TocIcon />
          </IconButton>

          <nav className={styles['about-page__section-nav']}>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={activeId === section.id ? 'true' : undefined}
                className={`${styles['about-page__nav-link']}${activeId === section.id ? ` ${styles['about-page__nav-link--active']}` : ''}`}
                onClick={(e) => handleNavClick(e, section.id)}
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
