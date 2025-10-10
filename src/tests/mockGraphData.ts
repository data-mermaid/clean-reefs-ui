import { GraphChartConfig, PlotlyData } from '../types/GraphDataTypes'
import mockOutputGraphData from './mockOutputGraphData.json'

export const mockGraphChartConfig: GraphChartConfig = {
  graphData: mockOutputGraphData as PlotlyData[],
  graphType: 'land_use_historical',
  xAxisTitle: 'year',
  yAxisTitle: 'chart_information.land_cover_pct',
}
