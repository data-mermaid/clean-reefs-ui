import {
  ACA_BENTHIC_URL,
  COUNTRIES_PMTILES_URL,
  LULC_2000_URL,
  LULC_2005_URL,
  LULC_2010_URL,
  LULC_2015_URL,
  LULC_2020_URL,
  REGIONS_PMTILES_URL,
  SED_EXPORT_2000_URL,
  SED_EXPORT_2005_URL,
  SED_EXPORT_2010_URL,
  SED_EXPORT_2015_URL,
  SED_EXPORT_2020_URL,
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
  scaleVariation?: string
  legendType?: 'gradient' | 'lulc'
  year?: 2000 | 2005 | 2010 | 2015 | 2020
}

export const parentLayerTitles = {
  landPollution: 'map_layer_groups.land_pollution_layers',
  oceanPollution: 'map_layer_groups.ocean_pollution_layers',
  landcover: 'map_layer_groups.land_use_cover',
  boundaries: 'map_layer_groups.boundaries',
  benthic: 'map_layer_groups.benthic_layers',
  base: 'map_layer_groups.base_map',
}

export const layers: LayerInfo[] = [
  {
    sourceId: 'regions_src',
    sourceName: 'regions',
    layerId: 'regions',
    link: REGIONS_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: true,
    title: 'boundary_map_layers.regional_boundaries',
  },
  {
    sourceId: 'countries_src',
    sourceName: 'countries',
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: true,
    title: 'boundary_map_layers.country_boundaries',
  },
  {
    sourceId: 'watershed_src',
    sourceName: 'Fiji+Solomons_watershed_LULC_SDR_v2',
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    dataType: 'pmtiles',
    parentLayerType: 'boundaries',
    isLayerOn: true,
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
    legendType: 'lulc',
    year: 2000,
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
    legendType: 'lulc',
    year: 2005,
  },
  {
    sourceId: 'lulc_2010_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2010_URL,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    legendType: 'lulc',
    title: 'map_layer_groups.land_use_cover',
    year: 2010,
  },
  {
    sourceId: 'lulc_2015_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2015_URL,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    legendType: 'lulc',
    title: 'map_layer_groups.land_use_cover',
    year: 2015,
  },
  {
    sourceId: 'lulc_2020_visual',
    sourceName: '',
    layerId: 'lulc',
    link: LULC_2020_URL,
    dataType: 'tiles',
    parentLayerType: 'landcover',
    isLayerOn: false,
    legendType: 'lulc',
    title: 'map_layer_groups.land_use_cover',
    year: 2020,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2000_URL,
    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2000_visual',
    sourceName: '',
    title: 'sediment_export',
    year: 2000,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2005_URL,
    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2005_visual',
    sourceName: '',
    title: 'sediment_export',
    year: 2005,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2010_URL,
    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2010_visual',
    sourceName: '',
    title: 'sediment_export',
    year: 2010,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2015_URL,

    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2015_visual',
    sourceName: '',
    title: 'sediment_export',
    year: 2015,
  },
  {
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2020_URL,
    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2020_visual',
    sourceName: '',
    title: 'sediment_export',
    year: 2020,
  },
  {
    sourceId: 'aca_benthic_visual',
    sourceName: '',
    layerId: 'aca-benthic',
    link: ACA_BENTHIC_URL,
    dataType: 'tiles',
    parentLayerType: 'benthic',
    isLayerOn: false,
    title: 'Benthic',
  },
]
