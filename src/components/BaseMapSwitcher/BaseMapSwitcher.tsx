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
}

export default function BasemapSwitcher({
  showLabels,
  onLabelsChange,
  selectedBasemap,
  onBasemapChange,
}: BasemapSwitcherProps) {
  const { t } = useTranslation()
  const isBasemapChanging = useMapStore((s) => s.isBasemapChanging)
  const isLabelChanging = useMapStore((s) => s.isLabelChanging)
  const isChanging = isBasemapChanging || isLabelChanging

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
            disabled={isChanging}
            aria-labelledby="basemapLabelsTitle"
          />
        </div>
      </Card>
      <Card className={styles['basemap-card']}>
        <FormControl classes={{ root: styles['MuiFormControl-root'] }} disabled={isChanging}>
          <RadioGroup>
            {VALID_BASEMAPS.map((basemap) => (
              <FormControlLabel
                key={basemap}
                classes={{ root: styles['MuiFormControlLabel-root'] }}
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
