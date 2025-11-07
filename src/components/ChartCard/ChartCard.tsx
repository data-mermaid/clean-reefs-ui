import React, { lazy, MouseEventHandler, Suspense, useState } from 'react'
import { Card, Typography } from '@mui/material'
import styles from './ChartCard.module.scss'
// import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartProperties } from '../../types/ChartDataTypes'

type PlotComponentType = (typeof import('react-plotly.js'))['default']
const Plot = lazy(() => import('react-plotly.js') as Promise<{ default: PlotComponentType }>) // lazy load plotly wrapper

interface ChartCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  region?: string
  chartConfigData: ChartProperties | null
}

const getCardHeaderClassNames = (isOpen: boolean, chartConfigData: ChartProperties | null) => {
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
        <Suspense fallback={<LoadingState isOverlay={false} />}>
          <Plot
            data={chartConfigData.chartSeriesData}
            className={styles['chart-card__plot']}
            config={plotlyTheme.config}
            layout={{
              ...plotlyTheme.layout,
              barmode: chartConfigData.barmode,
              yaxis: {
                ...plotlyTheme.layout?.yaxis,
                title: {
                  ...plotlyTheme.layout?.yaxis?.title,
                  text: t(chartConfigData.yAxisTitle),
                },
              },
              xaxis: {
                ...plotlyTheme.layout?.xaxis,
                title: {
                  ...plotlyTheme.layout?.xaxis?.title,
                  text: t(chartConfigData.xAxisTitle),
                },
              },
              showlegend: chartConfigData.chartSeriesData.length > 1,
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
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
        {chartConfigData && (
          <Typography className={styles['chart-card__chart-label']}>
            {t(`charts.${chartConfigData.chartName}`)}
          </Typography>
        )}
      </div>
      {open && renderGraphContent()}
    </Card>
  )
}
