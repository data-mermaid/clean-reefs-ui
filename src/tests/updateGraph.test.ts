//updateGraphData
//test: data is grouped by type
//test: grouped data is sorted by year

//setGraphData
//test: data formatted is in the correct format //ts?
//test: data has a width
//test: failed/updated/incorrect data throws an error that will populate the page

import { updateGraph } from '../utils/updateGraph'

describe('updateGraph', () => {
  it('groups data by type and year', () => {
    const input = {
      Bare_Gr_pct_2000: 5,
      Built_pct_2000: 2,
      Crop_pct_2005: 7,
      HC_Forest_pct_2010: 3,
      M_Forest_pct_2015: 4,
      Shrub_Grass_pct_2020: 6,
      Water_pct_2000: 1,
      name: 'Test',
      watershed_id: 123,
    }

    const result = updateGraph(input)

    expect(result).toEqual({
      bare_ground: { '2000': 5 },
      built_up: { '2000': 2 },
      cropland: { '2005': 7 },
      high_canopy_forest: { '2010': 3 },
      mixed_forest: { '2015': 4 },
      shrubland_grassland: { '2020': 6 },
      surface_water: { '2000': 1 },
    })
  })
})
