import { getBoundaryFileChartData, LulcAndSedimentSeriesData } from '../utils/chartUtils'
import { mapChartConfigToData } from '../utils/chartUtils'
import { ChartData, ChartSeriesName } from '../types/ChartDataTypes'
import { chartSeriesConfig } from '../data/chartSeriesData'
import i18next from 'i18next'

const groupedProperties: LulcAndSedimentSeriesData = {
  land_use_historical: {
    bare_ground: { '2000': 5, '2005': 7 },
    built_up: { '2000': 2 },
    cropland: { '2005': 7 },
    high_canopy_forest: { '2010': 3 },
    mixed_forest: { '2015': 4 },
    shrubland_grassland: { '2020': 6 },
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
// const singleSeriesChartData = {
//   bare_ground: { '2000': 5, '2005': 7 },
//   built_up: { '2005': 4, '2000': 2 },
//   cropland: { '2005': 7 },
//   high_canopy_forest: { '2010': 3 },
//   mixed_forest: { '2015': 4 },
//   shrubland_grassland: { '2020': 6 },
//   surface_water: { '2000': 1 },
// }
const emptyChartSeriesData: LulcAndSedimentSeriesData = {
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

// const emptyChartConfig = {
//   xAxisTitle: 'Year',
//   yAxisTitle: 'Percentage of Area (%)',
//   chartName: 'land_use_historical',
//   chartSeriesData: [],
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

jest.mock('i18next')
jest.mock('../data/chartSeriesData')

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

  // describe('mapChartConfigToData', () => {
  // it('maps values by year within category to associated chart attributes', () => {
  //   const result = mapChartConfigToData(singleSeriesChartData, 'land_use_historical')
  //
  //   expect(result).toEqual(mockChartConfig)
  // })
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
  // })

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

  describe('mapChartConfigToData', () => {
    const mockChartSeriesConfig = {
      'charts.land_use_historical': {
        xAxisTitle: 'chart_information.year',
        yAxisTitle: 'chart_information.land_cover',
        legendColors: {
          bare_ground: '#D4A373',
          cropland: '#FFD700',
        },
        width: 0.8,
        barmode: 'stack',
        tracePrefix: 'land_use',
      },
      'charts.sediment_load_historical': {
        xAxisTitle: 'chart_information.year',
        yAxisTitle: 'chart_information.sediment_export',
        legendColors: {
          sediment: '#8B4513',
        },
        width: 0.6,
        barmode: 'group',
      },
      'charts.test_no_barmode': {
        xAxisTitle: 'chart_information.year',
        yAxisTitle: 'chart_information.test',
        legendColors: {
          test_category: '#000000',
        },
        width: 0.5,
      },
    }

    beforeEach(() => {
      jest.clearAllMocks()

      Object.assign(chartSeriesConfig, mockChartSeriesConfig)

      const mockTranslate = jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'chart_information.year': 'Year',
          'chart_information.land_cover': 'Land cover (%)',
          'chart_information.sediment_export': 'Sediment export',
          'chart_information.test': 'Test',
          'land_use.bare_ground': 'Bare ground',
          'land_use.cropland': 'Cropland',
          bare_ground: 'Bare ground',
          cropland: 'Cropland',
          sediment: 'Sediment',
          test_category: 'Test category',
        }
        return translations[key] || key
      })

      // @ts-expect-error something about mocking
      i18next.t = mockTranslate
    })

    describe('basic functionality', () => {
      it('should transform chart data correctly with sorted years', () => {
        const mockData: ChartData = {
          bare_ground: {
            '2020': 15,
            '2010': 10,
            '2015': 12,
          },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartName).toBe('land_use_historical')
        expect(result.chartSeriesData).toHaveLength(1)
        expect(result.chartSeriesData[0].x).toEqual(['2010', '2015', '2020'])
        expect(result.chartSeriesData[0].y).toEqual([10, 12, 15])
      })

      it('should handle multiple categories', () => {
        const mockData: ChartData = {
          bare_ground: {
            '2020': 15,
            '2010': 10,
          },
          cropland: {
            '2020': 25,
            '2010': 20,
          },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData).toHaveLength(2)
        expect(result.chartSeriesData[0].name).toBe('Bare ground')
        expect(result.chartSeriesData[1].name).toBe('Cropland')
      })
    })

    describe('barmode handling', () => {
      it('should use chartProperties.barmode when available', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.barmode).toBe('stack')
      })

      it('should fall back to "group" when barmode is not specified', () => {
        const mockData: ChartData = {
          test_category: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'test_no_barmode' as ChartSeriesName)

        expect(result.barmode).toBe('group')
      })
    })

    describe('sediment_load_historical special handling', () => {
      it('should divide values by 1000000 for sediment data', () => {
        const mockData: ChartData = {
          sediment: {
            '2020': 5000000,
            '2015': 3000000,
          },
        }

        const result = mapChartConfigToData(mockData, 'sediment_load_historical')

        expect(result.chartSeriesData[0].y).toEqual([3, 5])
      })

      it('should use tonnage format in hover template for sediment', () => {
        const mockData: ChartData = {
          sediment: { '2020': 1000000 },
        }

        const result = mapChartConfigToData(mockData, 'sediment_load_historical')

        expect(result.chartSeriesData[0].hovertemplate).toContain('%{y:.2f}T')
        expect(result.chartSeriesData[0].hovertemplate).not.toContain('%{y}%')
      })

      it('should use percentage format in hover template for non-sediment charts', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData[0].hovertemplate).toContain('%{y}%')
        expect(result.chartSeriesData[0].hovertemplate).not.toContain('%{y:.2f}T')
      })
    })

    describe('tracePrefix handling', () => {
      it('should prefix trace names when tracePrefix is defined', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(i18next.t).toHaveBeenCalledWith('land_use.bare_ground')
        expect(result.chartSeriesData[0].name).toBe('Bare ground')
      })

      it('should use category name directly when tracePrefix is not defined', () => {
        const mockData: ChartData = {
          sediment: { '2020': 1000000 },
        }

        const result = mapChartConfigToData(mockData, 'sediment_load_historical')

        expect(i18next.t).toHaveBeenCalledWith('sediment')
        expect(result.chartSeriesData[0].name).toBe('Sediment')
      })
    })

    describe('chart properties configuration', () => {
      it('should apply correct marker colors from legendColors', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
          cropland: { '2020': 25 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData[0].marker?.color).toBe('#D4A373')
        expect(result.chartSeriesData[1].marker?.color).toBe('#FFD700')
      })

      it('should apply correct width from chartProperties', () => {
        const mockData: ChartData = {
          sediment: { '2020': 1000000 },
        }

        const result = mapChartConfigToData(mockData, 'sediment_load_historical')

        expect(result.chartSeriesData[0].width).toBe(0.6)
      })
    })

    describe('translation handling', () => {
      it('should translate axis titles', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.xAxisTitle).toBe('Year')
        expect(result.yAxisTitle).toBe('Land cover (%)')
        expect(result.chartSeriesData[0].hovertemplate).toContain('Year: %{x}')
        expect(result.chartSeriesData[0].hovertemplate).toContain('Bare ground: %{y}%')
      })
    })

    describe('edge cases', () => {
      it('should handle empty year data gracefully', () => {
        const mockData: ChartData = {
          bare_ground: {},
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData).toHaveLength(1)
        expect(result.chartSeriesData[0].x).toEqual([])
        expect(result.chartSeriesData[0].y).toEqual([])
      })

      it('should handle single year data', () => {
        const mockData: ChartData = {
          bare_ground: { '2020': 15 },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData[0].x).toEqual(['2020'])
        expect(result.chartSeriesData[0].y).toEqual([15])
      })

      it('should correctly sort years with different digit counts', () => {
        const mockData: ChartData = {
          bare_ground: {
            '2020': 15,
            '2005': 8,
            '2015': 12,
            '2000': 5,
          },
        }

        const result = mapChartConfigToData(mockData, 'land_use_historical')

        expect(result.chartSeriesData[0].x).toEqual(['2000', '2005', '2015', '2020'])
        expect(result.chartSeriesData[0].y).toEqual([5, 8, 12, 15])
      })
    })
  })
})
