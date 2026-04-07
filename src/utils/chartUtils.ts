import i18next from 'i18next'
import { ChartData, ChartProperties, ChartSeriesName } from '../types/ChartDataTypes'
import { ZonalStatsBand } from '../types/MapDataTypes'
import { chartSeriesConfig } from '../data/chartSeriesData'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { Dispatch, SetStateAction } from 'react'
import { PlotData } from 'plotly.js'

//'Built_pct_2000': val --> 'built_up': {{"2015": val}, {"2005": val}, ...}
const areaRegex = new RegExp(/.*(area_ha)_\d{4}/, 'gm')

export interface LulcAndSedimentSeriesData {
  land_use_historical: {
    bare_ground: object
    built_up: object
    cropland: object
    high_canopy_forest: object
    mixed_forest: object
    shrubland_grassland: object
  }
  sediment_load_historical: {
    sediment: object
  }
}

//The boundary PM tiles layers include data for land_use_historical and sediment_load_historical
export const getBoundaryFileChartData = (pointProperties): LulcAndSedimentSeriesData => {
  const chartSeriesData: LulcAndSedimentSeriesData = {
    land_use_historical: {
      bare_ground: {},
      built_up: {},
      cropland: {},
      high_canopy_forest: {},
      mixed_forest: {},
      shrubland_grassland: {},
    },
    sediment_load_historical: {
      sediment: {},
    },
  }

  for (const point in pointProperties) {
    const val = pointProperties[point]
    if (
      ['TERRITORY1', 'UN_TER1', 'total_area_ha', 'area_ha', 'name', 'watershed_id'].includes(
        point,
      ) ||
      point.match(areaRegex)
    ) {
      continue
    } else {
      //get the year
      const yearIndex = point.indexOf('2')
      const year = yearIndex > -1 ? point.substring(yearIndex) : '0'

      const categoryString = point.split('2')
      switch (categoryString[0]) {
        case 'Bare_Gr_pct_':
          chartSeriesData.land_use_historical.bare_ground[year] = val
          break
        case 'Built_pct_':
          chartSeriesData.land_use_historical.built_up[year] = val
          break
        case 'Crop_pct_':
          chartSeriesData.land_use_historical.cropland[year] = val
          break
        case 'HC_Forest_pct_':
          chartSeriesData.land_use_historical.high_canopy_forest[year] = val
          break
        case 'M_Forest_pct_':
          chartSeriesData.land_use_historical.mixed_forest[year] = val
          break
        case 'Shrub_Grass_pct_':
          chartSeriesData.land_use_historical.shrubland_grassland[year] = val
          break
        case 'sed_export_':
          chartSeriesData.sediment_load_historical.sediment[year] = val
          break
      }
    }
  }
  return chartSeriesData
}
type PlumeStatsEntries = [string, ZonalStatsBand][]

export const mapChartConfigToPlumeData = (
  plumeStatsValue: PlumeStatsEntries,
): ChartProperties[] => {
  const sedimentChartName = 'sediment_exposure_historical'
  const sedimentConfig = chartSeriesConfig[`charts.${sedimentChartName}`]
  const sedXAxisTitle = i18next.t(sedimentConfig.xAxisTitle)

  const watershedsChartName = 'contributing_watersheds'
  const watershedConfig = chartSeriesConfig[`charts.${watershedsChartName}`]
  const watershedXAxisTitle = i18next.t(watershedConfig.xAxisTitle)

  const watershedBandMap: Record<string, string> = {
    w1: 'band_5',
    w2: 'band_6',
    w3: 'band_7',
  }

  const sedimentTraceName = i18next.t('land_types.sediment')
  const sedimentBar: Partial<PlotData>[] = [
    {
      type: 'bar',
      marker: { color: sedimentConfig.legendColors.sediment },
      hovertemplate: `${sedXAxisTitle}: %{x}<br />${sedimentTraceName}: %{y:.2f}T<extra></extra>`,
      name: sedimentTraceName,
      width: sedimentConfig.width,
      x: plumeStatsValue.map(([year]) => year),
      y: plumeStatsValue.map(([, stats]) => stats?.band_1?.majority ?? 0),
    },
  ]

  const watershedBars: Partial<PlotData>[] = Object.entries(watershedBandMap)
    .reverse()
    .map(([key, band]) => {
      const name = i18next.t(`charts.${key}`)
      const polutionPercentage = i18next.t('chart_information.pollution')

      return {
        type: 'bar',
        marker: { color: watershedConfig.legendColors[key] },
        hovertemplate: `${watershedXAxisTitle}: %{x}<br />${polutionPercentage}: %{y}%<extra></extra>`,
        name,
        width: watershedConfig.width,
        x: plumeStatsValue.map(([year]) => year),
        y: plumeStatsValue.map(([, stats]) => stats?.[band]?.majority ?? 0),
      }
    })

  return [
    {
      barmode: sedimentConfig.barmode ?? 'group',
      chartName: i18next.t(sedimentChartName),
      chartSeriesData: sedimentBar,
      xAxisTitle: sedXAxisTitle,
      yAxisTitle: i18next.t(sedimentConfig.yAxisTitle),
    },
    {
      barmode: watershedConfig.barmode ?? 'stack',
      chartName: i18next.t(watershedsChartName),
      chartSeriesData: watershedBars,
      xAxisTitle: watershedXAxisTitle,
      yAxisTitle: i18next.t(watershedConfig.yAxisTitle),
    },
  ]
}

export const updatePlumeChartData = (
  plumeStats: Record<string, ZonalStatsBand>,
  setChartData: Dispatch<SetStateAction<ChartProperties[] | null>>,
) => {
  const plumeStatsValue: PlumeStatsEntries = Object.entries(plumeStats)
  const plumeMappedData = mapChartConfigToPlumeData(plumeStatsValue)
  setChartData(plumeMappedData)
}

export const mapChartConfigToData = (
  sortedProperties: ChartData,
  chartName: ChartSeriesName,
): ChartProperties => {
  const chartProperties = chartSeriesConfig[`charts.${chartName}`]
  const xAxisTitle = i18next.t(chartProperties.xAxisTitle)
  const chartSeriesData: Partial<PlotData>[] = []

  // Sort values by year within category
  Object.entries(sortedProperties).forEach(([category, yearData]) => {
    const sortedYears = Object.keys(yearData).sort((a, b) => Number(a) - Number(b))

    const prefixedTrace = chartProperties.tracePrefix
      ? `${chartProperties.tracePrefix}.${category}`
      : `${category}`
    const traceName: string = i18next.t(prefixedTrace)
    const hoverTemplate =
      chartName === 'sediment_load_historical'
        ? `${xAxisTitle}: %{x}<br />${traceName}: %{y:.2f}T<extra></extra>`
        : `${xAxisTitle}: %{x}<br />${traceName}: %{y}%<extra></extra>`

    chartSeriesData.push({
      type: 'bar',
      x: sortedYears,
      y:
        chartName === 'sediment_load_historical'
          ? sortedYears.map((year) => yearData[year] / 1000000)
          : sortedYears.map((year) => yearData[year]),
      name: i18next.t(prefixedTrace),
      marker: {
        color: chartProperties.legendColors[category],
      },
      hovertemplate: hoverTemplate,
      width: chartProperties.width,
    })
  })
  return {
    barmode: chartProperties.barmode || 'group',
    chartName: chartName,
    chartSeriesData: chartSeriesData,
    xAxisTitle: xAxisTitle,
    yAxisTitle: i18next.t(chartProperties.yAxisTitle),
  } as ChartProperties
}

export const buildChartDataFromProperties = (
  properties: Record<string, unknown>,
): ChartProperties[] | null => {
  const chartSeriesData = getBoundaryFileChartData(properties)

  const hasData = Object.values(chartSeriesData).some((series) =>
    Object.values(series as Record<string, object>).some(
      (yearData) => Object.keys(yearData).length > 0,
    ),
  )
  if (!hasData) {
    return null
  }

  return Object.entries(chartSeriesData).map((dataSet) =>
    mapChartConfigToData(dataSet[1] as ChartData, dataSet[0] as ChartSeriesName),
  )
}

export const updateChartData = (
  feature: MapGeoJSONFeature,
  setChartData: Dispatch<SetStateAction<ChartProperties[] | null>>,
) => {
  let properties: Record<string, unknown> | undefined
  //1. get data from appropriate source
  if (['countries_src', 'regions_src', 'watershed_src'].includes(feature.source)) {
    properties = feature.properties as Record<string, unknown>
    //more sources to go here
  }
  if (!properties) {
    setChartData(null)
    return
  }

  const mappedData = buildChartDataFromProperties(properties)

  //3. set data
  setChartData(mappedData)
}
