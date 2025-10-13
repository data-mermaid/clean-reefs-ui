import { getBoundaryFileChartData, mapChartConfigToData } from '../utils/chartUtils'
import { mockChartConfig } from './mockChartConfig'

const groupedProperties = {
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

const singularChartDataGroup = {
  bare_ground: { '2000': 5, '2005': 7 },
  built_up: { '2000': 2, '2005': 4 },
  cropland: { '2005': 7 },
  high_canopy_forest: { '2010': 3 },
  mixed_forest: { '2015': 4 },
  shrubland_grassland: { '2020': 6 },
  surface_water: { '2000': 1 },
}
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
  })

  describe('mapChartConfigToData', () => {
    it('maps values by year within category to associated chart attributes', () => {
      const result = mapChartConfigToData(singularChartDataGroup, 'land_use_historical')

      expect(result).toEqual(mockChartConfig)
    })
  })
})
