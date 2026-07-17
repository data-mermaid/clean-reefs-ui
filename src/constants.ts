const coralAtlasAppId = import.meta.env.VITE_CORAL_ATLAS_APP_ID

if (!coralAtlasAppId) {
  throw new Error('VITE_CORAL_ATLAS_APP_ID environment variable is required')
}

/******MAP LAYERS******/
/* Map Styles */
export const SATELLITE_STYLE = `https://api.maptiler.com/maps/hybrid/style.json`
export const LIGHT_STYLE = `https://api.maptiler.com/maps/019d9cac-cbb2-7829-aa43-f6660494bdc3/style.json`
export const DARK_STYLE = `https://api.maptiler.com/maps/019d9cab-f4ae-7b1e-a994-00224f21dd54/style.json`

/* Boundary Layers - always on */
export const REGIONS_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_meow_realms/gpw_meow_realms/visual_regions.pmtiles'
export const COUNTRIES_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_countries/gpw_countries/visual_countries.pmtiles'
export const WATERSHED_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_watersheds/gpw_watersheds/visual_watersheds.pmtiles'

/* Benthic Attribute Layers */
export const ATLAS_BENTHIC_URL = `https://allencoralatlas.org/tiles/benthic/{z}/{x}/{y}?appid=${coralAtlasAppId}`
export const REEF_EXTENT_URL =
  'https://mermaid.prescient.earth/raster/collections/aca_extent/items/aca_extent/tiles/WebMercatorQuad/{z}/{x}/{y}.png?assets=cog&colormap={"0":[0,0,0,0],"1":[178,8,76,200]}'

/* Sediment Exposure Layers */
export const SED_EXPOSURE_2000_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2000/visual_sediment_exposure_plumes_2000.pmtiles'
export const SED_EXPOSURE_2005_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2005/visual_sediment_exposure_plumes_2005.pmtiles'
export const SED_EXPOSURE_2010_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2010/visual_sediment_exposure_plumes_2010.pmtiles'
export const SED_EXPOSURE_2015_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2015/visual_sediment_exposure_plumes_2015.pmtiles'
export const SED_EXPOSURE_2020_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2020/visual_sediment_exposure_plumes_2020.pmtiles'

/* Sediment Exposure point stats / Zonal Stats data API */
export const BASE_ZONAL_STATS_API =
  'https://api.zonalstats.datamermaid.org/api/v1/zonal-stats/raster'
export const SEDIMENT_EXPOSURE_2000_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2000/data_sediment_exposure_2000.tif'
export const SEDIMENT_EXPOSURE_2005_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2005/data_sediment_exposure_2005.tif'
export const SEDIMENT_EXPOSURE_2010_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2010/data_sediment_exposure_2010.tif'
export const SEDIMENT_EXPOSURE_2015_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2015/data_sediment_exposure_2015.tif'
export const SEDIMENT_EXPOSURE_2020_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2020/data_sediment_exposure_2020.tif'

/******TITILER API******/
export const TITILER_API_BASE_URL = 'https://mermaid.prescient.earth'

/* LULC colormap — 13 entries (0–12) from STAC lulc collection summaries.label:classes.
   Class 10 ("OUT") forced transparent instead of the STAC hint #FFFFFF. */
export const LULC_COLORMAP: Record<string, number[]> = {
  '0': [0, 0, 0, 0],
  '1': [254, 254, 204, 255],
  '2': [237, 237, 162, 255],
  '3': [221, 221, 121, 255],
  '4': [202, 202, 72, 255],
  '5': [176, 176, 6, 255],
  '6': [96, 156, 48, 255],
  '7': [49, 116, 49, 255],
  '8': [6, 81, 6, 255],
  '9': [14, 57, 214, 255],
  '10': [0, 0, 0, 0],
  '11': [255, 125, 0, 255],
  '12': [100, 220, 220, 255],
}
export const TITILER_API_TIMEOUT = 10000 // 10 seconds in milliseconds
export const SED_EXPOSURE_COLLECTION_ID = 'gpw_sediment_exposure'
export const SED_EXPOSURE_STATS_BASE_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure'
export const SED_LOAD_COLLECTION_ID = 'gpw_sediment_load'

/******STAC API******/
export const STAC_API_BASE_URL = 'https://mermaid.prescient.earth/stac'
export const STAC_API_TIMEOUT = 3000 // 3 seconds — metadata fetch, fail fast to fallback

/******MAP URL PARAMS******/
export const LAT_LNG_PRECISION = 6
export const ZOOM_PRECISION = 2

/******MAP FIT BOUNDS******/
export const mapFitBoundsDesktopConfig = {
  padding: { top: 300, bottom: 300, left: 300, right: 300 },
  maxZoom: 10,
}

export const mapFitBoundsMobileConfig = {
  padding: 30,
  maxZoom: 9,
}

/******EXTERNAL LINKS******/
export const INVEST_URL = 'https://naturalcapitalalliance.stanford.edu/software/invest'

/******PAGE LAYOUT******/
// $headerHeight (36px) + breathing room (16px)
export const SCROLL_TO_SECTION_OFFSET = 52

/******COLORS******/
export const sedExposureBoundaryOutlineColor = 'hsl(300deg, 100%, 25%)'
export const polygonOutlineHoverColor = 'hsl(300deg, 41%, 63%)'
export const polygonOutlineSelectColor = 'hsl(300deg, 81%, 43%)'
export const polygonHighlightWidth = 3
export const topContributingWatershedColorFills = ['#FFA600', '#D86D83', '#7A5195']
