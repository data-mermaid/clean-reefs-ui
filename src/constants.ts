const coralAtlasAppId = import.meta.env.VITE_CORAL_ATLAS_APP_ID

/******MAP LAYERS******/
export const REGIONS_PMTILES_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/regions/regions.pmtiles'
export const COUNTRIES_PMTILES_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/countries/countries.pmtiles'
export const WATERSHED_PMTILES_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/watersheds/watersheds.pmtiles'
export const GLOBAL_LULC_PMTILES_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/outputs/land/regional/Central_Indo_Pacific_LULC_SDR.pmtiles'

export const LULC_2000_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/global_lulc/lulc_2000_visual.tif'
export const LULC_2005_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/global_lulc/lulc_2005_visual.tif'
export const LULC_2010_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/global_lulc/lulc_2010_visual.tif'
export const LULC_2015_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/global_lulc/lulc_2015_visual.tif'
export const LULC_2020_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/global_lulc/lulc_2020_visual.tif'
export const ACA_BENTHIC_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/aca_benthic/aca_benthic_visual.tif'

export const ATLAS_BENTHIC_URL = `https://allencoralatlas.org/tiles/benthic/{z}/{x}/{y}?appid=${coralAtlasAppId}`
export const ATLAS_GEOMORPHIC_URL = `https://allencoralatlas.org/tiles/geomorphic/{z}/{x}/{y}?appid=${coralAtlasAppId}`

export const SED_EXPORT_2000_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/sediment_load/sed_export_load_2000_visual.tif'
export const SED_EXPORT_2005_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/sediment_load/sed_export_load_2005_visual.tif'
export const SED_EXPORT_2010_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/sediment_load/sed_export_load_2010_visual.tif'
export const SED_EXPORT_2015_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/sediment_load/sed_export_load_2015_visual.tif'
export const SED_EXPORT_2020_URL =
  'https://gpw-coastal-pollution-model-data-public-0001.s3.ap-southeast-2.amazonaws.com/app/sediment_load/sed_export_load_2020_visual.tif'

/******MAP FIT BOUNDS******/
export const mapFitBoundsDesktopConfig = {
  padding: { top: 300, bottom: 300, left: 300, right: 300 },
  maxZoom: 10,
}

export const mapFitBoundsMobileConfig = {
  padding: 30,
  maxZoom: 9,
}

/******COLORS******/
export const polygonOutlineHoverColor = '#00FF01'
export const polygonOutlineSelectColor = '#0000FF'
