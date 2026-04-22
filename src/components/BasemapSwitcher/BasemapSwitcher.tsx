import {
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material'
import styles from './BasemapSwitcher.module.scss'
import { useTranslation } from 'react-i18next'
import { VALID_BASEMAPS } from '../../utils/mapUtils'
import { useMapStore } from '../../stores/mapStore'

interface BasemapSwitcherProps {
  showLabels: boolean
  onLabelsChange: (show: boolean) => void
  selectedBasemap: string
  onBasemapChange: (basemap: string) => void
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

  const handleBasemapChange = (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value
    const { restoreActiveSelection } = useMapStore.getState()

    restoreActiveSelection()
    onBasemapChange(value)
  }

  return (
    <>
      <Card className={styles['basemap-card']}>
        <div className={styles['basemap-toggle-header']}>
          <Typography className={styles['basemap-card_title']}>{t('labels')}</Typography>
          <Switch
            className={styles['MuiSwitch-root']}
            checked={showLabels}
            onChange={handleLabelsChange}
            disabled={isChanging}
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
                onChange={handleBasemapChange}
                control={<Radio />}
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
