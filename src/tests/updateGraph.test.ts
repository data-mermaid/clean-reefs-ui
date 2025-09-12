import { mapGraphAttributes, updateLulcGraph } from '../utils/updateGraph'
import mockOutputGraphData from './mockOutputGraphData.json'

const groupedProperties = {
  bare_ground: { '2000': 5, '2005': 7 },
  built_up: { '2000': 2 },
  cropland: { '2005': 7 },
  high_canopy_forest: { '2010': 3 },
  mixed_forest: { '2015': 4 },
  shrubland_grassland: { '2020': 6 },
  surface_water: { '2000': 1 },
}
describe('graph data utilities', () => {
  describe('updateLulcGraph', () => {
    it('groups data by type and year and filters out unused properties', () => {
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

      const result = updateLulcGraph(input)

      expect(result).toEqual(groupedProperties)
    })
  })

  describe('mapGraphAttributes', () => {
    it('maps values by year within category to associated graph attributes', () => {
      const result = mapGraphAttributes(groupedProperties)

      expect(result).toEqual(mockOutputGraphData)
    })
  })
})
