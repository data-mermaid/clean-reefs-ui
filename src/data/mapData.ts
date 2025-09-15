import {
  COUNTRIES_PMTILES_URL,
  LULC_2000_TILES_URL,
  REGIONS_PMTILES_URL,
  WATERSHED_PMTILES_URL,
} from '../constants'

export interface LayerInfo {
  sourceId: string
  sourceName: string //layer name defaults to the file name
  layerId: string
  link: string
  dataType: 'pmtiles' | 'tiles' | undefined
  isLayerOn: boolean
  title: string
}

export const layers: LayerInfo[] = [
  {
    sourceId: 'regions_src',
    sourceName: 'regions',
    layerId: 'regions',
    link: REGIONS_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: 'map_layers.regional_boundaries',
  },
  {
    sourceId: 'lulc_2000_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2000_TILES_URL,
    dataType: 'tiles',
    isLayerOn: false,
    title: 'map_layers.land_use_cover',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'countries',
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: 'map_layers.country_boundaries',
  },
  {
    sourceId: 'watershed_src',
    sourceName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: 'map_layers.watershed_boundaries',
  },
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
  //...for all graphs
}
