import { LayerInfo } from '../types/MapDataTypes'
import { sortBoundaryLayers } from '../utils/sortUtils'

const makeBoundaryLayer = (layerId: string): LayerInfo => ({
  dataType: 'pmtiles',
  isLayerOn: true,
  layerId,
  link: 'https://example.com',
  parentLayerType: 'boundaries',
  sourceId: `${layerId}_src`,
  sourceFileName: layerId,
  title: layerId,
})

describe('sortBoundaryLayers', () => {
  it('sorts ranked boundary layers in configured order', () => {
    const input = [
      makeBoundaryLayer('countries'),
      makeBoundaryLayer('regions'),
      makeBoundaryLayer('watershed'),
      makeBoundaryLayer('sed_exposure_boundary'),
    ]

    const sortedIds = input.sort(sortBoundaryLayers).map((layer) => layer.layerId)

    expect(sortedIds).toEqual(['watershed', 'sed_exposure_boundary', 'regions', 'countries'])
  })

  it('places unranked layers after all ranked layers', () => {
    const input = [
      makeBoundaryLayer('marine_zones'),
      makeBoundaryLayer('regions'),
      makeBoundaryLayer('watershed'),
    ]

    const sortedIds = input.sort(sortBoundaryLayers).map((layer) => layer.layerId)

    // Unranked layers always sort after ranked ones
    expect(sortedIds).toEqual(['watershed', 'regions', 'marine_zones'])
  })

  it('returns NaN when comparing two unranked layers', () => {
    const compareResult = sortBoundaryLayers(
      makeBoundaryLayer('marine_zones'),
      makeBoundaryLayer('reef_admin'),
    )

    expect(Number.isNaN(compareResult)).toBe(true)
  })
})
