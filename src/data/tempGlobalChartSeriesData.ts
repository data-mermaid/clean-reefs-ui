import { ChartProperties } from '../types/ChartDataTypes'
import tempSedimentLoadChartData from './tempSedimentLoadChartData.json'
import tempContributingWatershedsChartData from './tempContributingWatershedsChartData.json'
import tempEcosystemExtentExposedChartData from './tempEcosystemExtentExposedChartData.json'
import tempSedimentExposureChartData from './tempSedimentExposureChartData.json'
import tempLandUseChartData from './tempLandUseChartData.json'
import { PlotData } from 'plotly.js'

export const tempGlobalChartSeriesData: ChartProperties[] = [
  {
    barmode: 'stack',
    chartName: 'land_use_historical',
    chartSeriesData: tempLandUseChartData as Partial<PlotData>[],
    tracePrefix: '',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.land_cover_pct',
  },
  {
    barmode: 'group',
    chartName: 'sediment_exposure_historical',
    chartSeriesData: tempSedimentExposureChartData as Partial<PlotData>[],
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
  },
  {
    barmode: 'group',
    chartName: 'ecosystem_extent_exposed',
    chartSeriesData: tempEcosystemExtentExposedChartData as Partial<PlotData>[],
    tracePrefix: 'benthic_map_layers',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.area_exposed_ha',
  },
  {
    barmode: 'group',
    chartName: 'sediment_load_historical',
    chartSeriesData: tempSedimentLoadChartData as Partial<PlotData>[],
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.sediment_exposure',
  },
  {
    barmode: 'stack',
    chartName: 'contributing_watersheds',
    chartSeriesData: tempContributingWatershedsChartData as Partial<PlotData>[],
    tracePrefix: 'benthic_map_layers',
    xAxisTitle: 'year',
    yAxisTitle: 'chart_information.pollution_contribution',
  },
]
