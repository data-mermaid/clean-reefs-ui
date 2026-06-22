import { useTranslation } from 'react-i18next'
import styles from './CoordinatesDisplay.module.scss'

interface CoordinatesDisplayProps {
  lat: number | null
  lng: number | null
}

export default function CoordinatesDisplay({ lat, lng }: CoordinatesDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className={styles['bottom-right-readout']}>
      {lat !== null && lng !== null && (
        <div className={styles['coordinates-display']}>
          {t('coordinates.lat')}: {lat.toFixed(5)}&nbsp;&nbsp;{t('coordinates.lon')}:{' '}
          {lng.toFixed(5)}
        </div>
      )}
    </div>
  )
}
