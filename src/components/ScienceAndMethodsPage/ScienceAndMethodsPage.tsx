import { Link as InternalLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button, ClickAwayListener, IconButton } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import TocIcon from '@mui/icons-material/Toc'

import { useScrollSpy } from '../../hooks/useScrollSpy'
import styles from './ScienceAndMethodsPage.module.scss'

interface LandUseClass {
  nameKey: string
  description: string
}

interface Table1Row {
  data: string
  parameterisation: string
}

interface Table2Row {
  glad_subclasses: string
  description: string
  c_factor: string
  p_factor: string
  notes: string
}

interface CoastedTableRow {
  parameter: string
  sub_parameter: string
  value: string
}

interface BenthicClass {
  nameKey: string
  description: string
}

interface Reference {
  citation: string
  url: string
}

const sections = [
  { id: 'note-to-users', labelKey: 'science_and_methods_page.sections.note_to_users' },
  { id: 'land-use', labelKey: 'land_use' },
  { id: 'sediment-load', labelKey: 'map_layers.sediment_load' },
  { id: 'sediment-exposure', labelKey: 'map_layers.sediment_exposure' },
  { id: 'benthic-layers', labelKey: 'benthic_layers' },
  { id: 'ecosystem-extent', labelKey: 'science_and_methods_page.sections.ecosystem_extent' },
  { id: 'contributing-watersheds', labelKey: 'charts.contributing_watersheds' },
  { id: 'references', labelKey: 'science_and_methods_page.sections.references' },
]

export default function ScienceAndMethodsPage() {
  const { t } = useTranslation()
  const lastMapUrl = sessionStorage.getItem('lastMapUrl') || '/'
  const { activeId, sidebarOpen, setSidebarOpen, handleNavClick } = useScrollSpy(sections)

  const landUseClasses = t('science_and_methods_page.land_use.classes', {
    returnObjects: true,
  }) as LandUseClass[]
  const missingCountries = t('science_and_methods_page.land_use.missing_coverage_countries', {
    returnObjects: true,
  }) as string[]
  const table1Rows = t('science_and_methods_page.sediment_load.table1_rows', {
    returnObjects: true,
  }) as Table1Row[]
  const table2Rows = t('science_and_methods_page.sediment_load.table2_rows', {
    returnObjects: true,
  }) as Table2Row[]
  const sedExpTableRows = t('science_and_methods_page.sediment_exposure.table_rows', {
    returnObjects: true,
  }) as CoastedTableRow[]
  const benthicClasses = t('science_and_methods_page.benthic_layers.classes', {
    returnObjects: true,
  }) as BenthicClass[]
  const references = t('science_and_methods_page.references.items', {
    returnObjects: true,
  }) as Reference[]

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
                aria-current={activeId === section.id ? 'true' : undefined}
                className={`${styles['science-page__nav-link']}${activeId === section.id ? ` ${styles['science-page__nav-link--active']}` : ''}`}
                onClick={(e) => handleNavClick(e, section.id)}
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

        <section id="note-to-users" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t('science_and_methods_page.sections.note_to_users')}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.note_to_users.para1')}</p>
        </section>

        <section id="land-use" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>{t('land_use')}</h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.land_use.para1')}</p>
          <dl className={styles['science-page__definition-list']}>
            {landUseClasses.map((cls) => (
              <div key={cls.nameKey} className={styles['science-page__definition-item']}>
                <dt>{t(cls.nameKey as Parameters<typeof t>[0])}</dt>
                <dd>{cls.description}</dd>
              </div>
            ))}
          </dl>
          <p>{t('science_and_methods_page.land_use.missing_coverage_intro')}</p>
          <ul className={styles['science-page__list']}>
            {missingCountries.map((country) => (
              <li key={country}>{country}</li>
            ))}
          </ul>
          <p className={styles['science-page__note']}>{t('science_and_methods_page.further_details')}</p>
        </section>

        <section id="sediment-load" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>{t('map_layers.sediment_load')}</h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.sediment_load.para1')}</p>
          <p>{t('science_and_methods_page.sediment_load.para2')}</p>
          <p>{t('science_and_methods_page.sediment_load.para3')}</p>
          <p>{t('science_and_methods_page.sediment_load.para4')}</p>
          <p className={styles['science-page__table-caption']}>
            {t('science_and_methods_page.sediment_load.table1_caption')}
          </p>
          <table className={styles['science-page__table']}>
            <thead>
              <tr>
                <th>{t('science_and_methods_page.sediment_load.table1_header_data')}</th>
                <th>{t('science_and_methods_page.sediment_load.table1_header_parameterisation')}</th>
              </tr>
            </thead>
            <tbody>
              {table1Rows.map((row) => (
                <tr key={row.data}>
                  <td>{row.data}</td>
                  <td>{row.parameterisation}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>{t('science_and_methods_page.sediment_load.table1_note')}</td>
              </tr>
            </tfoot>
          </table>
          <p className={styles['science-page__table-caption']}>
            {t('science_and_methods_page.sediment_load.table2_caption')}
          </p>
          <table className={styles['science-page__table']}>
            <thead>
              <tr>
                <th>{t('science_and_methods_page.sediment_load.table2_header_subclasses')}</th>
                <th>{t('science_and_methods_page.sediment_load.table2_header_description')}</th>
                <th>{t('science_and_methods_page.sediment_load.table2_header_c_factor')}</th>
                <th>{t('science_and_methods_page.sediment_load.table2_header_p_factor')}</th>
                <th>{t('science_and_methods_page.sediment_load.table2_header_notes')}</th>
              </tr>
            </thead>
            <tbody>
              {table2Rows.map((row) => (
                <tr key={row.glad_subclasses}>
                  <td>{row.glad_subclasses}</td>
                  <td>{row.description}</td>
                  <td>{row.c_factor}</td>
                  <td>{row.p_factor}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles['science-page__note']}>{t('science_and_methods_page.further_details')}</p>
        </section>

        <section id="sediment-exposure" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>{t('map_layers.sediment_exposure')}</h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.sediment_exposure.para1')}</p>
          <p>{t('science_and_methods_page.sediment_exposure.para2')}</p>
          <p>{t('science_and_methods_page.sediment_exposure.para3')}</p>
          <p className={styles['science-page__table-caption']}>
            {t('science_and_methods_page.sediment_exposure.table_caption')}
          </p>
          <table className={styles['science-page__table']}>
            <thead>
              <tr>
                <th>{t('science_and_methods_page.sediment_exposure.table_header_data')}</th>
                <th colSpan={2}>
                  {t('science_and_methods_page.sediment_exposure.table_header_parameterisation')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sedExpTableRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.parameter}</td>
                  <td>{row.sub_parameter}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles['science-page__note']}>{t('science_and_methods_page.further_details')}</p>
        </section>

        <section id="benthic-layers" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>{t('benthic_layers')}</h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.benthic_layers.para1')}</p>
          <dl className={styles['science-page__definition-list']}>
            {benthicClasses.map((cls) => (
              <div key={cls.nameKey} className={styles['science-page__definition-item']}>
                <dt>{t(cls.nameKey as Parameters<typeof t>[0])}</dt>
                <dd>{cls.description}</dd>
              </div>
            ))}
          </dl>
          <p>{t('science_and_methods_page.benthic_layers.outro')}</p>
        </section>

        <section id="ecosystem-extent" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t('science_and_methods_page.sections.ecosystem_extent')}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.ecosystem_extent.para1')}</p>
        </section>

        <section id="contributing-watersheds" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>{t('charts.contributing_watersheds')}</h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.contributing_watersheds.para1')}</p>
        </section>

        <section id="references" className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t('science_and_methods_page.sections.references')}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <ol className={styles['science-page__references']}>
            {references.map((ref, i) => (
              <li key={i}>
                {ref.citation}{' '}
                <a href={ref.url} target="_blank" rel="noopener noreferrer">
                  {ref.url}
                </a>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
