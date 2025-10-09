export interface GraphData {
  [name: string]: Record<string, number>
}

export type GraphType =
  | 'land_use_historical'
  | 'sediment_exposure_historical'
  | 'ecosystem_extent_exposed'

export interface PlotlyData {
  x: string[]
  y: number[]
  type: 'bar'
  name: string
  marker?: object
  categoryPrefix?: string
  hovertemplate?: string
  width: number
}

export interface GraphChartConfig {
  xAxisTitle: string
  yAxisTitle: string
  graphType: GraphType
  graphData: PlotlyData[]
}
