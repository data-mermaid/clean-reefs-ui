export interface GraphData {
  [name: string]: Record<string, number>
}

export interface ChartedData {
  x: string[]
  y: number[]
  type: 'bar'
  name: string
  marker?: object
  hovertemplate?: string
  width: number
}
