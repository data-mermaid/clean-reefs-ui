export const graphChartConfig = {
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
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
    name: 'graphs.land_use_historical',
    categoryPrefix: 'land_types',
  },
  'graphs.ecosystem_extent_exposed': {
    width: 2,
    legendColors: {},
    name: 'graphs.ecosystem_extent_exposed',
    categoryPrefix: '',
  },
  'graphs.sediment_exposure_historical': {
    width: 2,
    legendColors: {
      sediment: '#003F5C',
    },
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
    name: 'graphs.sediment_exposure_historical',
    categoryPrefix: '',
  },
  //...for all graphs
}
