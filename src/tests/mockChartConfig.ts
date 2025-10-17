import { ChartConfig, PlotlyData } from '../types/ChartDataTypes'
import mockChartData from './mockChartData.json'

export const mockChartConfig: ChartConfig = {
  plotlyConfigData: mockChartData as PlotlyData[],
  chartSeriesName: 'land_use_historical',
  xAxisTitle: 'year',
  yAxisTitle: 'chart_information.land_cover_pct',
}
