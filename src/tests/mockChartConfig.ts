import { ChartProperties } from '../types/ChartDataTypes'
import mockChartData from './mockChartData.json'
import type { PlotData } from 'plotly.js'

export const mockChartConfig: ChartProperties = {
  barmode: 'group',
  chartName: 'land_use_historical',
  chartSeriesData: mockChartData as Partial<PlotData>[],
  xAxisTitle: 'year',
  yAxisTitle: 'unit_labels.land_cover_pct',
}
