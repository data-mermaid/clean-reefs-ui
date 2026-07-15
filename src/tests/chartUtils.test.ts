import {
  getBoundaryFileChartData,
  LulcAndSedimentSeriesData,
  mapChartConfigToData,
  formatForFilename,
  formatLegendValue,
  buildExportFilename,
  getRegionLabel,
  getDrawerTitle,
  getEffectiveRegionType,
  getUpOneLevelLabel,
  buildChartDataFromProperties,
  updateChartData,
  mapChartConfigToDispersalData,
  updateDispersalChartData,
} from '../utils/chartUtils'
import { ChartData, ChartSeriesName } from '../types/ChartDataTypes'
import { chartSeriesConfig } from '../data/chartSeriesData'
import i18next from 'i18next'
import { MapGeoJSONFeature } from 'maplibre-gl'

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
        xAxisTitle: 'year',
        yAxisTitle: 'unit_labels.land_cover_pct',
        legendColors: {
          bare_ground: '#D4A373',
          cropland: '#FFD700',
        },
        width: 0.8,
        barmode: 'stack',
        tracePrefix: 'land_use',
      },
      'charts.sediment_load_historical': {
        xAxisTitle: 'year',
        yAxisTitle: 'unit_labels.sediment_load_tons',
        legendColors: {
          sediment: '#8B4513',
        },
        width: 0.6,
        barmode: 'group',
      },
      'charts.test_no_barmode': {
        xAxisTitle: 'year',
        yAxisTitle: 'unit_labels.test',
        legendColors: {
          test_category: '#000000',
        },
        width: 0.5,
      },
    }

    beforeEach(() => {
      Object.assign(chartSeriesConfig, mockChartSeriesConfig)

      const mockTranslate = jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'year': 'Year',
          'unit_labels.land_cover_pct': 'Land cover (%)',
          'unit_labels.sediment_load_tons': 'Sediment load',
          'unit_labels.test': 'Test',
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
      it('should pass sediment values through without unit conversion', () => {
        const mockData: ChartData = {
          sediment: {
            '2020': 5000000,
            '2015': 3000000,
          },
        }

        const result = mapChartConfigToData(mockData, 'sediment_load_historical')

        expect(result.chartSeriesData[0].y).toEqual([3000000, 5000000])
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

describe('export filename utilities', () => {
  describe('formatForFilename', () => {
    it('lowercases and replaces spaces with hyphens', () => {
      expect(formatForFilename('Central Indo-Pacific')).toBe('central-indo-pacific')
      expect(formatForFilename('Solomon Islands')).toBe('solomon-islands')
    })

    it('strips non-alphanumeric characters except hyphens', () => {
      expect(formatForFilename('Sediment load (tons)')).toBe('sediment-load-tons')
    })
  })

  describe('buildExportFilename', () => {
    it('builds global filename with prefix and no region label', () => {
      expect(buildExportFilename('global', '', 'Land use')).toBe('global-land-use')
    })

    it('builds region filename without prefix', () => {
      expect(buildExportFilename('region', 'Central Indo-Pacific', 'Land use')).toBe(
        'central-indo-pacific-land-use',
      )
    })

    it('builds country filename without prefix', () => {
      expect(buildExportFilename('country', 'Fiji', 'Sediment load')).toBe('fiji-sediment-load')
    })

    it('builds watershed filename with prefix', () => {
      expect(buildExportFilename('watershed', '12345', 'Land use')).toBe('watershed-12345-land-use')
    })

    it('builds dispersal filename with prefix', () => {
      expect(buildExportFilename('dispersal', 'abc-123', 'Sediment exposure')).toBe(
        'dispersal-abc-123-sediment-exposure',
      )
    })

    it('handles chart titles with parentheses', () => {
      expect(buildExportFilename('global', '', 'Ecosystem extent exposed to pollution')).toBe(
        'global-ecosystem-extent-exposed-to-pollution',
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Shared mock config used by the new test suites below
// ---------------------------------------------------------------------------
const sharedLandUseMockConfig = {
  'charts.land_use_historical': {
    xAxisTitle: 'year',
    yAxisTitle: 'unit_labels.land_cover_pct',
    legendColors: {
      bare_ground: '#D4A373',
      cropland: '#FFD700',
    },
    width: 0.8,
    barmode: 'stack',
    tracePrefix: 'land_use',
  },
  'charts.sediment_load_historical': {
    xAxisTitle: 'year',
    yAxisTitle: 'unit_labels.sediment_load_tons',
    legendColors: { sediment: '#8B4513' },
    width: 0.6,
    barmode: 'group',
  },
  'charts.ecosystem_extent_exposed': {
    xAxisTitle: 'year',
    yAxisTitle: 'unit_labels.ecosystem_extent',
    legendColors: { reef_extent: '#0077B6', coral_algae: '#48CAE4', seagrass: '#90E0EF' },
    width: 0.8,
    barmode: 'stack',
  },
}

const sharedDispersalMockConfig = {
  'charts.sediment_exposure_historical': {
    xAxisTitle: 'year',
    yAxisTitle: 'unit_labels.sediment_exposure_tons',
    legendColors: { sediment: '#8B4513' },
    width: 0.6,
    barmode: 'group',
  },
  'charts.contributing_watersheds': {
    xAxisTitle: 'year',
    yAxisTitle: 'unit_labels.watersheds',
    legendColors: { w1: '#aabbcc', w2: '#bbccdd', w3: '#ccddee' },
    width: 0.8,
    barmode: 'stack',
  },
}

describe('getRegionLabel', () => {
  const mockRegion = { label: 'Pacific Region' } as never

  it.each([
    { regionType: 'global', feature: null, expected: '' },
    { regionType: 'watershed', feature: { id: 42 }, expected: '42' },
    { regionType: 'watershed', feature: null, expected: '' },
    { regionType: 'country', feature: null, expected: 'Pacific Region' },
    { regionType: 'region', feature: null, expected: 'Pacific Region' },
  ])('$regionType → "$expected"', ({ regionType, feature, expected }) => {
    expect(getRegionLabel(regionType as never, mockRegion, feature as never)).toBe(expected)
  })
})

describe('getDrawerTitle', () => {
  it.each([
    ['global', 'fallback', 'global_trends'],
    ['watershed', 'fallback', 'watershed_information'],
    ['dispersal', 'fallback', 'ocean_pollution'],
    ['country', 'country_details', 'country_details'],
    ['region', 'region_overview', 'region_overview'],
  ] as const)('(%s, %s) → %s', (regionType, fallback, expected) => {
    expect(getDrawerTitle(regionType, fallback)).toBe(expected)
  })
})

describe('getEffectiveRegionType', () => {
  const stats = { 1: { band_1: { majority: 5, aoi_area: 0, data_area: 0 } } }

  it.each([
    { dispersalStats: stats, source: undefined, regionType: 'region', expected: 'dispersal' },
    { dispersalStats: null, source: 'watershed_src', regionType: 'region', expected: 'watershed' },
    { dispersalStats: null, source: 'countries_src', regionType: 'region', expected: 'region' },
    { dispersalStats: null, source: undefined, regionType: 'global', expected: 'global' },
  ])(
    '(source=$source, type=$regionType) → $expected',
    ({ dispersalStats, source, regionType, expected }) => {
      expect(getEffectiveRegionType(dispersalStats as never, source, regionType as never)).toBe(
        expected,
      )
    },
  )
})

describe('getUpOneLevelLabel', () => {
  const mockRegion = { label: 'Solomon Islands' } as never

  beforeEach(() => {
    // @ts-expect-error mocking i18next.t
    i18next.t = (key: string) => key
  })

  it.each([
    ['dispersal', 'Solomon Islands'],
    ['watershed', 'Solomon Islands'],
    ['global', 'regions.global'],
    ['country', 'regions.global'],
  ] as const)('%s → "%s"', (regionType, expected) => {
    expect(getUpOneLevelLabel(regionType, mockRegion)).toBe(expected)
  })
})

describe('buildChartDataFromProperties', () => {
  beforeEach(() => {
    Object.assign(chartSeriesConfig, sharedLandUseMockConfig)
    // @ts-expect-error mocking i18next.t
    i18next.t = (key: string) => key
  })

  it('returns a ChartProperties array when properties contain recognisable LULC data', () => {
    const result = buildChartDataFromProperties({ Bare_Gr_pct_2000: 5, Bare_Gr_pct_2005: 8 })

    expect(Array.isArray(result)).toBe(true)
    expect(result).not.toBeNull()
    expect(result!.length).toBeGreaterThan(0)
    expect(result![0].chartName).toBe('land_use_historical')
  })

  it('returns null when no recognisable properties are present', () => {
    const result = buildChartDataFromProperties({ name: 'Test', watershed_id: 99 })

    expect(result).toBeNull()
  })
})

describe('updateChartData', () => {
  beforeEach(() => {
    Object.assign(chartSeriesConfig, sharedLandUseMockConfig)
    // @ts-expect-error mocking i18next.t
    i18next.t = (key: string) => key
  })

  it('calls setChartData with chart data for a recognised source', () => {
    const feature = {
      source: 'countries_src',
      properties: { Bare_Gr_pct_2000: 5 },
    } as unknown as MapGeoJSONFeature

    const setChartData = jest.fn()
    updateChartData(feature, setChartData)

    expect(setChartData).toHaveBeenCalledTimes(1)
    const arg = setChartData.mock.calls[0][0]
    expect(Array.isArray(arg)).toBe(true)
  })

  it('calls setChartData with null for an unrecognised source', () => {
    const feature = {
      source: 'unknown_src',
      properties: { Bare_Gr_pct_2000: 5 },
    } as unknown as MapGeoJSONFeature

    const setChartData = jest.fn()
    updateChartData(feature, setChartData)

    expect(setChartData).toHaveBeenCalledWith(null)
  })
})

describe('mapChartConfigToDispersalData', () => {
  const dispersalStats = {
    '2020': {
      band_1: { majority: 5, aoi_area: 0, data_area: 0 },
      band_5: { majority: 10, aoi_area: 0, data_area: 0 },
      band_6: { majority: 20, aoi_area: 0, data_area: 0 },
      band_7: { majority: 30, aoi_area: 0, data_area: 0 },
    },
  }

  beforeEach(() => {
    Object.assign(chartSeriesConfig, sharedDispersalMockConfig)
    // @ts-expect-error mocking i18next.t
    i18next.t = (key: string) => key
  })

  it('returns exactly two ChartProperties entries', () => {
    const result = mapChartConfigToDispersalData(Object.entries(dispersalStats))

    expect(result).toHaveLength(2)
  })

  it('first entry is sediment_exposure_historical with correct structure', () => {
    const result = mapChartConfigToDispersalData(Object.entries(dispersalStats))
    const sedChart = result[0]

    expect(sedChart.chartName).toBe('sediment_exposure_historical')
    expect(sedChart.chartSeriesData).toHaveLength(1)
    expect(sedChart.chartSeriesData[0].x).toEqual(['2020'])
    expect(sedChart.chartSeriesData[0].y).toEqual([5])
  })

  it('second entry is contributing_watersheds with three reversed watershed bars', () => {
    const result = mapChartConfigToDispersalData(Object.entries(dispersalStats))
    const watershedChart = result[1]

    expect(watershedChart.chartName).toBe('contributing_watersheds')
    // bands are reversed: w3 (band_7=30), w2 (band_6=20), w1 (band_5=10)
    expect(watershedChart.chartSeriesData).toHaveLength(3)
    expect(watershedChart.chartSeriesData[0].y).toEqual([30])
    expect(watershedChart.chartSeriesData[1].y).toEqual([20])
    expect(watershedChart.chartSeriesData[2].y).toEqual([10])
  })
})

describe('updateDispersalChartData', () => {
  const dispersalStats = {
    '2020': {
      band_1: { majority: 5, aoi_area: 0, data_area: 0 },
      band_5: { majority: 10, aoi_area: 0, data_area: 0 },
      band_6: { majority: 20, aoi_area: 0, data_area: 0 },
      band_7: { majority: 30, aoi_area: 0, data_area: 0 },
    },
  }

  beforeEach(() => {
    Object.assign(chartSeriesConfig, sharedDispersalMockConfig)
    // @ts-expect-error mocking i18next.t
    i18next.t = (key: string) => key
  })

  it('calls setChartData with the two mapped ChartProperties', () => {
    const setChartData = jest.fn()
    updateDispersalChartData(dispersalStats, setChartData)

    expect(setChartData).toHaveBeenCalledTimes(1)
    const arg = setChartData.mock.calls[0][0]
    expect(Array.isArray(arg)).toBe(true)
    expect(arg).toHaveLength(2)
    expect(arg[0].chartName).toBe('sediment_exposure_historical')
    expect(arg[1].chartName).toBe('contributing_watersheds')
  })
})

describe('formatLegendValue', () => {
  it('returns raw string for values under 1000', () => {
    expect(formatLegendValue(0)).toBe('0')
    expect(formatLegendValue(764)).toBe('764')
    expect(formatLegendValue(999)).toBe('999')
  })

  it('abbreviates thousands with one decimal and k suffix', () => {
    expect(formatLegendValue(1000)).toBe('1.0k')
    expect(formatLegendValue(1200)).toBe('1.2k')
    expect(formatLegendValue(14500)).toBe('14.5k')
    expect(formatLegendValue(999999)).toBe('1000.0k')
  })

  it('abbreviates millions with one decimal and M suffix', () => {
    expect(formatLegendValue(1_000_000)).toBe('1.0M')
    expect(formatLegendValue(12_000_000)).toBe('12.0M')
    expect(formatLegendValue(1_347_460)).toBe('1.3M')
  })
})
