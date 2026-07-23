import { chartSeriesConfig } from './chartSeriesData'

export interface NameKeyClass {
  nameKey: string
  description: string
}

export interface Table1Row {
  data: string
  parameterisation: string
}

export interface Table2Row {
  glad_subclasses: string
  description: string
  c_factor: string
  p_factor: string
  /** null = continuation row — no cell rendered (merged with the nearest non-null row above) */
  notes: string | null
}

export interface CoastedTableRow {
  parameter: string
  sub_parameter: string
  value: string
}

export interface Reference {
  citation: string
  url: string
}

export const table1Rows: Table1Row[] = [
  {
    data: 'Digital elevation model',
    parameterisation: 'MERIT Hydro: hydrologically conditioned global digital elevation model [6]',
  },
  {
    data: 'Watershed polygon',
    parameterisation: 'Hydrography90m global sub-basin boundaries [7]',
  },
  {
    data: 'Rainfall erosivity (R factor)',
    parameterisation:
      'Global rainfall erosivity developed by Panagos et al. [8] interpolated to match the extent of the watershed polygon',
  },
  {
    data: 'Soil erodibility (K factor)',
    parameterisation:
      'Global soil erodibility developed by Gupta et al. [9] interpolated to match the extent of the watershed polygon',
  },
  {
    data: 'Land use / cover (LULC)',
    parameterisation:
      'GLAD global land cover and land use change dataset [1] reclassified into 14 classes based on erosion characteristics (see Table 2)',
  },
  {
    data: 'Biophysical Table',
    parameterisation:
      'This defines the cover management factor and protection factor for each land use/cover category. See Table 2 for full values.',
  },
  { data: 'Threshold flow accumulation', parameterisation: '60' },
  { data: 'Borselli k Parameter', parameterisation: '2' },
  { data: 'Max SDR Value', parameterisation: '0.8' },
  { data: 'Borselli IC0 Parameter', parameterisation: '0.5' },
  { data: 'Max L Value', parameterisation: '122' },
  { data: 'Flow Direction Algorithm', parameterisation: 'Multiple Flow Direction (MFD)' },
]

export const table2Rows: Table2Row[] = [
  {
    glad_subclasses: '0-1 & 100-101',
    description: '3-7% short vegetation (<3m)',
    c_factor: '0.9 [10,11]',
    p_factor: '1',
    notes:
      'Classification combines GLAD Terra firma and Wetland landforms % cover of short vegetation and tree height divided systematically based on literature and influence on erosion [12–16] C-factor systematically divided based on literature ranges [17,18]',
  },
  {
    glad_subclasses: '2-7 & 102-107',
    description: '11-31% short vegetation (<3m)',
    c_factor: '0.15 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '8-13 & 108-113',
    description: '35-55% short vegetation (<3m)',
    c_factor: '0.10 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '14-18 & 114-118',
    description: '59-75% short vegetation (<3m)',
    c_factor: '0.05 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '19-24 & 119-124',
    description: '79-100% short vegetation (<3m)',
    c_factor: '0.01 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '25-32 & 125-132',
    description: '3-10m tree height',
    c_factor: '0.003 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '33-40 & 133-140',
    description: '11-18m tree height',
    c_factor: '0.0015 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '41-48 & 141-148',
    description: '19-25+m tree height',
    c_factor: '0.0001 [10,19]',
    p_factor: '1',
    notes: null,
  },
  {
    glad_subclasses: '200-207',
    description: 'Open Surface Water',
    c_factor: '0 [20]',
    p_factor: '1',
    notes: '',
  },
  { glad_subclasses: '241', description: 'Snow/Ice', c_factor: '0', p_factor: '1', notes: '' },
  {
    glad_subclasses: '244',
    description: 'Cropland',
    c_factor: '0.2 [10,19]',
    p_factor: '1',
    notes: 'Averaged c-factor [18]',
  },
  {
    glad_subclasses: '250',
    description: 'Built-up',
    c_factor: '1 [21]',
    p_factor: '1',
    notes: '',
  },
  {
    glad_subclasses: '254',
    description: 'Ocean',
    c_factor: 'NA',
    p_factor: '1',
    notes: 'Clipped out',
  },
  {
    glad_subclasses: '255',
    description: 'No data',
    c_factor: 'NA',
    p_factor: '1',
    notes: 'Clipped out',
  },
]

export const sedExpTableRows: CoastedTableRow[] = [
  {
    parameter: "Benthic Environment Roughness (as Manning's coefficients)",
    sub_parameter: 'Sand',
    value: '0.020',
  },
  { parameter: '', sub_parameter: 'Rubble', value: '0.050' },
  { parameter: '', sub_parameter: 'Rock', value: '0.045' },
  { parameter: '', sub_parameter: 'Seagrass', value: '0.060' },
  { parameter: '', sub_parameter: 'Coral/algae', value: '0.120' },
  { parameter: '', sub_parameter: 'Microalgae Mats', value: '0.025' },
  { parameter: 'Maximum iterations (to be increased)', sub_parameter: '', value: '1000' },
  {
    parameter: 'Critical deposition shear stress (N/m²)',
    sub_parameter: '',
    value: '5 N/m²',
  },
  { parameter: 'Settling velocity (HIGH)', sub_parameter: '', value: '0.01 m/s' },
  { parameter: 'Minimum ambient velocity (m/s)', sub_parameter: '', value: '0.01 m/s' },
  { parameter: 'Flood event pulse multiplier (low)', sub_parameter: '', value: '5' },
  { parameter: 'Water density (kg/m³)', sub_parameter: '', value: '1025 kg/m³' },
  {
    parameter: 'Settlement exposure thresholds (t/ha/year)',
    sub_parameter: 'Trace (measurable accumulation)',
    value: '35 t/ha/year',
  },
  {
    parameter: '',
    sub_parameter: 'Moderate (some impact expected)',
    value: '350 t/ha/year',
  },
  { parameter: '', sub_parameter: 'Severe (lethal impacts)', value: '1800 t/ha/year' },
  {
    parameter: 'Suspended exposure thresholds (t/ha/year)',
    sub_parameter: 'Trace (broad influence area)',
    value: '0.01 t/ha/year',
  },
  { parameter: '', sub_parameter: 'Moderate (chronic exposure)', value: '1.00 t/ha/year' },
  {
    parameter: '',
    sub_parameter: 'Severe (high light-attenuation)',
    value: '100.00 t/ha/year',
  },
  { parameter: 'Outlet flows', sub_parameter: '', value: '' },
  { parameter: 'Outlet depths', sub_parameter: '', value: '' },
  { parameter: 'Outlet widths', sub_parameter: '', value: '' },
  { parameter: 'Bathymetry', sub_parameter: '', value: '' },
  { parameter: 'Tidal range', sub_parameter: '', value: '' },
  { parameter: 'Currents and Winds', sub_parameter: '', value: '' },
]

export const references: Reference[] = [
  {
    citation:
      'Potapov, P., Hansen, M. C., Pickens, A., Hernandez-Serna, A., Tyukavina, A., Turubanova, S., Zalles, V., Li, X., Khan, A., Stolle, F., Harris, N., Song, X.-P., Baggett, A., Kommareddy, I., & Kommareddy, A. (2022). The Global 2000-2020 Land Cover and Land Use Change Dataset Derived From the Landsat Archive: First Results. Frontiers in Remote Sensing, 3, 856903.',
    url: 'https://doi.org/10.3389/frsen.2022.856903',
  },
  {
    citation:
      'Wilkinson, S. N., Hancock, G. J., Bartley, R., Hawdon, A. A., & Keen, R. J. (2013). Using sediment tracing to assess processes and spatial patterns of erosion in grazed rangelands, Burdekin River basin, Australia. Agriculture, Ecosystems & Environment, 180, 90–102.',
    url: 'https://doi.org/10.1016/j.agee.2012.02.002',
  },
  {
    citation:
      'Queensland Government. (2026). Burdekin Erosion in Grazing Lands. Queensland Government.',
    url: 'https://www.qld.gov.au/__data/assets/pdf_file/0019/69013/rp141p-burdekin-erosion-grazing-lands.pdf',
  },
  {
    citation:
      'Natural Capital Project. (2025). InVEST 3.15.1 [Computer software]. Stanford University, University of Minnesota, Chinese Academy of Sciences, The Nature Conservancy, World Wildlife Fund, Stockholm Resilience Centre and the Royal Swedish Academy of Sciences.',
    url: 'https://naturalcapitalproject.stanford.edu/software/invest',
  },
  {
    citation:
      'Hamel, P., Chaplin-Kramer, R., Sim, S., & Mueller, C. (2015). A new approach to modeling the sediment retention service (InVEST 3.0): Case study of the Cape Fear catchment, North Carolina, USA. Science of The Total Environment, 524–525, 166–177.',
    url: 'https://doi.org/10.1016/j.scitotenv.2015.04.027',
  },
  {
    citation:
      'Lehner, B., Verdin, K., & Jarvis, A. (2008). New Global Hydrography Derived From Spaceborne Elevation Data. Eos, Transactions American Geophysical Union, 89(10), 93–94.',
    url: 'https://doi.org/10.1029/2008EO100001',
  },
  {
    citation:
      'Amatulli, G., Garcia Marquez, J., Sethi, T., Kiesel, J., Grigoropoulou, A., Üblacker, M. M., Shen, L. Q., & Domisch, S. (2022). Hydrography90m: A new high-resolution global hydrographic dataset. Earth System Science Data, 14(10), 4525–4550.',
    url: 'https://doi.org/10.5194/essd-14-4525-2022',
  },
  {
    citation:
      'Panagos, P., Hengl, T., Wheeler, I., Marcinkowski, P., Rukeza, M. B., Yu, B., Yang, J. E., Miao, C., Chattopadhyay, N., Sadeghi, S. H., Levi, Y., Erpul, G., Birkel, C., Hoyos, N., Oliveira, P. T. S., Bonilla, C. A., Nel, W., Al Dashti, H., Bezak, N., … Borrelli, P. (2023). Global rainfall erosivity database (GloREDa) and monthly R-factor data at 1 km spatial resolution. Data in Brief, 50, 109482.',
    url: 'https://doi.org/10.1016/j.dib.2023.109482',
  },
  {
    citation:
      'Gupta, S., Borrelli, P., Panagos, P., & Alewell, C. (2024). An advanced global soil erodibility (K) assessment including the effects of saturated hydraulic conductivity. Science of The Total Environment, 908, 168249.',
    url: 'https://doi.org/10.1016/j.scitotenv.2023.168249',
  },
  {
    citation:
      'Benavidez, R., Jackson, B., Maxwell, D., & Norton, K. (2018). A review of the (Revised) Universal Soil Loss Equation ((R)USLE): With a view to increasing its global applicability and improving soil loss estimates. Hydrology and Earth System Sciences, 22(11), 6059–6086.',
    url: 'https://doi.org/10.5194/hess-22-6059-2018',
  },
  {
    citation:
      'Okacha, A., & Salhi, A. (2024). Refining erosion assessment with NDVI-based modeling: A case study in diverse climatic zones. Mediterranean Geoscience Reviews, 6(3), 219–232.',
    url: 'https://doi.org/10.1007/s42990-024-00134-6',
  },
  {
    citation:
      'González-Botello, M. A., & Bullock, S. H. (2012). Erosion-reducing cover in semi-arid shrubland. Journal of Arid Environments, 84, 19–25.',
    url: 'https://doi.org/10.1016/j.jaridenv.2012.04.002',
  },
  {
    citation:
      'Igwe, P. U., Ezeukwu, J. C., Edoka, N. E., Ejie, O. C., & Ifi, G. I. (2017). A Review of Vegetation Cover as a Natural Factor to Soil Erosion. International Journal of Rural Development, Environment and Health Research, 1(4), 21–28.',
    url: 'https://doi.org/10.22161/ijreh.1.4.4',
  },
  {
    citation:
      'Li, G., Wan, L., Cui, M., Wu, B., & Zhou, J. (2019). Influence of Canopy Interception and Rainfall Kinetic Energy on Soil Erosion under Forests. Forests, 10(6), 509.',
    url: 'https://doi.org/10.3390/f10060509',
  },
  {
    citation:
      'Song, Z., Seitz, S., Li, J., Goebes, P., Schmidt, K., Kühn, P., Shi, X., & Scholten, T. (2019). Tree diversity reduced soil erosion by affecting tree canopy and biological soil crust development in a subtropical forest experiment. Forest Ecology and Management, 444, 69–77.',
    url: 'https://doi.org/10.1016/j.foreco.2019.04.015',
  },
  {
    citation:
      'Wen, Z., Zheng, H., Zhao, H., & Ouyang, Z. (2021). The mediatory roles of species diversity and tree height diversity: Linking the impact of land-use intensity to soil erosion. Land Degradation & Development, 32(3), 1127–1134.',
    url: 'https://doi.org/10.1002/ldr.3646',
  },
  {
    citation:
      'Rozos, D., Skilodimou, H. D., Loupasakis, C., & Bathrellos, G. D. (2013). Application of the revised universal soil loss equation model on landslide prevention. An example from N. Euboea (Evia) Island, Greece. Environmental Earth Sciences, 70(7), 3255–3266.',
    url: 'https://doi.org/10.1007/s12665-013-2390-3',
  },
  {
    citation:
      'Borrelli, P., Robinson, D. A., Fleischer, L. R., Lugato, E., Ballabio, C., Alewell, C., Meusburger, K., Modugno, S., Schütt, B., Ferro, V., Bagarello, V., Oost, K. V., Montanarella, L., & Panagos, P. (2017). An assessment of the global impact of 21st century land use change on soil erosion. Nature Communications, 8(1), 2013.',
    url: 'https://doi.org/10.1038/s41467-017-02142-7',
  },
  {
    citation:
      'Panagos, P., Borrelli, P., Meusburger, K., Alewell, C., Lugato, E., & Montanarella, L. (2015). Estimating the soil erosion cover-management factor at the European scale. Land Use Policy, 48, 38–50.',
    url: 'https://doi.org/10.1016/j.landusepol.2015.05.021',
  },
  {
    citation:
      'Falinski, K. (2016). Predicting Sediment Export into Tropical Coastal Ecosystems to Support Ridge to Reef Management. University of Hawaii at Manoa.',
    url: 'http://hdl.handle.net/10125/51370',
  },
  {
    citation:
      'Wischmeier, W. H., & Smith, D. D. (1978). Predicting Rainfall Erosion Losses: A Guide to Conservation Planning. Department of Agriculture, Science and Education Administration.',
    url: 'https://books.google.com.au/books?id=rRAUAAAAYAAJ',
  },
  {
    citation: 'Allen Coral Atlas. (2022). Imagery, maps and monitoring of the world\'s tropical coral reefs. Zenodo.',
    url: 'https://doi.org/10.5281/ZENODO.3833242',
  },
]

export const landUseColors = chartSeriesConfig['charts.land_use_historical'].legendColors

export const SECTION_IDS = {
  noteToUsers: 'note-to-users',
  landUse: 'land-use',
  sedimentLoad: 'sediment-load',
  sedimentExposure: 'sediment-exposure',
  benthicLayers: 'benthic-layers',
  ecosystemExtent: 'ecosystem-extent',
  contributingWatersheds: 'contributing-watersheds',
  references: 'references',
} as const

export const sections = [
  { id: SECTION_IDS.noteToUsers, labelKey: 'science_and_methods_page.sections.note_to_users' },
  { id: SECTION_IDS.landUse, labelKey: 'land_use' },
  { id: SECTION_IDS.sedimentLoad, labelKey: 'map_layers.sediment_load' },
  { id: SECTION_IDS.sedimentExposure, labelKey: 'map_layers.sediment_exposure' },
  { id: SECTION_IDS.benthicLayers, labelKey: 'benthic_layers' },
  { id: SECTION_IDS.ecosystemExtent, labelKey: 'science_and_methods_page.sections.ecosystem_extent' },
  { id: SECTION_IDS.contributingWatersheds, labelKey: 'charts.contributing_watersheds' },
  { id: SECTION_IDS.references, labelKey: 'science_and_methods_page.sections.references' },
]

export const sectionLabel = Object.fromEntries(sections.map((s) => [s.id, s.labelKey]))

export function getCoastedRowspan(rows: CoastedTableRow[], i: number): number {
  if (!rows[i].parameter) { return 0 }
  let span = 1
  let j = i + 1
  while (j < rows.length && !rows[j].parameter) { span++; j++ }
  return span
}

export function getTable2NotesSpan(rows: Table2Row[], i: number): number {
  if (rows[i].notes === null) { return 0 }
  let span = 1
  let j = i + 1
  while (j < rows.length && rows[j].notes === null) { span++; j++ }
  return span
}
