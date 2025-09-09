import { Card, Typography } from '@mui/material'
import styles from './GraphCard.module.scss'
import Plot from 'react-plotly.js'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import { ChartedData } from '../../utils/updateGraph'
import React, { MouseEventHandler, useEffect, useState } from 'react'
import LoadingState from '../LoadingState/LoadingState'

interface GraphCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  region?: string
  yAxisTitle?: string
  xAxisTitle?: string
  graphName: string
  graphData: ChartedData[] | null
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(!graphData)
  }, [graphData])

  return (
    <Card
      {...(onClick ? { onClick: onClick } : {})}
      classes={{
        root: styles[`graph-card--${open ? 'open' : 'closed'}`],
      }}
    >
      <div className={styles[`labels-container--${open ? 'open' : 'closed'}`]}>
        <Typography className={styles['region-label']}>{t(`regions.${region}`)}</Typography>
        <Typography className={styles['graph-label']}>{t(graphName)}</Typography>
      </div>
      {loading
        ? open && <LoadingState />
        : open &&
          graphData && (
            <Plot
              data={graphData}
              className={styles['graph-plots']}
              config={plotlyTheme.config}
              layout={{
                ...plotlyTheme.layout,
                yaxis: { title: { text: t(yAxisTitle), ...plotlyTheme.layout.yaxis.title } },
                xaxis: { title: { text: t(xAxisTitle), ...plotlyTheme.layout.xaxis.title } },
              }}
              style={{ width: '100%', height: '100%' }}
            />
          )}
    </Card>
  )
}
