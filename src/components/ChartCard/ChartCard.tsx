import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styles from './ChartCard.module.scss'
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-basic-dist'
import { Card, IconButton, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'
import StyledIconButtonWithTooltip from '../StyledIconButtonWithTooltip/StyledIconButtonWithTooltip'
import { useTranslation } from 'react-i18next'
import { plotlyTheme } from './plotlyTheme'
import LoadingState from '../LoadingState/LoadingState'
import { ChartProperties } from '../../types/ChartDataTypes'
import { buildExportFilename } from '../../utils/chartUtils'
import InfoPanel from '../InfoPanel/InfoPanel'

const chartInfoTextKey: Record<string, string> = {
  sediment_load_historical: 'info_text.sediment_load_chart',
  sediment_exposure_historical: 'info_text.sediment_exposure',
  land_use_historical: 'info_text.land_use',
  contributing_watersheds: 'info_text.contributing_watersheds',
  ecosystem_extent_exposed: 'info_text.ecosystem_extent',
}

const Plot = createPlotlyComponent(Plotly)

interface ChartCardProps {
  regionType?: string
  regionLabel?: string
  selectedYear?: number
  chartConfigData: ChartProperties | null
  isChartDataLoading: boolean
  isVisible?: boolean
}

const getCardHeaderClassNames = (chartConfigData: ChartProperties | null) => {
  const baseClass = styles['chart-card__header']
  if (!chartConfigData) {
    return `${baseClass} ${styles['chart-card__header--no-data']}`
  }
  return baseClass
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
  regionType = 'global',
  regionLabel = '',
  selectedYear,
  chartConfigData,
  isChartDataLoading,
  isVisible = true,
}: ChartCardProps) {
  const { t } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<Plotly.PlotlyHTMLElement | null>(null)
  const filenameRef = useRef('chart-export')
  const [infoOpen, setInfoOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const infoTextKey = chartConfigData ? chartInfoTextKey[chartConfigData.chartName] : undefined

  useEffect(() => {
    const el = chartRef.current
    if (!el) {
      return undefined
    }
    const observer = new ResizeObserver((entries) => {
      setHeaderHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [])

  const selectedBarIndex = useMemo(
    () => getSelectedBarIndex(chartConfigData, selectedYear),
    [chartConfigData, selectedYear],
  )

  // Keep filename in a ref so the modebar click handler always uses the
  // latest value — react-plotly.js doesn't re-register buttons on config changes.
  filenameRef.current = chartConfigData
    ? buildExportFilename(
        regionType,
        regionLabel,
        String(t(`charts.${chartConfigData.chartName}`)).replace(/\n/g, ' '),
      )
    : 'chart-export'

  const plotConfig = useMemo(() => {
    return {
      ...plotlyTheme.config,
      displayModeBar: false,
    }
  }, [])

  const handleDownload = async () => {
    const gd = plotRef.current
    if (!gd) {
      return
    }
    const originalOpacities = gd.data.map((trace) => (trace as Plotly.PlotData).marker?.opacity)
    try {
      await Plotly.restyle(gd, { 'marker.opacity': 1 })
      await Plotly.downloadImage(gd, {
        format: 'png',
        width: null,
        height: null,
        filename: filenameRef.current,
      })
    } finally {
      await Plotly.restyle(gd, { 'marker.opacity': originalOpacities } as Plotly.Data)
    }
  }

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
              height:
                (plotlyTheme.layout?.height ?? 450) +
                Math.max(0, headerHeight - (plotlyTheme.layout?.margin?.t ?? 80)),
              margin: {
                ...plotlyTheme.layout?.margin,
                t: Math.max(plotlyTheme.layout?.margin?.t ?? 80, headerHeight),
              },
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
            onInitialized={(_figure, graphDiv) => {
              plotRef.current = graphDiv as Plotly.PlotlyHTMLElement
            }}
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
    <Card className={styles['chart-card']}>
      <div className={getCardHeaderClassNames(chartConfigData)} ref={chartRef}>
        <Typography className={styles['chart-card__region-label']}>
          {t(`regions.${regionType}`)}
        </Typography>
        {chartConfigData && (
          <div className={styles['chart-card__title-row']}>
            <div className={styles['chart-card__title-content']}>
              <Typography component="span" className={styles['chart-card__chart-label']}>
                {t(`charts.${chartConfigData.chartName}`)}
              </Typography>
              {infoTextKey && (
                <IconButton
                  size="small"
                  onClick={() => setInfoOpen((v) => !v)}
                  aria-label={t('read_more')}
                  aria-expanded={infoOpen}
                >
                  <InfoOutlined sx={{ fontSize: '1rem' }} />
                </IconButton>
              )}
            </div>
            <StyledIconButtonWithTooltip
              size="small"
              tooltipText={t('buttons.download_chart')}
              onClick={handleDownload}
              aria-label={t('buttons.download_chart')}
            >
              <PhotoCameraOutlined sx={{ fontSize: '1rem' }} />
            </StyledIconButtonWithTooltip>
          </div>
        )}
        {infoTextKey && (
          <div className={styles['chart-card__info-panel']}>
            <InfoPanel isOpen={infoOpen} textKey={infoTextKey} />
          </div>
        )}
      </div>
      {isVisible ? renderChartContent() : null}
    </Card>
  )
}
