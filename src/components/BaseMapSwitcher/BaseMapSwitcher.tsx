import {
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material'
import styles from './BaseMapSwitcher.module.scss'
import { useTranslation } from 'react-i18next'
import { VALID_BASEMAPS, Basemap } from '../../utils/mapUtils'
import { useMapStore } from '../../stores/mapStore'

interface BasemapSwitcherProps {
  showLabels: boolean
  onLabelsChange: (show: boolean) => void
  selectedBasemap: Basemap
  onBasemapChange: (basemap: Basemap) => void
  showRivers: boolean
  onRiversChange: (show: boolean) => void
}

export default function BasemapSwitcher({
  showLabels,
  onLabelsChange,
  selectedBasemap,
  onBasemapChange,
  showRivers,
  onRiversChange,
}: BasemapSwitcherProps) {
  const { t } = useTranslation()
  const isBasemapChanging = useMapStore((s) => s.isBasemapChanging)

  const handleLabelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onLabelsChange(event.target.checked)
  }

  const handleBasemapChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onBasemapChange(event.target.value as Basemap)
  }

  return (
    <>
      <Card className={styles['basemap-card']}>
        <div className={styles['basemap-toggle-header']}>
          <Typography id="basemapLabelsTitle" className={styles['basemap-card_title']}>
            {t('labels')}
          </Typography>
          <Switch
            className={styles['MuiSwitch-root']}
            checked={showLabels}
            onChange={handleLabelsChange}
            disabled={isBasemapChanging}
            aria-labelledby="basemapLabelsTitle"
          />
        </div>
      </Card>
      <Card className={styles['basemap-card']}>
        <div className={styles['basemap-toggle-header']}>
          <Typography id="basemapRiversTitle" className={styles['basemap-card_title']}>
            {t('base_map_layers.rivers')}
          </Typography>
          <div className={styles['basemap-toggle-right']}>
            <div className={styles['rivers-legend']} />
            <Switch
              className={styles['MuiSwitch-root']}
              checked={showRivers}
              onChange={(e) => onRiversChange(e.target.checked)}
              aria-labelledby="basemapRiversTitle"
            />
          </div>
        </div>
      </Card>
      <Card className={styles['basemap-card']}>
        <FormControl classes={{ root: styles['formControlRoot'] }} disabled={isBasemapChanging}>
          <RadioGroup>
            {VALID_BASEMAPS.map((basemap) => (
              <FormControlLabel
                key={basemap}
                classes={{ root: styles['formControlLabelRoot'] }}
                label={t(basemap)}
                control={<Radio onChange={handleBasemapChange} />}
                value={basemap}
                labelPlacement="start"
                checked={selectedBasemap === basemap}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Card>
    </>
  )
}
