import { GraphChartConfig, PlotlyData } from '../types/GraphDataTypes'
import mockOutputGraphData from './mockOutputGraphData.json'

export const mockGraphChartConfig: GraphChartConfig = {
  graphData: mockOutputGraphData as PlotlyData[],
  graphType: 'sediment_exposure_historical',
  xAxisTitle: 'year',
  yAxisTitle: 'chart_information.sediment_exposure',
}
