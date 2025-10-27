interface ChartSeriesConfig {
  [chartName: string]: {
    width?: number
    legendColors: {
      [category: string]: string
    }
    xAxisTitle?: string
    yAxisTitle?: string
    name?: string
    tracePrefix?: string
    barmode?: 'stack' | 'group'
    barcornerradius?: number
  }
}

export const chartSeriesConfig: ChartSeriesConfig = {
  'charts.land_use_historical': {
    barmode: 'stack',
    legendColors: {
      bare_ground: '#FEFECC',
      shrubland_grassland: '#B0B006',
      mixed_forest: '#609C30',
      high_canopy_forest: '#065106',
      surface_water: '#0E39D6',
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
    barcornerradius: 15,
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
  'charts.sediment_exposure_historical': {
    barmode: 'group',
    legendColors: {
      sediment: '#003F5C',
    },
    name: 'charts.sediment_exposure_historical',
    tracePrefix: '',
    width: 2,
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
  },
}
