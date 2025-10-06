import {
  COUNTRIES_PMTILES_URL,
  LULC_2000_URL,
  LULC_2005_URL,
  REGIONS_PMTILES_URL,
  WATERSHED_PMTILES_URL,
} from '../constants'

export interface LayerInfo {
  sourceId: string
  sourceName: string //layer name defaults to the file name
  layerId: string
  link: string
  dataType: 'pmtiles' | 'tiles' | undefined
  parentLayerType:
    | 'base'
    | 'benthic'
    | 'boundaries'
    | 'landcover'
    | 'landPollution'
    | 'oceanPollution'
  isLayerOn: boolean
  title: string
}

export const parentLayerTitles = {
  base: 'map_layer_groups.base_map',
  benthic: 'map_layer_groups.benthic_layers',
  boundaries: 'map_layer_groups.boundaries',
  landcover: 'map_layer_groups.land_use_cover',
  landPollution: 'map_layer_groups.land_pollution_layers',
  oceanPollution: 'map_layer_groups.ocean_pollution_layers',
}

export const layers: LayerInfo[] = [
  {
    sourceId: 'regions_src',
    sourceName: 'regions',
    layerId: 'regions',
    link: REGIONS_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: false,
    title: 'boundary_map_layers.regional_boundaries',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'countries',
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: false,
    title: 'boundary_map_layers.country_boundaries',
  },
  {
    sourceId: 'watershed_src',
    sourceName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: false,
    title: 'boundary_map_layers.watershed_boundaries',
  },
  {
    sourceId: 'lulc_2000_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2000_URL,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    title: 'map_layer_groups.land_use_cover',
  },
  {
    sourceId: 'lulc_2005_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2005_URL,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    title: 'map_layer_groups.land_use_cover',
  },
  // {
  //   sourceId: 'lulc_2010_visual',
  //   sourceName: '',
  //   layerId: 'lulc',
  //   link: LULC_2010_URL,
  //   dataType: 'tiles',
  //   parentLayerType: 'landcover',
  //   isLayerOn: false,
  //   title: 'map_layer_groups.land_use_cover',
  // },
  // {
  //   sourceId: 'lulc_2015_visual',
  //   sourceName: '',
  //   layerId: 'lulc',
  //   link: LULC_2015_URL,
  //   dataType: 'tiles',
  //   parentLayerType: 'landcover',
  //   isLayerOn: false,
  //   title: 'map_layer_groups.land_use_cover',
  // },
  // {
  //   sourceId: 'lulc_2020_visual',
  //   sourceName: '',
  //   layerId: 'lulc',
  //   link: LULC_2020_URL,
  //   dataType: 'tiles',
  //   parentLayerType: 'landcover',
  //   isLayerOn: false,
  //   title: 'map_layer_groups.land_use_cover',
  // },
  // { //todo: request optimized data layer
  //   sourceId: 'aca_benthic_visual',
  //   sourceName: '',
  //   layerId: 'aca-benthic',
  //   link: ACA_BENTHIC_URL,
  //   dataType: 'tiles',
  //   parentLayerType: 'benthic',
  //   isLayerOn: false,
  //   title: 'Benthic',
  // },
]

//todo: update this data with config for all graphs
export const graphLayoutConfig = {
  'graphs.land_use_historical': {
    width: 2,
    legendColors: {
      bare_ground: '#FEFECC',
      shrubland_grassland: '#B0B006',
      mixed_forest: '#609C30',
      high_canopy_forest: '#065106',
      surface_water: '#0E39D6',
      cropland: '#FF7D00',
      built_up: '#64DCDC',
    },
  },
  'graphs.ecosystem_extent_exposed': {
    width: 2,
    legendColors: {},
  },
  'graphs.contributing_watersheds': {},
  'graphs.sediment_exposure_historical': {},
  'graphs.sediment_load_historical': {},
}
