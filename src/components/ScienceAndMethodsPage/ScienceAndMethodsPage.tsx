import { type ReactNode } from 'react'
import { Link as InternalLink } from 'react-router'
import { Trans, useTranslation } from 'react-i18next'
import { Button, ClickAwayListener, IconButton } from '@mui/material'
import MapIcon from '@mui/icons-material/Map'
import TocIcon from '@mui/icons-material/Toc'

import { useScrollSpy } from '../../hooks/useScrollSpy'
import { atlasBenthicColors } from '../../data/mapData'
import {
  table1Rows,
  table2Rows,
  sedExpTableRows,
  references,
  landUseColors,
  SECTION_IDS,
  sections,
  sectionLabel,
  getCoastedRowspan,
  getTable2NotesSpan,
  type NameKeyClass,
} from '../../data/scienceMethodsData'
import styles from './ScienceAndMethodsPage.module.scss'

function RefLink({
  children,
  href,
  'aria-label': ariaLabel,
}: {
  children?: ReactNode
  href: string
  'aria-label'?: string
}) {
  return (
    <sup>
      <a href={href} aria-label={ariaLabel}>
        {children}
      </a>
    </sup>
  )
}

// [N,M] → each number linked individually; [N–M] → single link to first number; [N] → single link.
function RefText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+(?:[,\-–]\d+)*\])/g)
  return (
    <>
      {parts.map((part, i) => {
        const commaMatch = part.match(/^\[(\d+(?:,\d+)+)\]$/)
        if (commaMatch) {
          const nums = commaMatch[1].split(',')
          return (
            <sup key={i}>
              {'['}
              {nums.map((n, j) => (
                <span key={n}>
                  <a href={`#ref-${n}`}>{n}</a>
                  {j < nums.length - 1 ? ',' : ''}
                </span>
              ))}
              {']'}
            </sup>
          )
        }
        const rangeMatch = part.match(/^\[(\d+)(?:[-–]\d+)*\]$/)
        if (rangeMatch) {
          return (
            <sup key={i}>
              <a href={`#ref-${rangeMatch[1]}`}>{part}</a>
            </sup>
          )
        }
        return part
      })}
    </>
  )
}

export default function ScienceAndMethodsPage() {
  const { t } = useTranslation()
  const lastMapUrl = sessionStorage.getItem('lastMapUrl') || '/'
  const { activeId, sidebarOpen, setSidebarOpen, handleNavClick } = useScrollSpy(sections)

  const landUseClasses = t('science_and_methods_page.land_use.classes', {
    returnObjects: true,
  }) as NameKeyClass[]
  const missingCountries = t('science_and_methods_page.land_use.missing_coverage_countries', {
    returnObjects: true,
  }) as string[]
  const benthicClasses = t('science_and_methods_page.benthic_layers.classes', {
    returnObjects: true,
  }) as NameKeyClass[]
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

        <section id={SECTION_IDS.noteToUsers} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.noteToUsers])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.note_to_users.para1')}</p>
        </section>

        <section id={SECTION_IDS.landUse} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.landUse])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>
            <RefText text={t('science_and_methods_page.land_use.para1')} />
          </p>
          <ul className={styles['science-page__legend']}>
            {landUseClasses.map((cls) => {
              const colorKey = cls.nameKey.split('.')[1]
              const color = landUseColors[colorKey] ?? '#ccc'
              return (
                <li key={cls.nameKey} className={styles['science-page__legend-item']}>
                  <span
                    className={styles['science-page__legend-swatch']}
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    <strong>{t(cls.nameKey as Parameters<typeof t>[0])}</strong>
                    {' — '}
                    {cls.description}
                  </span>
                </li>
              )
            })}
          </ul>
          <p>{t('science_and_methods_page.land_use.missing_coverage_intro')}</p>
          <ul className={styles['science-page__list']}>
            {missingCountries.map((country) => (
              <li key={country}>{country}</li>
            ))}
          </ul>
          <p className={styles['science-page__note']}>
            {t('science_and_methods_page.further_details')}
          </p>
        </section>

        <section id={SECTION_IDS.sedimentLoad} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.sedimentLoad])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>
            <RefText text={t('science_and_methods_page.sediment_load.para1')} />
          </p>
          <p>
            <Trans
              i18nKey="science_and_methods_page.sediment_load.para2"
              components={{
                invest: (
                  <a
                    href="https://naturalcapitalproject.stanford.edu/software/invest"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="InVEST® toolkit (opens in a new tab)"
                  />
                ),
                ref4: <RefLink href="#ref-4" aria-label="Jump to reference 4" />,
              }}
            />
          </p>
          <p>{t('science_and_methods_page.sediment_load.para3')}</p>
          <p>
            <RefText text={t('science_and_methods_page.sediment_load.para4')} />
          </p>
          <table className={styles['science-page__table']}>
            <caption className={styles['science-page__table-caption']}>
              {t('science_and_methods_page.sediment_load.table1_caption')}
            </caption>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '70%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>{t('science_and_methods_page.sediment_load.table1_header_data')}</th>
                <th>
                  {t('science_and_methods_page.sediment_load.table1_header_parameterisation')}
                </th>
              </tr>
            </thead>
            <tbody>
              {table1Rows.map((row) => (
                <tr key={row.data}>
                  <th scope="row">{row.data}</th>
                  <td>
                    <RefText text={row.parameterisation} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>{t('science_and_methods_page.sediment_load.table1_note')}</td>
              </tr>
            </tfoot>
          </table>
          <table className={styles['science-page__table']}>
            <caption className={styles['science-page__table-caption']}>
              {t('science_and_methods_page.sediment_load.table2_caption')}
            </caption>
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '38%' }} />
            </colgroup>
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
              {table2Rows.map((row, i) => (
                <tr key={row.glad_subclasses}>
                  <td>{row.glad_subclasses}</td>
                  <td>{row.description}</td>
                  <td>
                    <RefText text={row.c_factor} />
                  </td>
                  <td>{row.p_factor}</td>
                  {(() => {
                    const span = getTable2NotesSpan(table2Rows, i)
                    if (span === 0) {
                      return null
                    }
                    return (
                      <td rowSpan={span > 1 ? span : undefined}>
                        <RefText text={row.notes ?? ''} />
                      </td>
                    )
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles['science-page__note']}>
            {t('science_and_methods_page.further_details')}
          </p>
        </section>

        <section id={SECTION_IDS.sedimentExposure} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.sedimentExposure])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.sediment_exposure.para1')}</p>
          <p>{t('science_and_methods_page.sediment_exposure.para2')}</p>
          <p>{t('science_and_methods_page.sediment_exposure.para3')}</p>
          <table className={styles['science-page__table']}>
            <caption className={styles['science-page__table-caption']}>
              {t('science_and_methods_page.sediment_exposure.table_caption')}
            </caption>
            <thead>
              <tr>
                <th>{t('science_and_methods_page.sediment_exposure.table_header_data')}</th>
                <th colSpan={2}>
                  {t('science_and_methods_page.sediment_exposure.table_header_parameterisation')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sedExpTableRows.map((row, i) => {
                const span = getCoastedRowspan(sedExpTableRows, i)
                const hasParam = row.parameter !== ''
                const isGroupContinuation = !hasParam
                return (
                  <tr key={i}>
                    {isGroupContinuation ? null : (
                      <td
                        rowSpan={span > 1 ? span : undefined}
                        className={`${styles['science-page__table-bold-cell']} ${styles['science-page__table-cell--center']}`}
                      >
                        {row.parameter}
                      </td>
                    )}
                    <td>{row.sub_parameter}</td>
                    <td>{row.value}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className={styles['science-page__note']}>
            {t('science_and_methods_page.further_details')}
          </p>
        </section>

        <section id={SECTION_IDS.benthicLayers} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.benthicLayers])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>
            <RefText text={t('science_and_methods_page.benthic_layers.para1')} />
          </p>
          <ul className={styles['science-page__legend']}>
            {benthicClasses.map((cls) => {
              const colorKey = cls.nameKey.split('.')[1] as keyof typeof atlasBenthicColors
              const color = atlasBenthicColors[colorKey] ?? '#ccc'
              return (
                <li key={cls.nameKey} className={styles['science-page__legend-item']}>
                  <span
                    className={styles['science-page__legend-swatch']}
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    <strong>{t(cls.nameKey as Parameters<typeof t>[0])}</strong>
                    {' — '}
                    {cls.description}
                  </span>
                </li>
              )
            })}
          </ul>
          <p>
            <RefText text={t('science_and_methods_page.benthic_layers.outro')} />
          </p>
        </section>

        <section id={SECTION_IDS.ecosystemExtent} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.ecosystemExtent])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.ecosystem_extent.para1')}</p>
        </section>

        <section
          id={SECTION_IDS.contributingWatersheds}
          className={styles['science-page__section']}
        >
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.contributingWatersheds])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <p>{t('science_and_methods_page.contributing_watersheds.para1')}</p>
        </section>

        <section id={SECTION_IDS.references} className={styles['science-page__section']}>
          <h2 className={styles['science-page__section-heading']}>
            {t(sectionLabel[SECTION_IDS.references])}
          </h2>
          <hr className={styles['science-page__section-divider']} />
          <ol className={styles['science-page__references']}>
            {references.map((ref, i) => (
              <li key={i} id={`ref-${i + 1}`}>
                {ref.citation}{' '}
                {ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    {ref.url}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
