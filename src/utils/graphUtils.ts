// import { graphChartConfig } from '../data/mapData'
import i18next from 'i18next'
import { PlotlyData, GraphChartConfig, GraphData, GraphType } from '../types/GraphDataTypes'
import { graphChartConfig } from '../data/graphData'

//'Built_pct_2000': val --> 'built_up': {{"2015": val}, {"2005": val}, ...}
const areaRegex = new RegExp(/.*(area_ha)_\d{4}/, 'gm')

//These attributes all pull from boundary layers, so we can map them simultaneously
export const getBoundaryFileGraphData = (pointProperties) => {
  //group data by type
  const graphData = {
    land_use_historical: {
      bare_ground: {},
      built_up: {},
      cropland: {},
      high_canopy_forest: {},
      mixed_forest: {},
      shrubland_grassland: {},
      surface_water: {},
    },
    sediment_exposure_historical: {
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
          graphData.land_use_historical.bare_ground[year] = val
          break
        case 'Built_pct_':
          graphData.land_use_historical.built_up[year] = val
          break
        case 'Crop_pct_':
          graphData.land_use_historical.cropland[year] = val
          break
        case 'HC_Forest_pct_':
          graphData.land_use_historical.high_canopy_forest[year] = val
          break
        case 'M_Forest_pct_':
          graphData.land_use_historical.mixed_forest[year] = val
          break
        case 'Shrub_Grass_pct_':
          graphData.land_use_historical.shrubland_grassland[year] = val
          break
        case 'Water_pct_':
          graphData.land_use_historical.surface_water[year] = val
          break
        case 'sed_export_':
          graphData.sediment_exposure_historical.sediment[year] = val
          break
      }
    }
  }
  return graphData
}

export const mapGraphAttributes = (sortedProperties: GraphData, graphType: GraphType) => {
  if (!sortedProperties) {
    return []
  }

  const graphConfig = graphChartConfig[`graphs.${graphType}`]
  const xAxisTitle = i18next.t(graphConfig.xAxisTitle)
  const graphData: PlotlyData[] = []

  // Sort values by year within category
  Object.entries(sortedProperties).forEach(([category, yearData]) => {
    const sortedYears = Object.keys(yearData).sort((a, b) => Number(a) - Number(b))

    const categoryPrefixed = graphConfig.categoryPrefix
      ? `${graphConfig.categoryPrefix}.${category}`
      : `${category}`
    const categoryName: string = i18next.t(categoryPrefixed)
    const hoverTemplate =
      graphType === 'sediment_exposure_historical'
        ? `${xAxisTitle}: %{x}<br />${categoryName}: %{y:.2f}T<extra></extra>`
        : `${xAxisTitle}: %{x}<br />${categoryName}: %{y}%<extra></extra>`

    graphData.push({
      x: sortedYears,
      y:
        graphType === 'sediment_exposure_historical'
          ? sortedYears.map((year) => yearData[year] / 1000000)
          : sortedYears.map((year) => yearData[year]),
      type: 'bar',
      name: categoryName,
      marker: {
        color: graphConfig.legendColors[category],
      },
      hovertemplate: hoverTemplate,
      width: 3,
    })
  })
  const chartConfig: GraphChartConfig = {
    xAxisTitle: xAxisTitle,
    yAxisTitle: i18next.t(graphConfig.yAxisTitle),
    graphData: graphData,
    graphType: graphConfig.name as GraphType,
  }
  return chartConfig
}

export const updateGraphData = (feature, setGraphData) => {
  let graphData
  //1. get data from appropriate source
  if (['countries_src', 'regions_src', 'watershed_src'].includes(feature.source)) {
    graphData = getBoundaryFileGraphData(feature.properties)
    //more sources to go here
  }

  //2. map data
  const mappedData = Object.entries(graphData).map((dataSet) =>
    mapGraphAttributes(dataSet[1] as GraphData, dataSet[0] as GraphType),
  )

  //3. set data
  setGraphData(mappedData)
}
