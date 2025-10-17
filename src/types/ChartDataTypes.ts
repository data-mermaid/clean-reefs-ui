export interface ChartData {
  [name: string]: Record<string, number>
}

export type ChartSeriesName =
  | 'land_use_historical'
  | 'sediment_exposure_historical'
  | 'ecosystem_extent_exposed'

export interface PlotlyData {
  x: string[]
  y: number[]
  type: 'bar'
  name: string
  marker?: object
  tracePrefix?: string
  hovertemplate?: string
  width: number
}

export interface ChartConfig {
  xAxisTitle: string
  yAxisTitle: string
  chartSeriesName: ChartSeriesName
  plotlyConfigData: PlotlyData[]
}
