import React, { MouseEventHandler, useEffect, useRef, useState } from 'react'
import styles from './ChartCard.module.scss'
import type { PlotMouseEvent } from 'plotly.js'
import Plot from 'react-plotly.js'
import { Card, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartProperties } from '../../types/ChartDataTypes'

interface ChartCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  regionType?: string
  chartConfigData: ChartProperties | null
  isChartDataLoading: boolean
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
  regionType = 'global',
  chartConfigData,
  isChartDataLoading,
}: ChartCardProps) {
  const { t } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const [pendingScrollAfterOpen, setPendingScrollAfterOpen] = useState(false)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)

  useEffect(() => {
    let animationFrameId: number | null = null

    if (open && pendingScrollAfterOpen) {
      animationFrameId = window.requestAnimationFrame(() => {
        chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setPendingScrollAfterOpen(false)
      })
    }

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [open, pendingScrollAfterOpen])

  useEffect(() => {
    setSelectedPointIndex(null)
  }, [chartConfigData])

  const handleBarClick = (event: PlotMouseEvent) => {
    const clickedPointIndex = event.points[0]?.pointIndex ?? null

    if (clickedPointIndex !== null) {
      setSelectedPointIndex((prev) => (prev === clickedPointIndex ? null : clickedPointIndex))
    }
  }

  const renderChartContent = () => {
    if (isChartDataLoading) {
      return <LoadingState isOverlay={false} />
    }
    if (chartConfigData !== null) {
      return (
        <Plot
          data={chartConfigData.chartSeriesData.map((trace) => {
            if (selectedPointIndex === null) {
              return trace
            }

            const pointCount = Array.isArray(trace.x) ? trace.x.length : 0
            // Per-point opacity array dims all years except the selected one
            const opacityArray = Array.from({ length: pointCount }, (_, i) =>
              i === selectedPointIndex ? 1 : 0.5,
            )

            return {
              ...trace,
              marker: {
                ...(trace.marker && typeof trace.marker === 'object' ? trace.marker : {}),
                opacity: opacityArray,
              },
            }
          })}
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
          onClick={handleBarClick}
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
    <Card
      onClick={(event) => {
        if (onClick) {
          onClick(event)
          setPendingScrollAfterOpen(true)
        }
      }}
      className={styles['chart-card']}
    >
      <div className={getCardHeaderClassNames(open, chartConfigData)} ref={chartRef}>
        <Typography className={styles['chart-card__region-label']}>
          {t(`regions.${regionType}`)}
        </Typography>
        {chartConfigData && (
          <Typography className={styles['chart-card__chart-label']}>
            {t(`charts.${chartConfigData.chartName}`)}
          </Typography>
        )}
      </div>
      {open && renderChartContent()}
    </Card>
  )
}
