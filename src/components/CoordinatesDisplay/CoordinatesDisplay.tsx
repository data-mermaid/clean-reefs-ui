import { useTranslation } from 'react-i18next'
import styles from './CoordinatesDisplay.module.scss'

interface CoordinatesDisplayProps {
  lat: number | null
  lng: number | null
}

export default function CoordinatesDisplay({ lat, lng }: CoordinatesDisplayProps) {
  const { t } = useTranslation()

  const latStr = lat !== null ? lat.toFixed(5) : '—'
  const lngStr = lng !== null ? lng.toFixed(5) : '—'

  const coordinatesDisplay =
    lat !== null && lng !== null
      ? `${t('coordinates.lat')}: ${latStr}  ${t('coordinates.lon')}: ${lngStr}`
      : '-'

  return (
    <div className={styles['coordinates-display']}>
      <div className={styles['coordinates-display__label']}>{coordinatesDisplay}</div>
    </div>
  )
}
