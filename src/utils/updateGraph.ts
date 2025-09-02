import { graphLayoutConfig } from '../data/mapData'

export interface GraphData {
  [name: string]: Record<string, number>
}

//'Built_pct_2000': val --> 'built_up': {{"2015": val}, {"2005": val}, ...}
const sedRegex = new RegExp(/sed_export_\d{4}/, 'gm')
const areaRegex = new RegExp(/.*(area_ha)_\d{4}/, 'gm')

export const updateGraph = (pointProperties) => {
  //group data by type
  const mappedGraphData = {
    bare_ground: {},
    built_up: {},
    cropland: {},
    high_canopy_forest: {},
    mixed_forest: {},
    shrubland_grassland: {},
    surface_water: {},
  }
  for (const point in pointProperties) {
    const val = pointProperties[point]
    if (
      ['TERRITORY1', 'UN_TER1', 'total_area_ha', 'area_ha', 'name', 'watershed_id'].includes(
        point,
      ) ||
      point.match(sedRegex) ||
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
          mappedGraphData.bare_ground[year] = val
          break
        case 'Built_pct_':
          mappedGraphData.built_up[year] = val
          break

        case 'Crop_pct_':
          mappedGraphData.cropland[year] = val
          break

        case 'HC_Forest_pct_':
          mappedGraphData.high_canopy_forest[year] = val
          break

        case 'M_Forest_pct_':
          mappedGraphData.mixed_forest[year] = val
          break

        case 'Shrub_Grass_pct_':
          mappedGraphData.shrubland_grassland[year] = val
          break

        case 'Water_pct_':
          mappedGraphData.surface_water[year] = val
          break
      }
    }
  }
  return setGraphData(mappedGraphData)
}

export interface ChartedData {
  x: string[]
  y: number[]
  type: 'bar'
  name: string
  marker?: object
  width: number
}
export const setGraphData = (sortedProperties: GraphData) => {
  const chartData: ChartedData[] = []

  // Sort values by year within category
  Object.entries(sortedProperties).forEach(([category, yearData]) => {
    const sortedYears = Object.keys(yearData).sort((a, b) => Number(a) - Number(b))

    chartData.push({
      x: sortedYears,
      y: sortedYears.map((year) => yearData[year]),
      name: category,
      type: 'bar',
      marker: {
        color: graphLayoutConfig['graphs.land_use_historical'].legendColors[category],
      },
      width: 3, //todo: update width according to graph type
    })
  })
  return chartData
}
