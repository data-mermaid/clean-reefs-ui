import { RegionOption } from '../types/RegionDataTypes'
import {
  TITILER_API_BASE_URL,
  TITILER_API_TIMEOUT,
  SED_EXPOSURE_COLLECTION_ID,
  SED_LOAD_COLLECTION_ID,
  LULC_COLORMAP,
} from '../constants'

export interface ExpressionConfig {
  expression: string | null
  assetBidx: string
}

interface StatisticsResponse {
  [key: string]: {
    min?: number
    max?: number
    mean?: number
    count?: number
    sum?: number
    std?: number
    median?: number
    percentile_2?: number
    percentile_98?: number
  }
}

interface MinMaxValues {
  min: number
  max: number
}

// ─── Sed Exposure ────────────────────────────────────────────────────────────

/** Build the TiTiler expression and required asset bands for the selected region. */
export function buildSedExposureExpression(region: RegionOption): ExpressionConfig {
  if (region.bandId == null) {
    return { expression: null, assetBidx: 'cog|1' }
  }

  if (region.regionType === 'country') {
    return {
      expression: `where((cog_b8==${region.bandId}), cog_b1, 0)`,
      assetBidx: 'cog|1,8',
    }
  }
  if (region.regionType === 'region') {
    return {
      expression: `where((cog_b9==${region.bandId}), cog_b1, 0)`,
      assetBidx: 'cog|1,9',
    }
  }

  return { expression: null, assetBidx: 'cog|1' }
}

/** Build the TiTiler item ID for the selected year. */
export function buildSedExposureItemId(year: number): string {
  return `${SED_EXPOSURE_COLLECTION_ID}_${year}`
}

/** Build a MapLibre-compatible LULC tile URL template for the given year. */
export function buildLulcTileUrlTemplate(year: number): string {
  const basePath = `${TITILER_API_BASE_URL}/raster/collections/lulc/items/lulc_${year}/tiles/WebMercatorQuad/{z}/{x}/{y}.png`
  const params = new URLSearchParams({
    assets: 'Land Use and Land Cover Collection Cloud Optimized GeoTIFF',
    colormap: JSON.stringify(LULC_COLORMAP),
  })
  return `${basePath}?${params.toString()}`
}

/**
 * Fetch statistics for a sed exposure region from TiTiler.
 * Pass null expression for global (no region filter).
 */
export async function fetchSedExposureStatistics(
  collectionId: string,
  itemId: string,
  expression: string | null,
  assetBidx: string,
  signal?: AbortSignal,
): Promise<MinMaxValues | null> {
  const resolvedExpression = expression ?? 'cog_b1'
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), TITILER_API_TIMEOUT)
  const combinedSignal = signal
    ? AbortSignal.any([timeoutController.signal, signal])
    : timeoutController.signal

  try {
    const url = new URL(
      `${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/statistics`,
    )
    url.searchParams.append('assets', 'cog')
    url.searchParams.append('asset_bidx', assetBidx)
    url.searchParams.append('expression', resolvedExpression)
    url.searchParams.append('max_size', '1025')

    const response = await fetch(url.toString(), { signal: combinedSignal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data: StatisticsResponse = await response.json()
    const statsData = data[resolvedExpression]

    if (!statsData || statsData.min === undefined || statsData.max === undefined) {
      return null
    }

    return {
      min: parseFloat(statsData.min.toFixed(1)),
      max: parseFloat(statsData.max.toFixed(1)),
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

/**
 * Build a MapLibre-compatible tile URL template for sed exposure with dynamic rescale.
 * Uses {z}/{x}/{y} placeholders that MapLibre fills in when fetching tiles.
 * The expression clamps values at max so nothing renders out of range.
 * NOTE: multi-band expression filtering (per country/region) is not supported by the
 * /collections/.../items/.../tiles/ endpoint — the tile always shows full CIP coverage.
 * Raised as Q6 in design-questions-draft.md.
 */
export function buildSedExposureTileUrl(collectionId: string, itemId: string, max: number): string {
  const basePath = `${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/WebMercatorQuad/{z}/{x}/{y}`
  const params = new URLSearchParams({
    rescale: `0,${max}`,
    assets: 'cog',
    colormap_name: 'viridis',
    asset_bidx: 'cog|1',
    expression: `where(cog_b1>${max},${max},cog_b1)`,
  })
  return `${basePath}?${params.toString()}`
}

// ─── Sed Load ──────────────────────────────────────────────────────────────

/** Build the TiTiler expression and required asset bands for the selected region.
 * NOTE: country COUNTRY_IDs (b2) may not align with boundary PMTiles IDs for all countries
 * (confirmed mismatch for Fiji — raised with data team). Results may be incorrect per-country. */
export function buildSedLoadExpression(region: RegionOption): ExpressionConfig {
  if (region.bandId == null) {
    return { expression: null, assetBidx: 'cog|1' }
  }

  if (region.regionType === 'country') {
    return {
      expression: `where((cog_b2==${region.bandId * 1000}), cog_b1, 0)`,
      assetBidx: 'cog|1,2',
    }
  }
  if (region.regionType === 'region') {
    return {
      expression: `where((cog_b3==${region.bandId * 1000}), cog_b1, 0)`,
      assetBidx: 'cog|1,3',
    }
  }

  return { expression: null, assetBidx: 'cog|1' }
}

/**
 * Fetch statistics for a sediment load item from TiTiler.
 * Pass a region to get scope-specific min/max; omit for global stats.
 * Clamps min to 0 — raw values can be slightly negative due to data artifacts.
 */
export async function fetchSedLoadStatistics(
  year: number,
  region?: RegionOption,
  signal?: AbortSignal,
): Promise<MinMaxValues | null> {
  const itemId = `${SED_LOAD_COLLECTION_ID}_${year}`
  const { expression, assetBidx } = region
    ? buildSedLoadExpression(region)
    : { expression: null, assetBidx: 'cog|1' }
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), TITILER_API_TIMEOUT)
  const combinedSignal = signal
    ? AbortSignal.any([timeoutController.signal, signal])
    : timeoutController.signal

  try {
    const url = new URL(
      `${TITILER_API_BASE_URL}/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${itemId}/statistics`,
    )
    url.searchParams.append('assets', 'cog')
    url.searchParams.append('asset_bidx', assetBidx)
    if (expression) {
      url.searchParams.append('expression', expression)
    }
    url.searchParams.append('max_size', '1025')

    const response = await fetch(url.toString(), { signal: combinedSignal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data: StatisticsResponse = await response.json()
    const statsKey = expression ?? 'cog_b1'
    const statsData = data[statsKey]

    if (!statsData || statsData.min === undefined || statsData.max === undefined) {
      return null
    }

    return {
      min: Math.max(0, parseFloat(statsData.min.toFixed(1))),
      max: parseFloat(statsData.max.toFixed(1)),
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

/** Build a MapLibre-compatible tile URL for a sediment load item with dynamic rescale.
 * When a region with a bandId is provided, applies an expression to mask pixels outside
 * that region. nodata=0 makes masked pixels transparent. */
export function buildSedLoadTileUrl(
  year: number,
  min: number,
  max: number,
  region?: RegionOption,
): string {
  const itemId = `${SED_LOAD_COLLECTION_ID}_${year}`
  const basePath = `${TITILER_API_BASE_URL}/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${itemId}/tiles/WebMercatorQuad/{z}/{x}/{y}`

  let expression: string | null = null
  if (region?.bandId != null) {
    if (region.regionType === 'country') {
      expression = `where((cog_b2==${region.bandId * 1000}),cog_b1,0)`
    } else if (region.regionType === 'region') {
      expression = `where((cog_b3==${region.bandId * 1000}),cog_b1,0)`
    }
  }

  const params = new URLSearchParams({
    rescale: `${min},${max}`,
    assets: 'cog',
    colormap_name: 'brbg_r',
  })

  if (expression) {
    params.set('expression', expression)
    params.set('nodata', '0')
  } else {
    params.set('asset_bidx', 'cog|1')
  }

  return `${basePath}?${params.toString()}`
}
