import i18next from 'i18next'
import { ChartData, ChartProperties, ChartSeriesName } from '../types/ChartDataTypes'
import { ZonalStatsBand } from '../types/MapDataTypes'
import { chartSeriesConfig } from '../data/chartSeriesData'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { Dispatch, SetStateAction } from 'react'
import type { PlotData } from 'plotly.js'
import { RegionOption, RegionType } from '../types/RegionDataTypes'

export function getRegionLabel(
  regionType: RegionType,
  selectedRegion: RegionOption,
  selectedFeature: MapGeoJSONFeature | null,
): string {
  switch (regionType) {
    case 'global':
      return ''
    case 'watershed':
      return String(selectedFeature?.id ?? '')
    default:
      return selectedRegion.label
  }
}

export function getDrawerTitle(regionType: RegionType, fallbackLabel: string): string {
  if (regionType === 'global') {
    return 'global_trends'
  }
  if (regionType === 'watershed') {
    return 'watershed_information'
  }
  if (regionType === 'dispersal') {
    return 'ocean_pollution'
  }
  return fallbackLabel
}

export function getEffectiveRegionType(
  selectedDispersalWatershedStats: Record<number, ZonalStatsBand> | null,
  selectedFeatureSource: string | undefined,
  regionType: RegionType,
): RegionType {
  if (selectedDispersalWatershedStats) {
    return 'dispersal'
  }
  if (selectedFeatureSource === 'watershed_src') {
    return 'watershed'
  }
  return regionType
}

export function getUpOneLevelLabel(regionType: RegionType, selectedRegion: RegionOption): string {
  return regionType === 'dispersal' || regionType === 'watershed'
    ? selectedRegion.label
    : i18next.t('regions.global')
}

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
  ecosystem_extent_exposed: {
    reef_extent: object
    coral_algae: object
    seagrass: object
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
    ecosystem_extent_exposed: {
      reef_extent: {},
      coral_algae: {},
      seagrass: {},
    },
    sediment_load_historical: {
      sediment: {},
    },
  }

  for (const point in pointProperties) {
    const val = pointProperties[point]
    if (
      [
        'TERRITORY1',
        'REALM',
        'REALM_ID',
        'COUNTRY_ID',
        'UN_TER1',
        'total_area_ha',
        'area_ha',
        'name',
        'watershed_id',
      ].includes(point) ||
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
        case 'reef_exposed_':
          chartSeriesData.ecosystem_extent_exposed.reef_extent[year] = val
          break
        case 'coralg_exposed_':
          chartSeriesData.ecosystem_extent_exposed.coral_algae[year] = val
          break
        case 'seag_exposed_':
          chartSeriesData.ecosystem_extent_exposed.seagrass[year] = val
          break
        case 'total_sed_load_':
          chartSeriesData.sediment_load_historical.sediment[year] = val
          break
      }
    }
  }
  return chartSeriesData
}
type DispersalStatsEntries = [string, ZonalStatsBand][]

export const mapChartConfigToDispersalData = (
  dispersalStatsValue: DispersalStatsEntries,
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
      x: dispersalStatsValue.map(([year]) => year),
      y: dispersalStatsValue.map(([, stats]) => stats?.band_1?.majority ?? 0),
    },
  ]

  const watershedBars: Partial<PlotData>[] = Object.entries(watershedBandMap)
    .reverse()
    .map(([key, band]) => {
      const name = i18next.t(`charts.${key}`)

      return {
        type: 'bar',
        marker: { color: watershedConfig.legendColors[key] },
        hovertemplate: `${watershedXAxisTitle}: %{x}<br />${name}: %{y}%<extra></extra>`,
        name,
        width: watershedConfig.width,
        x: dispersalStatsValue.map(([year]) => year),
        y: dispersalStatsValue.map(([, stats]) => stats?.[band]?.majority ?? 0),
      }
    })

  return [
    {
      barmode: sedimentConfig.barmode ?? 'group',
      chartName: sedimentChartName,
      chartSeriesData: sedimentBar,
      xAxisTitle: sedXAxisTitle,
      yAxisTitle: i18next.t(sedimentConfig.yAxisTitle),
    },
    {
      barmode: watershedConfig.barmode ?? 'stack',
      chartName: watershedsChartName,
      chartSeriesData: watershedBars,
      xAxisTitle: watershedXAxisTitle,
      yAxisTitle: i18next.t(watershedConfig.yAxisTitle),
    },
  ]
}

export const updateDispersalChartData = (
  dispersalStats: Record<string, ZonalStatsBand>,
  setChartData: Dispatch<SetStateAction<ChartProperties[] | null>>,
) => {
  const dispersalStatsValue: DispersalStatsEntries = Object.entries(dispersalStats)
  const dispersalMappedData = mapChartConfigToDispersalData(dispersalStatsValue)
  setChartData(dispersalMappedData)
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
    const unitSuffix: Record<string, string> = {
      sediment_load_historical: ':.2f}T',
      ecosystem_extent_exposed: '}ha',
    }
    const yFormat = unitSuffix[chartName] ?? '}%'
    const hoverTemplate = `${xAxisTitle}: %{x}<br />${traceName}: %{y${yFormat}<extra></extra>`

    chartSeriesData.push({
      type: 'bar',
      x: sortedYears,
      y: sortedYears.map((year) => yearData[year]),
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

  const seriesWithData = Object.entries(chartSeriesData).filter(([, series]) =>
    Object.values(series as Record<string, object>).some(
      (yearData) => Object.keys(yearData).length > 0,
    ),
  )
  if (!seriesWithData.length) {
    return null
  }

  return seriesWithData.map(([name, data]) =>
    mapChartConfigToData(data as ChartData, name as ChartSeriesName),
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

export const formatForFilename = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export const buildExportFilename = (
  regionType: string,
  regionLabel: string,
  chartTitle: string,
): string => {
  const prefixedTypes = ['global', 'watershed', 'dispersal']
  const parts: string[] = []

  if (prefixedTypes.includes(regionType)) {
    parts.push(regionType)
  }

  if (regionType !== 'global' && regionLabel) {
    parts.push(formatForFilename(regionLabel))
  }

  parts.push(formatForFilename(chartTitle))

  return parts.join('-')
}
