import React, { MouseEventHandler, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styles from './ChartCard.module.scss'
import Plot from 'react-plotly.js'
import { Card, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartProperties } from '../../types/ChartDataTypes'
import { buildExportFilename } from '../../utils/chartUtils'

interface ChartCardProps {
  open: boolean
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
  regionType?: string
  regionLabel?: string
  selectedYear?: number
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

const getSelectedBarIndex = (
  chartConfigData: ChartProperties | null,
  selectedYear?: number,
): number | null => {
  if (!chartConfigData || selectedYear === undefined) {
    return null
  }

  for (const { x } of chartConfigData.chartSeriesData) {
    if (!Array.isArray(x)) {
      continue
    }

    const barIndex = x.findIndex((value) => String(value) === String(selectedYear))
    if (barIndex !== -1) {
      return barIndex
    }
  }

  return null
}

export default function ChartCard({
  open = true,
  onClick,
  regionType = 'global',
  regionLabel = '',
  selectedYear,
  chartConfigData,
  isChartDataLoading,
}: ChartCardProps) {
  const { t } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const [pendingScrollAfterOpen, setPendingScrollAfterOpen] = useState(false)

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

  const selectedBarIndex = useMemo(
    () => getSelectedBarIndex(chartConfigData, selectedYear),
    [chartConfigData, selectedYear],
  )

  const plotConfig = useMemo(() => {
    const chartTitle = chartConfigData ? t(`charts.${chartConfigData.chartName}`) : ''
    const filename = chartConfigData
      ? buildExportFilename(regionType, regionLabel, chartTitle, selectedYear)
      : 'chart-export'

    return {
      ...plotlyTheme.config,
      toImageButtonOptions: {
        format: 'png' as const,
        filename,
      },
    }
  }, [regionType, regionLabel, chartConfigData, selectedYear, t])

  const renderChartContent = () => {
    if (isChartDataLoading) {
      return <LoadingState isOverlay={false} />
    }

    if (chartConfigData !== null) {
      return (
        <Suspense fallback={<LoadingState isOverlay={false} />}>
          <Plot
            data={chartConfigData.chartSeriesData.map((trace) => {
              if (selectedBarIndex === null) {
                return trace
              }

              const numberOfBars = Array.isArray(trace.x) ? trace.x.length : 0
              const opacityArray = Array.from({ length: numberOfBars }, (_, i) =>
                i === selectedBarIndex ? 1 : 0.5,
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
            config={plotConfig}
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
