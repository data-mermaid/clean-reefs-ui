export interface LayerInfo {
  sourceId: string
  sourceName: string //layer name defaults to the file name
  layerId: string
  legendType?: 'gradient' | 'lulc' | 'benthic'
  link: string
  dataType: 'pmtiles' | 'rastertiles' | 'vectortiles' | undefined //pmtiles:vector, tiles:raster
  outlineColor?: string //vector files only
  outlineStyle?: boolean //vector files only
  parentLayerType:
    | 'base'
    | 'benthic'
    | 'boundaries'
    | 'landcover'
    | 'landPollution'
    | 'oceanPollution'
  isLayerOn: boolean
  title: string
  legendTitle?: string
  year?: 2000 | 2005 | 2010 | 2015 | 2020
}

export interface SubLayerInfo {
  layerId: string
  isLayerOn: boolean
}
