import {
  getBoundaryFileChartData,
  LulcAndSedimentSeriesData,
  mapChartConfigToData,
} from '../utils/chartUtils'
import { mockChartConfig } from './mockChartConfig'

const groupedProperties: LulcAndSedimentSeriesData = {
  land_use_historical: {
    bare_ground: { '2000': 5, '2005': 7 },
    built_up: { '2000': 2 },
    cropland: { '2005': 7 },
    high_canopy_forest: { '2010': 3 },
    mixed_forest: { '2015': 4 },
    shrubland_grassland: { '2020': 6 },
    surface_water: { '2000': 1 },
  },
  sediment_exposure_historical: {
    sediment: {},
  },
}
const singleSeriesChartData = {
  bare_ground: { '2000': 5, '2005': 7 },
  built_up: { '2005': 4, '2000': 2 },
  cropland: { '2005': 7 },
  high_canopy_forest: { '2010': 3 },
  mixed_forest: { '2015': 4 },
  shrubland_grassland: { '2020': 6 },
  surface_water: { '2000': 1 },
}
const emptyChartSeriesData: LulcAndSedimentSeriesData = {
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

// const emptyChartConfig = {
//   xAxisTitle: 'Year',
//   yAxisTitle: 'Percentage of Area (%)',
//   chartSeriesName: 'land_use_historical',
//   plotlyConfigData: [],
// }
//
// const setChartData = jest.fn()
// const mockFeature: MapGeoJSONFeature = {
//   layer: {
//     source: 'watershed_src',
//   },
//   source: 'watershed_src',
//   state: {
//     '': {},
//   },
//   properties: {
//     total_area_ha: 1000,
//     Bare_Gr_pct_2000: 5,
//     Bare_Gr_pct_2005: 7,
//   },
// } as unknown
// const mockEmptyFeature: MapGeoJSONFeature = {
//   layer: {
//     source: '',
//   },
//   source: '',
//   state: {
//     '': {},
//   },
// } as unknown

describe('chart data utilities', () => {
  describe('getBoundaryFileChartData', () => {
    it('pulls data from the boundary layers, groups data by type and year and filters out unused properties', () => {
      const input = {
        Bare_Gr_pct_2000: 5,
        Bare_Gr_pct_2005: 7,
        Built_pct_2000: 2,
        Crop_pct_2005: 7,
        HC_Forest_pct_2010: 3,
        M_Forest_pct_2015: 4,
        Shrub_Grass_pct_2020: 6,
        Water_pct_2000: 1,
        name: 'Test',
        watershed_id: 123,
      }

      const result = getBoundaryFileChartData(input)

      expect(result).toEqual(groupedProperties)
    })
    it('returns empty objects if no relevant properties are found', () => {
      const result = getBoundaryFileChartData({ name: 'Test', watershed_id: 123 })

      expect(result).toEqual(emptyChartSeriesData)
    })
  })

  describe('mapChartConfigToData', () => {
    it('maps values by year within category to associated chart attributes', () => {
      const result = mapChartConfigToData(singleSeriesChartData, 'land_use_historical')

      expect(result).toEqual(mockChartConfig)
    })
    // it('skips empty traces', () => {
    //   const result = mapChartConfigToData(
    //     {
    //       land_use_historical: {
    //         bare_ground: {},
    //         built_up: {},
    //         cropland: {},
    //         high_canopy_forest: {},
    //         mixed_forest: {},
    //         shrubland_grassland: {},
    //         surface_water: {},
    //       },
    //     },
    //     'land_use_historical',
    //   )
    //
    //   expect(result).toEqual(emptyChartConfig)
    // })
  })

  // describe('updateChartData', () => {
  // it('sets the chart data correctly when data is available', () => {
  //   jest.spyOn(chartUtils, 'getBoundaryFileChartData').mockReturnValue(groupedProperties)
  //
  //   updateChartData(mockFeature, setChartData)
  //
  //   expect(actual).toHaveBeenCalledWith({
  //     total_area_ha: 1000,
  //     Bare_Gr_pct_2000: 5,
  //     Bare_Gr_pct_2005: 7,
  //   })
  //   expect(mapChartConfigToData).toHaveBeenCalled()
  //   expect(setChartData).toHaveBeenCalled()
  // })
  // it('sets the chart data as null if there is no data', () => {
  //   const result = updateChartData(mockEmptyFeature, setChartData)
  //
  //   expect(result).toBe(null)
  //   expect(mapChartConfigToData).not.toHaveBeenCalled()
  //   expect(setChartData).toHaveBeenCalledWith(null)
  // })
  // })
})
