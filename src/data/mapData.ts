import {
  ACA_BENTHIC_URL,
  COUNTRIES_PMTILES_URL,
  LULC_2000_URL,
  LULC_2005_URL,
  LULC_2010_URL,
  LULC_2015_URL,
  LULC_2020_URL,
  REGIONS_PMTILES_URL,
  WATERSHED_PMTILES_URL,
} from '../constants'

export interface LayerInfo {
  dataType: 'pmtiles' | 'tiles' | undefined
  isLayerOn: boolean
  layerId: string
  legendType?: 'gradient' | 'lulc'
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
  scaleVariation?: string
  sourceId: string
  sourceName: string //layer name defaults to the file name
  title: string
  year?: 2000 | 2005 | 2010 | 2015 | 2020
}

export const parentLayerTitles = {
  // landPollution: 'map_layer_groups.land_pollution_layers',
  // oceanPollution: 'map_layer_groups.ocean_pollution_layers',
  landcover: 'map_layer_groups.land_use_cover',
  boundaries: 'map_layer_groups.boundaries',
  benthic: 'map_layer_groups.benthic_layers',
  // base: 'map_layer_groups.base_map',
}

export const layers: LayerInfo[] = [
  {
    dataType: 'pmtiles',
    isLayerOn: true,
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    outlineColor: '#000',
    parentLayerType: 'boundaries',
    sourceId: 'watershed_src',
    sourceName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    title: 'boundary_map_layers.watershed_boundaries',
  },
  {
    dataType: 'pmtiles',
    isLayerOn: true,
    layerId: 'regions',
    link: REGIONS_PMTILES_URL,
    outlineColor: '#CECE00',
    outlineStyle: false,
    parentLayerType: 'boundaries',
    sourceId: 'regions_src',
    sourceName: 'regions',
    title: 'boundary_map_layers.regional_boundaries',
  },
  {
    dataType: 'pmtiles',
    isLayerOn: true,
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    outlineColor: '#FF0000',
    parentLayerType: 'boundaries',
    sourceId: 'countries_src',
    sourceName: 'countries',
    title: 'boundary_map_layers.country_boundaries',
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'lulc',
    legendType: 'lulc',
    link: LULC_2000_URL,
    parentLayerType: 'landcover',
    sourceId: 'lulc_2000_visual',
    sourceName: '',
    title: 'map_layer_groups.land_use_cover',
    year: 2000,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'lulc',
    legendType: 'lulc',
    link: LULC_2005_URL,
    parentLayerType: 'landcover',
    sourceId: 'lulc_2005_visual',
    sourceName: '',
    title: 'map_layer_groups.land_use_cover',
    year: 2005,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'lulc',
    legendType: 'lulc',
    link: LULC_2010_URL,
    parentLayerType: 'landcover',
    sourceId: 'lulc_2010_visual',
    sourceName: '',
    title: 'map_layer_groups.land_use_cover',
    year: 2010,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'lulc',
    legendType: 'lulc',
    link: LULC_2015_URL,
    parentLayerType: 'landcover',
    sourceId: 'lulc_2015_visual',
    sourceName: '',
    title: 'map_layer_groups.land_use_cover',
    year: 2015,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'lulc',
    legendType: 'lulc',
    link: LULC_2020_URL,
    parentLayerType: 'landcover',
    sourceId: 'lulc_2020_visual',
    sourceName: '',
    title: 'map_layer_groups.land_use_cover',
    year: 2020,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'aca-benthic',
    link: ACA_BENTHIC_URL,
    parentLayerType: 'benthic',
    sourceId: 'aca_benthic_visual',
    sourceName: '',
    title: 'Benthic',
  },
]
