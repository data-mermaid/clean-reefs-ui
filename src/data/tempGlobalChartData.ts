import { ChartConfig, PlotlyData } from '../types/ChartDataTypes'
import tempEcosystemExtentExposedChartData from './tempEcosystemExtentExposedChartData.json'
import tempSedimentExposureChartData from './tempSedimentExposureChartData.json'
import mockChartData from '../tests/mockChartData.json'

export const tempGlobalChartConfig: ChartConfig[] = [
  {
    plotlyConfigData: tempEcosystemExtentExposedChartData as PlotlyData[],
    chartSeriesName: 'ecosystem_extent_exposed',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
    barmode: '',
  },
  {
    plotlyConfigData: mockChartData as PlotlyData[],
    chartSeriesName: 'ecosystem_extent_exposed',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
    barmode: 'stack',
  },
  {
    plotlyConfigData: tempSedimentExposureChartData as PlotlyData[],
    chartSeriesName: 'ecosystem_extent_exposed',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
    barmode: 'group',
  },
]
