import {
  COUNTRIES_PMTILES_URL,
  LULC_2000_TILES_URL,
  REGIONS_PMTILES_URL,
  WATERSHED_PMTILES_URL,
} from '../constants'
import { ChartedData } from '../utils/updateGraph'

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
    sourceId: 'lulc_src',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2000_TILES_URL,
    dataType: 'tiles',
    isLayerOn: false,
    title: 'map_layers.land_use_cover',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'EEZ_land_union_v4_202410',
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
    isLayerOn: true,
    title: 'map_layers.watershed_boundaries',
  },
  // {
  //Uncertainty on what this data set is for..
  //   sourceId: 'global_lulc_src',
  //   sourceName: 'Central_Indo_Pacific_LULC_SDR',
  //   layerId: 'global_lulc',
  //   link: GLOBAL_LULC_PMTILES_URL,
  //   dataType: 'pmtiles',
  //   isLayerOn: false,
  //   title: '',
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
  //...for all graphs
}

export const mockGraphData: ChartedData[] = [
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [16, 14, 14, 10, 4],
    name: 'Bare Ground',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [18, 17, 16, 16, 17],
    name: 'Shrub',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [16, 14, 2, 4, 17],
    name: 'Surface water',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [3, 8, 13, 15, 20],
    name: 'Built-up',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [18, 18, 18, 17, 14],
    name: 'High canopy forest',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [15, 14, 17, 20, 18],
    name: 'Cropland',
    type: 'bar',
    width: 3,
  },
  {
    x: ['2000', '2005', '2010', '2015', '2020'],
    y: [15, 14, 12, 10, 10],
    name: 'Mixed forest',
    type: 'bar',
    width: 3,
  },
]
