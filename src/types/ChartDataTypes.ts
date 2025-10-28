import { PlotData } from 'plotly.js'

export interface ChartData {
  [name: string]: Record<string, number>
}

export type ChartSeriesName =
  | 'land_use_historical'
  | 'sediment_exposure_historical'
  | 'ecosystem_extent_exposed'

export interface ChartSeriesConfig {
  [chartName: string]: {
    barcornerradius?: number
    barmode?: 'stack' | 'group'
    legendColors: {
      [category: string]: string
    }
    name?: string
    tracePrefix?: string
    xAxisTitle: string
    yAxisTitle: string
    width: number
  }
}

export interface ChartProperties {
  barcornerradius?: number
  barmode: 'stack' | 'group'
  chartName: string
  chartSeriesData: Partial<PlotData>[]
  tracePrefix?: string
  xAxisTitle: string
  yAxisTitle: string
}
