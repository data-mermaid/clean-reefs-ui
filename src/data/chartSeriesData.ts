import { ChartSeriesConfig, ChartSeriesName } from '../types/ChartDataTypes'
import { RegionType } from '../types/RegionDataTypes'

export const chartSeriesConfig: ChartSeriesConfig = {
  'charts.land_use_historical': {
    barmode: 'stack',
    legendColors: {
      bare_ground: '#FEFECC',
      shrubland_grassland: '#B0B006',
      mixed_forest: '#609C30',
      high_canopy_forest: '#065106',
      cropland: '#FF7D00',
      built_up: '#64DCDC',
    },
    name: 'charts.land_use_historical',
    tracePrefix: 'land_types',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
    width: 2,
  },
  'charts.ecosystem_extent_exposed': {
    barmode: 'group',
    legendColors: {
      reef_extent: '#FB9A99',
      coral_algae: '#003F5C',
      seagrass: '#FFA600',
    },
    name: 'charts.ecosystem_extent_exposed',
    tracePrefix: 'benthic_map_layers',
    width: 1,
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
  },
  'charts.sediment_load_historical': {
    barmode: 'group',
    legendColors: {
      sediment: '#003F5C',
    },
    name: 'charts.sediment_load_historical',
    tracePrefix: '',
    width: 2,
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_load',
  },
  //specific to Ocean Pollution, should only populate when watershed is selected
  'charts.sediment_exposure_historical': {
    legendColors: {
      sediment: '#E7CC11',
    },
    name: 'charts.sediment_exposure_historical',
    tracePrefix: '',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
    width: 3,
  },
  'charts.contributing_watersheds': {
    barmode: 'stack',
    legendColors: {
      w1: '#FFA600',
      w2: '#D86D83',
      w3: '#7A5195',
      w4: '#003F5C',
    },
    name: 'charts.contributing_watersheds',
    tracePrefix: '',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.pollution_contribution',
    width: 3,
  },
}

const sharedCharts: ChartSeriesName[] = [
  'land_use_historical',
  'ecosystem_extent_exposed',
  'sediment_load_historical',
]

export const chartsByRegionType: Record<RegionType, ChartSeriesName[]> = {
  global: sharedCharts,
  country: sharedCharts,
  region: sharedCharts,
  watershed: sharedCharts,
  plume: [...sharedCharts, 'sediment_exposure_historical', 'contributing_watersheds'],
}
