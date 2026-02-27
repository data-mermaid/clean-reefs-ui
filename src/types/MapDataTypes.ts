export interface LayerInfo {
  dataType: 'pmtiles' | 'rastertiles' | 'vectortiles' | undefined //pmtiles:vector, tiles:raster
  isLayerOn: boolean
  layerId: string
  legendTitle?: string
  legendType?: 'gradient' | 'lulc' | 'benthic'
  link: string
  outlineColor?: string //vector files only
  outlineStyle?: boolean //vector files only
  parentLayerType:
    | 'base'
    | 'benthic'
    | 'boundaries'
    | 'landcover'
    | 'landPollution'
    | 'oceanPollution'
  sourceId: string
  sourceName: string //layer name defaults to the file name
  title: string
  year?: 2000 | 2005 | 2010 | 2015 | 2020
}

export interface SubLayerInfo {
  isLayerOn: boolean
  layerId: string
}
