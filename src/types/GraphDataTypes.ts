export interface GraphData {
  [name: string]: Record<string, number>
}

export type GraphType = 'land_use_historical' | 'sediment_exposure_historical'

export interface ChartedData {
  x: string[]
  y: number[]
  type: 'bar'
  name: string
  marker?: object
  hovertemplate?: string
  width: number
}
