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

export const sedExportColorMapping = {
  '0': '#018571',
  '1-10': '#4aae9f',
  '10-20': '#91d3c8',
  '20-50': '#d4eae6',
  '50-75': '#efe6d3',
  '75-90': '#e2c98e',
  '90-100': '#c79853',
}

export const sedExportWatershedLayer = {
  id: 'sed_export_watershed',
  type: 'vector',
  source: 'watershed_src',
  'source-layer': 'sed_export',
}
export interface LayerInfo {
  isLayerOn: boolean
  layerId: string
  legendType?: 'gradient' | 'lulc'
  link: string
  dataType: 'pmtiles' | 'tiles' | undefined //pmtiles:vector, tiles:raster
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
  legendTitle?: string
  year?: 2000 | 2005 | 2010 | 2015 | 2020
}

export const parentLayerTitles = {
  landPollution: 'map_layer_groups.land_pollution_layers',
  // oceanPollution: 'map_layer_groups.ocean_pollution_layers',
  landcover: 'map_layer_groups.land_use_cover',
  boundaries: 'map_layer_groups.boundaries',
  benthic: 'map_layer_groups.benthic_layers',
  // base: 'map_layer_groups.base_map', //not part of MVP
}

export const layers: LayerInfo[] = [
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
    layerId: 'sed_export',
    legendType: 'gradient',
    link: SED_EXPORT_2000_URL,
    parentLayerType: 'landPollution',
    sourceId: 'sed_export_load_2000_visual',
    sourceName: '',
    title: 'map_layers.sediment_export',
    year: 2000,
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
    sourceId: 'sed_export_load_2000_visual',
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendTitle: 'sediment',
    legendType: 'gradient',
    link: SED_EXPORT_2000_URL,
    parentLayerType: 'landPollution',
    sourceName: '',
    title: 'sediment_export',
    year: 2000,
  },
  {
    sourceId: 'sed_export_load_2005_visual',
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendTitle: 'sediment',
    legendType: 'gradient',
    link: SED_EXPORT_2005_URL,
    parentLayerType: 'landPollution',
    sourceName: '',
    title: 'sediment_export',
    year: 2005,
  },
  {
    sourceId: 'sed_export_load_2010_visual',
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendTitle: 'sediment',
    legendType: 'gradient',
    link: SED_EXPORT_2010_URL,
    parentLayerType: 'landPollution',
    sourceName: '',
    title: 'sediment_export',
    year: 2010,
  },
  {
    sourceId: 'sed_export_load_2015_visual',
    dataType: 'tiles',
    isLayerOn: false,
    layerId: 'sed_export',
    legendTitle: 'sediment',
    legendType: 'gradient',
    link: SED_EXPORT_2015_URL,
    parentLayerType: 'landPollution',
    sourceName: '',
    title: 'sediment_export',
    year: 2015,
  },
  {
    sourceId: 'sed_export_load_2020_visual',
    dataType: 'tiles',
    isLayerOn: true,
    layerId: 'sed_export',
    legendTitle: 'sediment',
    legendType: 'gradient',
    link: SED_EXPORT_2020_URL,
    parentLayerType: 'landPollution',
    sourceName: '',
    title: 'sediment_export',
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
  {
    //keep this layer last so it's always rendered on top
    dataType: 'pmtiles',
    isLayerOn: true,
    layerId: 'watershed',
    link: WATERSHED_PMTILES_URL,
    outlineColor: '#000',
    parentLayerType: 'boundaries',
    sourceId: 'watershed_src',
    sourceName: 'watersheds',
    title: 'boundary_map_layers.watershed_boundaries',
  },
]
