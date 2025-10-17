export const chartSeriesConfig = {
  'charts.land_use_historical': {
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
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
    name: 'charts.land_use_historical',
    tracePrefix: 'land_types',
  },
  'charts.ecosystem_extent_exposed': {
    width: 2,
    legendColors: {},
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
    name: 'charts.ecosystem_extent_exposed',
    tracePrefix: '',
  },
  'charts.sediment_exposure_historical': {
    width: 2,
    legendColors: {
      sediment: '#003F5C',
    },
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
    name: 'charts.sediment_exposure_historical',
    tracePrefix: '',
  },
  'charts.sediment_load_historical': {},
  'charts.contributing_watersheds': {},
}
