const coralAtlasAppId = import.meta.env.VITE_CORAL_ATLAS_APP_ID

if (!coralAtlasAppId) {
  throw new Error('VITE_CORAL_ATLAS_APP_ID environment variable is required')
}

/******MAP LAYERS******/
/* Boundary Layers - always on */
export const REGIONS_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_meow_realms/gpw_meow_realms/visual_regions.pmtiles'
export const COUNTRIES_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_countries/gpw_countries/visual_countries.pmtiles'
export const WATERSHED_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_watersheds/gpw_watersheds/visual_watersheds.pmtiles'

/* Land Use Land Cover Layers */
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

/* Benthic Attribute Layers */
export const ATLAS_BENTHIC_URL = `https://allencoralatlas.org/tiles/benthic/{z}/{x}/{y}?appid=${coralAtlasAppId}`
export const REEF_EXTENT_URL =
  'https://mermaid.prescient.earth/raster/collections/aca_extent/items/aca_extent/tiles/WebMercatorQuad/{z}/{x}/{y}.png?assets=cog&colormap={"0":[0,0,0,0],"1":[178,8,76,200]}'

/* Sediment Export Layers */
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

/* Ocean Sediment Dispersal Layers */
export const SED_DISPERSAL_2000_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2000/visual_sediment_exposure_plumes_2000.pmtiles'
export const SED_DISPERSAL_2005_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2005/visual_sediment_exposure_plumes_2005.pmtiles'
export const SED_DISPERSAL_2010_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2010/visual_sediment_exposure_plumes_2010.pmtiles'
export const SED_DISPERSAL_2015_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2015/visual_sediment_exposure_plumes_2015.pmtiles'
export const SED_DISPERSAL_2020_PMTILES_URL =
  'https://d2uu99zl9amnvy.cloudfront.net/assets/gpw_sediment_exposure/gpw_sediment_exposure_2020/visual_sediment_exposure_plumes_2020.pmtiles'

export const SED_DISPERSAL_2000_URL =
  'https://mermaid.prescient.earth/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2000/tiles/WebMercatorQuad/{z}/{x}/{y}?rescale=0,1.31&assets=cog&colormap_name=viridis&asset_bidx=cog%7C1&expression=where(cog_b1>1.31,1.31,cog_b1)'
export const SED_DISPERSAL_2005_URL =
  'https://mermaid.prescient.earth/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2005/tiles/WebMercatorQuad/{z}/{x}/{y}?rescale=0,1.31&assets=cog&colormap_name=viridis&asset_bidx=cog%7C1&expression=where(cog_b1>1.31,1.31,cog_b1)'
export const SED_DISPERSAL_2010_URL =
  'https://mermaid.prescient.earth/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2010/tiles/WebMercatorQuad/{z}/{x}/{y}?rescale=0,1.31&assets=cog&colormap_name=viridis&asset_bidx=cog%7C1&expression=where(cog_b1>1.31,1.31,cog_b1)'
export const SED_DISPERSAL_2015_URL =
  'https://mermaid.prescient.earth/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2015/tiles/WebMercatorQuad/{z}/{x}/{y}?rescale=0,1.31&assets=cog&colormap_name=viridis&asset_bidx=cog%7C1&expression=where(cog_b1>1.31,1.31,cog_b1)'
export const SED_DISPERSAL_2020_URL =
  'https://mermaid.prescient.earth/raster/collections/gpw_sediment_exposure/items/gpw_sediment_exposure_2020/tiles/WebMercatorQuad/{z}/{x}/{y}?rescale=0,1.31&assets=cog&colormap_name=viridis&asset_bidx=cog%7C1&expression=where(cog_b1>1.31,1.31,cog_b1)'

/* Ocean Sediment Dispersal point stats / Zonal Stats data API */
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

/******MAP URL PARAMS******/
export const LAT_LNG_PRECISION = 6
export const ZOOM_PRECISION = 2

/******MAP FIT BOUNDS******/
export const mapFitBoundsDesktopConfig = {
  padding: { top: 300, bottom: 300, left: 300, right: 300 },
  maxZoom: 14,
}

export const mapFitBoundsMobileConfig = {
  padding: 30,
  maxZoom: 9,
}

/******COLORS******/
export const plumeOutlineColor = '#FFEA46'
export const polygonOutlineHoverColor = '#00FF01'
export const polygonOutlineSelectColor = '#0000FF'
export const polygonHighlightWidth = 3
export const topContributingWatershedColorFills = ['#FFA600', '#D86D83', '#7A5195']

/******LAYOUT******/
export const TRENDS_DRAWER_PEEK_HEIGHT = 100
export const SNACKBAR_BOTTOM_GAP = 36
