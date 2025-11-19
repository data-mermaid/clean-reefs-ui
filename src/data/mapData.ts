import {
  ATLAS_BENTHIC_URL,
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

export const atlasBenthicCategories = {
  reef_extent: '#B2084C80',
  coral_algae: '#CC6677',
  seagrass: '#117733',
  microalgal_mats: '#44AA99',
  rock: '#88CCEE',
  rubble: '#332288',
  sand: '#DECC77',
}

export const atlasBenthicLayers = [
  {
    layerId: 'reef_extent',
    legendColor: '#B2084C80',
    isLayerOn: true,
  },
  {
    layerId: 'coral_algae',
    legendColor: '#CC6677',
    isLayerOn: true,
  },
  {
    layerId: 'seagrass',
    legendColor: '#117733',
    isLayerOn: true,
  },
  {
    layerId: 'microalgal_mats',
    legendColor: '#44AA99',
    isLayerOn: true,
  },
  {
    layerId: 'rock',
    legendColor: '#88CCEE',
    isLayerOn: true,
  },
  {
    layerId: 'rubble',
    legendColor: '#332288',
    isLayerOn: true,
  },
  {
    layerId: 'sand',
    legendColor: '#DECC77',
    isLayerOn: true,
  },
]

export const benthicFillColor = [
  'case',
  ['==', ['get', 'class_name'], 'Coral/Algae'],
  atlasBenthicCategories['coral_algae'],
  ['==', ['get', 'class_name'], 'Benthic Microalgae'],
  atlasBenthicCategories['microalgal_mats'],
  ['==', ['get', 'class_name'], 'Rock'],
  atlasBenthicCategories['rock'],
  ['==', ['get', 'class_name'], 'Rubble'],
  atlasBenthicCategories['rubble'],
  ['==', ['get', 'class_name'], 'Sand'],
  atlasBenthicCategories['sand'],
  ['==', ['get', 'class_name'], 'Seagrass'],
  atlasBenthicCategories['seagrass'],
  atlasBenthicCategories['reef_extent'], // Default / other
]

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

export const parentLayerTitles = {
  landPollution: 'map_layer_groups.land_pollution_layers',
  oceanPollution: 'map_layer_groups.ocean_pollution_layers',
  landcover: 'map_layer_groups.land_use_cover',
  boundaries: 'map_layer_groups.boundaries',
  benthic: 'map_layer_groups.benthic_layers',
  // base: 'map_layer_groups.base_map',
}

export const layers: LayerInfo[] = [
  {
    dataType: 'pmtiles',
    isLayerOn: false, //TEMP true,
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
    isLayerOn: false, //TEMP
    layerId: 'countries',
    link: COUNTRIES_PMTILES_URL,
    outlineColor: '#FF0000',
    parentLayerType: 'boundaries',
    sourceId: 'countries_src',
    sourceName: 'countries',
    title: 'boundary_map_layers.country_boundaries',
  },
  {
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
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
    dataType: 'rastertiles',
    isLayerOn: false,
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
    sourceId: 'atlas-benthic',
    dataType: 'vectortiles',
    isLayerOn: true,
    layerId: 'atlas-benthic',
    legendType: 'benthic',
    link: ATLAS_BENTHIC_URL,
    parentLayerType: 'benthic',
    sourceName: 'benthic',
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
