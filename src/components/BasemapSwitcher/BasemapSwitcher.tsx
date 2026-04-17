import {
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material"
import styles from "./BasemapSwitcher.module.scss"
import { useTranslation } from "react-i18next"
import { VALID_BASEMAPS } from "../../utils/mapUtils"

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

  const handleLabelsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onLabelsChange(event.target.checked)
  }

  const handleBasemapChange = (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value
    onBasemapChange(value)
  }

  return (
    <>
      <Card className={styles["basemap-card"]}>
        <div className={styles["basemap-toggle-header"]}>
          <Typography className={styles["basemap-card_title"]}>{t("labels")}</Typography>
          <Switch
            className={styles["MuiSwitch-root"]}
            checked={showLabels}
            onChange={handleLabelsChange}
          />
        </div>
      </Card>
      <Card className={styles["basemap-card"]}>
        <FormControl classes={{ root: styles["MuiFormControl-root"] }}>
          <RadioGroup>
            {VALID_BASEMAPS.map((basemap) => (
              <FormControlLabel
                key={basemap}
                classes={{ root: styles["MuiFormControlLabel-root"] }}
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
