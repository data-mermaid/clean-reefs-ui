import { PlotData } from 'plotly.js'

export interface ChartData {
  [name: string]: Record<string, number>
}

export type ChartSeriesName =
  | 'land_use_historical'
  | 'sediment_exposure_historical'
  | 'ecosystem_extent_exposed'

// export interface SeriesTraceProperties {
//   type: 'bar' | 'line' | 'scatter'
//   x: string[]
//   y: number[]
//   tracePrefix?: string
//   traceName: string
//   traceMarker?: object
//   hovertemplate?: string
//   width: number
// }

export interface ChartProperties {
  barcornerradius?: number
  barmode: 'stack' | 'group'
  chartName: string
  chartSeriesData: Partial<PlotData>[]
  tracePrefix?: string
  xAxisTitle: string
  yAxisTitle: string
}
