import React, { MouseEventHandler, useState } from 'react'
import { Card, Typography } from '@mui/material'
import styles from './GraphCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartedData } from '../../types/GraphDataTypes'

interface GraphCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  region?: string
  yAxisTitle?: string
  xAxisTitle?: string
  graphName: string
  graphData: ChartedData[] | null
}

const getCardHeaderClassNames = (isOpen: boolean, graphData: ChartedData[] | null) => {
  const baseClass = styles['graph-card__header']

  if (!graphData || graphData.length === 0) {
    return `${baseClass} ${styles['graph-card__header--no-data']}`
  }

  return `${baseClass} ${styles[`graph-card__header--${isOpen ? 'open' : 'closed'}`]}`
}

export default function GraphCard({
  open = true,
  onClick,
  region = 'global',
  yAxisTitle = 'chart_information.land_cover_pct',
  xAxisTitle = 'year',
  graphData,
  graphName,
}: GraphCardProps) {
  const { t } = useTranslation()
  const [loading] = useState(false)

  const renderGraphContent = () => {
    if (loading) {
      return <LoadingState isOverlay={false} />
    }

    if (graphData !== null) {
      return (
        <Plot
          data={graphData}
          className={styles['graph-card__plot']}
          config={plotlyTheme.config}
          layout={{
            ...plotlyTheme.layout,
            yaxis: {
              ...plotlyTheme.layout.yaxis,
              title: {
                ...plotlyTheme.layout.yaxis.title,
                text: t(yAxisTitle),
              },
            },
            xaxis: {
              ...plotlyTheme.layout.xaxis,
              title: {
                ...plotlyTheme.layout.xaxis.title,
                text: t(xAxisTitle),
              },
            },
            showlegend: graphData.length > 1,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      )
    }
    return (
      <Typography className={styles['graph-card__no-data-label']}>
        {t('graphs.no_data_available')}
      </Typography>
    )
  }

  return (
    <Card {...(onClick ? { onClick: onClick } : {})} className={styles['graph-card']}>
      <div className={getCardHeaderClassNames(open, graphData)}>
        <Typography className={styles['graph-card__region-label']}>
          {t(`regions.${region}`)}
        </Typography>
        <Typography className={styles['graph-card__graph-label']}>{t(graphName)}</Typography>
      </div>
      {open && renderGraphContent()}
    </Card>
  )
}
