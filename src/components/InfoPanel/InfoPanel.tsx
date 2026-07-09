import { Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import styles from './InfoPanel.module.scss'

interface InfoPanelProps {
  isOpen: boolean
  textKey?: string
  listKey?: string
}

export default function InfoPanel({ isOpen, textKey, listKey }: InfoPanelProps) {
  const { t } = useTranslation()

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles['info-panel']}>
      {textKey && <Typography className={styles['info-panel__text']}>{t(textKey)}</Typography>}
      {listKey &&
        (() => {
          const items = t(listKey, { returnObjects: true })
          return Array.isArray(items) ? (
            <ul className={styles['info-panel__list']}>
              {(items as string[]).map((item) => (
                <li key={item}>
                  <Typography>{item}</Typography>
                </li>
              ))}
            </ul>
          ) : null
        })()}
      <Link
        component={RouterLink}
        to="/science-and-methods"
        target="_blank"
        rel="noopener noreferrer"
        underline="always"
        className={styles['info-panel__read-more']}
      >
        {t('read_more')}
      </Link>
    </div>
  )
}
