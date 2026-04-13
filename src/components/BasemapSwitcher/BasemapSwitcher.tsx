import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
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

export default function BasemapSwitcher() {
  const { t } = useTranslation()

  return (
    <>
      <Card className={styles['basemap-card']}>
        <div className={styles['basemap-toggle-header']}>
          <Typography className={styles['basemap-card_title']}>{t('labels')}</Typography>
          <Switch className={styles['MuiSwitch-root']} checked={true} onChange={() => {}}></Switch>
        </div>
      </Card>
      <Card className={styles['basemap-card']}>
        <FormControl classes={{ root: styles['MuiFormControl-root'] }}>
          <RadioGroup>
            <FormControlLabel
              classes={{
                root: styles['MuiFormControlLabel-root'],
              }}
              label={t('basic')}
              onChange={() => {}}
              control=<Radio />
              value=""
              labelPlacement="start"
              checked={true}
            ></FormControlLabel>
            <FormControlLabel
              classes={{
                root: styles['MuiFormControlLabel-root'],
              }}
              label={t('satellite')}
              onChange={() => {}}
              control=<Radio />
              value=""
              labelPlacement="start"
              checked={false}
            ></FormControlLabel>
            <FormControlLabel
              classes={{
                root: styles['MuiFormControlLabel-root'],
              }}
              label={t('light')}
              onChange={() => {}}
              control=<Radio />
              value=""
              labelPlacement="start"
              checked={false}
            ></FormControlLabel>
            <FormControlLabel
              classes={{
                root: styles['MuiFormControlLabel-root'],
              }}
              label={t('dark')}
              onChange={() => {}}
              control=<Radio />
              value=""
              labelPlacement="start"
              checked={false}
            ></FormControlLabel>
          </RadioGroup>
        </FormControl>
      </Card>
    </>
  )
}
