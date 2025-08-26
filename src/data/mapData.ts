import {
  LULC_2000_TILES_URL,
  REGIONS_PMTILES_URL,
  COUNTRIES_PMTILES_URL,
  WATERSHED_PMTILES_URL,
  GLOBAL_LULC_PMTILES_URL,
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

//Boolean flags to represent if the individual layer is on or not
//Current layers include: Regions
export const layers: LayerInfo[] = [
  {
    sourceId: 'regions_src',
    sourceName: 'regions',
    layerId: 'regions',
    link: REGIONS_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: true,
    title: '',
  },
  {
    sourceId: 'lulc_src',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2000_TILES_URL,
    dataType: 'tiles',
    isLayerOn: false,
    title: '',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'EEZ_land_union_v4_202410',
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: '',
  },
  {
    sourceId: 'watershed_src',
    sourceName: '',
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: '',
  },
  {
    sourceId: 'global_lulc_src',
    sourceName: 'Central_Indo_Pacific_LULC_SDR',
    layerId: 'global_lulc',
    link: GLOBAL_LULC_PMTILES_URL,
    dataType: 'pmtiles',
    isLayerOn: false,
    title: '',
  },
]
