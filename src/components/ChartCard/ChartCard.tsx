import { Suspense, useMemo, useRef, useState } from 'react'
import styles from './ChartCard.module.scss'
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-basic-dist'
import { Card, IconButton, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
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
  const filenameRef = useRef('chart-export')
  const [infoOpen, setInfoOpen] = useState(false)
  const infoTextKey = chartConfigData ? chartInfoTextKey[chartConfigData.chartName] : undefined

  const selectedBarIndex = useMemo(
    () => getSelectedBarIndex(chartConfigData, selectedYear),
    [chartConfigData, selectedYear],
  )

  // Keep filename in a ref so the modebar click handler always uses the
  // latest value — react-plotly.js doesn't re-register buttons on config changes.
  filenameRef.current = chartConfigData
    ? buildExportFilename(regionType, regionLabel, t(`charts.${chartConfigData.chartName}`))
    : 'chart-export'

  const plotConfig = useMemo(() => {
    return {
      ...plotlyTheme.config,
      // Replace built-in camera button with a custom one that removes
      // the selected-year opacity highlighting before exporting
      modeBarButtonsToRemove: ['toImage'] as Plotly.ModeBarDefaultButtons[],
      modeBarButtonsToAdd: [
        {
          name: 'downloadPng',
          title: t('buttons.download_chart'),
          icon: Plotly.Icons.camera,
          click: async (gd: Plotly.PlotlyHTMLElement) => {
            // Save per-bar opacity arrays (used to dim non-selected years)
            const originalOpacities = gd.data.map(
              (trace) => (trace as Plotly.PlotData).marker?.opacity,
            )

            // Temporarily set all bars to full opacity for the export
            await Plotly.restyle(gd, { 'marker.opacity': 1 })
            await Plotly.downloadImage(gd, {
              format: 'png',
              width: null,
              height: null,
              filename: filenameRef.current,
            })
            // Restore the original highlighting
            // restyle distributes array values across traces — not reflected in @types/plotly.js
            await Plotly.restyle(gd, { 'marker.opacity': originalOpacities } as Plotly.Data)
          },
        },
      ],
    }
  }, [t])

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
    <Card className={styles['chart-card']}>
      <div className={getCardHeaderClassNames(chartConfigData)} ref={chartRef}>
        <Typography className={styles['chart-card__region-label']}>
          {t(`regions.${regionType}`)}
        </Typography>
        {chartConfigData && (
          <div className={styles['chart-card__title-row']}>
            <Typography className={styles['chart-card__chart-label']}>
              {t(`charts.${chartConfigData.chartName}`)}
            </Typography>
            {infoTextKey && (
              <IconButton
                size="small"
                onClick={() => setInfoOpen((v) => !v)}
                aria-label={t('read_more')}
                aria-expanded={infoOpen}
              >
                <InfoOutlined fontSize="small" />
              </IconButton>
            )}
          </div>
        )}
      </div>
      {infoTextKey && <InfoPanel isOpen={infoOpen} textKey={infoTextKey} />}
      {isVisible ? renderChartContent() : null}
    </Card>
  )
}
