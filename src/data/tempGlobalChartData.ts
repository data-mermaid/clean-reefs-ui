import { ChartProperties } from '../types/ChartDataTypes'
import tempEcosystemExtentExposedChartData from './tempEcosystemExtentExposedChartData.json'
import tempSedimentExposureChartData from './tempSedimentExposureChartData.json'
import mockChartData from '../tests/mockChartData.json'
import { PlotData } from 'plotly.js'

export const tempGlobalChartData: ChartProperties[] = [
  {
    barcornerradius: 10,
    barmode: 'stack',
    chartName: 'land_use_historical',
    chartSeriesData: mockChartData as Partial<PlotData>[],
    tracePrefix: '',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
  },
  {
    barmode: 'group',
    chartName: 'sediment_exposure_historical',
    chartSeriesData: tempSedimentExposureChartData as Partial<PlotData>[],
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
  },
  {
    barmode: 'group',
    chartName: 'ecosystem_extent_exposed',
    chartSeriesData: tempEcosystemExtentExposedChartData as Partial<PlotData>[],
    tracePrefix: 'benthic_map_layers',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
  },
]
