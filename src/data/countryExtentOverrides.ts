import { COUNTRY_EXTENTS } from './countryExtents'

type Extent = [number, number, number, number]

// TERRITORY1 names in the countries PMTiles that have no key in COUNTRY_EXTENTS. The first four
// exist in Natural Earth under another name. The rest are territories Natural Earth folds into a
// parent country; their bbox is the union of their watersheds in visual_watersheds.pmtiles (z=9).
const overrides: Record<string, Extent> = {
  'Collectivity of Saint Martin': COUNTRY_EXTENTS['Saint Martin'],
  'Sint-Maarten': COUNTRY_EXTENTS['Sint Maarten'],
  Micronesia: COUNTRY_EXTENTS['Federated States of Micronesia'],
  'Republic of Mauritius': COUNTRY_EXTENTS['Mauritius'],
  Martinique: [298.7742, 14.4275, 299.1766, 14.8783],
  Ascension: [345.5968, -7.9892, 345.6725, -7.8933],
  'Phoenix Group': [188.7391, -4.4674, 188.7691, -4.4424],
  Oecusse: [124.0434, -9.5266, 124.5108, -9.1801],
}

// COUNTRY_EXTENTS keyed by the names the countries PMTiles actually uses.
export const COUNTRY_EXTENTS_BY_TERRITORY: Record<string, Extent> = {
  ...COUNTRY_EXTENTS,
  ...overrides,
}
