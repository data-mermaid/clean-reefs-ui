import React, { MouseEventHandler, useState } from 'react'
import { Card, Typography } from '@mui/material'
import styles from './GraphCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { GraphChartConfig } from '../../types/GraphDataTypes'

interface GraphCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  region?: string
  graphData: GraphChartConfig | null
}

const getCardHeaderClassNames = (isOpen: boolean, graphData: GraphChartConfig | null) => {
  const baseClass = styles['graph-card__header']
  if (!graphData) {
    return `${baseClass} ${styles['graph-card__header--no-data']}`
  }

  return `${baseClass} ${styles[`graph-card__header--${isOpen ? 'open' : 'closed'}`]}`
}

export default function GraphCard({
  open = true,
  onClick,
  region = 'global',
  graphData,
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
          data={graphData.graphData}
          className={styles['graph-card__plot']}
          config={plotlyTheme.config}
          layout={{
            ...plotlyTheme.layout,
            yaxis: {
              ...plotlyTheme.layout.yaxis,
              title: {
                ...plotlyTheme.layout.yaxis.title,
                text: t(graphData.yAxisTitle),
              },
            },
            xaxis: {
              ...plotlyTheme.layout.xaxis,
              title: {
                ...plotlyTheme.layout.xaxis.title,
                text: t(graphData.xAxisTitle),
              },
            },
            showlegend: Object.keys(graphData.graphData).length > 1,
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
        <Typography className={styles['graph-card__graph-label']}>
          {t(graphData?.graphType)}
        </Typography>
      </div>
      {open && renderGraphContent()}
    </Card>
  )
}
