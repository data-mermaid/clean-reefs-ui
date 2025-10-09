import {
  COUNTRIES_PMTILES_URL,
  LULC_2000_URL,
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
    isLayerOn: true,
    title: 'map_layers.regional_boundaries',
  },
  {
    sourceId: 'lulc_2000_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2000_URL,
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
  // { //todo: request optimized data layer
  //   sourceId: 'aca_benthic_visual',
  //   sourceName: '',
  //   layerId: 'aca-benthic',
  //   link: ACA_BENTHIC_URL,
  //   dataType: 'tiles',
  //   isLayerOn: false,
  //   title: 'Benthic',
  // },
]
