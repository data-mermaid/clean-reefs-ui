import React, { MouseEventHandler, useState } from 'react'
import { Card, Typography } from '@mui/material'
import styles from './ChartCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartConfig } from '../../types/ChartDataTypes'

interface ChartCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  region?: string
  chartConfigData: ChartConfig | null
}

const getCardHeaderClassNames = (isOpen: boolean, chartConfigData: ChartConfig | null) => {
  const baseClass = styles['chart-card__header']
  if (!chartConfigData) {
    return `${baseClass} ${styles['chart-card__header--no-data']}`
  }

  return `${baseClass} ${styles[`chart-card__header--${isOpen ? 'open' : 'closed'}`]}`
}

export default function ChartCard({
  open = true,
  onClick,
  region = 'global',
  chartConfigData,
}: ChartCardProps) {
  const { t } = useTranslation()
  const [loading] = useState(false)

  const renderGraphContent = () => {
    if (loading) {
      return <LoadingState isOverlay={false} />
    }
    if (chartConfigData !== null) {
      return (
        <Plot
          data={chartConfigData.plotlyConfigData}
          className={styles['chart-card__plot']}
          config={plotlyTheme.config}
          layout={{
            ...plotlyTheme.layout,
            yaxis: {
              ...plotlyTheme.layout.yaxis,
              title: {
                ...plotlyTheme.layout.yaxis.title,
                text: t(chartConfigData.yAxisTitle),
              },
            },
            xaxis: {
              ...plotlyTheme.layout.xaxis,
              title: {
                ...plotlyTheme.layout.xaxis.title,
                text: t(chartConfigData.xAxisTitle),
              },
            },
            showlegend: chartConfigData.plotlyConfigData.length > 1,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      )
    }
    return (
      <Typography className={styles['chart-card__no-data-label']}>
        {t('charts.no_data_available')}
      </Typography>
    )
  }

  return (
    <Card {...(onClick ? { onClick: onClick } : {})} className={styles['chart-card']}>
      <div className={getCardHeaderClassNames(open, chartConfigData)}>
        <Typography className={styles['chart-card__region-label']}>
          {t(`regions.${region}`)}
        </Typography>
        <Typography className={styles['chart-card__chart-label']}>
          {t(chartConfigData?.chartSeriesName)}
        </Typography>
      </div>
      {open && renderGraphContent()}
    </Card>
  )
}
