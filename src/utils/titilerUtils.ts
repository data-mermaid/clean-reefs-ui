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

interface SedLoadStats extends MinMaxValues {
  p98: number | null
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
    // asset_bidx is only needed when the expression reads multiple bands (regional masking).
    // Passing it for single-band global requests causes TiTiler to return 0 valid pixels.
    if (assetBidx !== 'cog|1') {
      url.searchParams.append('asset_bidx', assetBidx)
    }
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

// Generates a 256-entry RGBA viridis colormap.
// entry0Alpha controls whether uint8 value 0 is transparent (for regional filtering,
// where the expression returns 0 for out-of-region pixels) or opaque (for global view).
function buildSedExposureColormap(
  entry0Alpha: 0 | 255,
): Record<string, [number, number, number, number]> {
  const stops: [number, [number, number, number]][] = [
    [0.00, [68, 1, 84]],    // #440154
    [0.25, [58, 82, 139]],  // #3a528b
    [0.50, [32, 144, 140]], // #20908c
    [0.75, [94, 201, 97]],  // #5ec961
    [1.00, [253, 231, 36]], // #fde724
  ]
  const result: Record<string, [number, number, number, number]> = {}
  for (let i = 0; i <= 255; i++) {
    const t = i / 255
    let si = stops.length - 2
    for (let j = 0; j < stops.length - 1; j++) {
      if (t <= stops[j + 1][0]) {
        si = j
        break
      }
    }
    const [pos0, c0] = stops[si]
    const [pos1, c1] = stops[si + 1]
    const segT = Math.max(0, Math.min(1, pos1 > pos0 ? (t - pos0) / (pos1 - pos0) : 0))
    const alpha = i === 0 ? entry0Alpha : 255
    result[String(i)] = [
      Math.round(c0[0] + (c1[0] - c0[0]) * segT),
      Math.round(c0[1] + (c1[1] - c0[1]) * segT),
      Math.round(c0[2] + (c1[2] - c0[2]) * segT),
      alpha,
    ]
  }
  return result
}

// Regional only: entry 0 is transparent — expression returns 0 for out-of-region pixels.
const SED_EXPOSURE_COLORMAP_REGIONAL = buildSedExposureColormap(0)

export function buildSedExposureTileUrl(
  collectionId: string,
  itemId: string,
  max: number,
  region?: RegionOption,
): string {
  const basePath = `${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/WebMercatorQuad/{z}/{x}/{y}`
  const clampExpr = `where(cog_b1>${max},${max},cog_b1)`

  let expression = clampExpr
  let isRegional = false

  if (region?.bandId != null) {
    if (region.regionType === 'country') {
      expression = `where((cog_b8==${region.bandId}),${clampExpr},0)`
      isRegional = true
    } else if (region.regionType === 'region') {
      expression = `where((cog_b9==${region.bandId}),${clampExpr},0)`
      isRegional = true
    }
  }

  const params = new URLSearchParams({
    rescale: `0,${max}`,
    assets: 'cog',
    expression,
  })

  if (isRegional) {
    // Custom colormap with transparent entry 0 — out-of-region pixels get value 0 from the expression.
    params.set('colormap', JSON.stringify(SED_EXPOSURE_COLORMAP_REGIONAL))
    params.set('nodata', '0')
  } else {
    // Built-in viridis keeps the URL short for global tiles; restrict to band 1 to avoid loading all 9.
    params.set('colormap_name', 'viridis')
    params.set('asset_bidx', 'cog|1')
  }

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
): Promise<SedLoadStats | null> {
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
      p98: statsData.percentile_98 != null ? parseFloat(statsData.percentile_98.toFixed(1)) : null,
    }
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

// Generates a 256-entry RGBA colormap interpolated through the 7-stop design scale.
// entry0Alpha controls whether uint8 value 0 is transparent (for regional filtering,
// where the expression returns 0 for out-of-region pixels) or opaque (for global view).
function buildSedLoadColormap(
  entry0Alpha: 0 | 255,
): Record<string, [number, number, number, number]> {
  const stops: [number, [number, number, number]][] = [
    [0.00, [1, 133, 113]],   // #018571
    [0.17, [118, 187, 176]], // #76BBB0
    [0.33, [209, 228, 225]], // #D1E4E1
    [0.50, [245, 245, 245]], // #F5F5F5
    [0.67, [228, 213, 197]], // #E4D5C5
    [0.83, [199, 158, 116]], // #c79e74
    [1.00, [166, 97, 26]],   // #A6611A
  ]
  const result: Record<string, [number, number, number, number]> = {}
  for (let i = 0; i <= 255; i++) {
    const t = i / 255
    let si = stops.length - 2
    for (let j = 0; j < stops.length - 1; j++) {
      if (t <= stops[j + 1][0]) {
        si = j
        break
      }
    }
    const [pos0, c0] = stops[si]
    const [pos1, c1] = stops[si + 1]
    const segT = Math.max(0, Math.min(1, pos1 > pos0 ? (t - pos0) / (pos1 - pos0) : 0))
    const alpha = i === 0 ? entry0Alpha : 255
    result[String(i)] = [
      Math.round(c0[0] + (c1[0] - c0[0]) * segT),
      Math.round(c0[1] + (c1[1] - c0[1]) * segT),
      Math.round(c0[2] + (c1[2] - c0[2]) * segT),
      alpha,
    ]
  }
  return result
}

// Global: entry 0 is opaque — no out-of-region masking needed.
const SED_LOAD_COLORMAP_GLOBAL = buildSedLoadColormap(255)
// Regional: entry 0 is transparent — expression returns 0 for out-of-region pixels.
const SED_LOAD_COLORMAP_REGIONAL = buildSedLoadColormap(0)

/** Build a MapLibre-compatible tile URL for a sediment load item with dynamic rescale.
 * Uses a custom 7-stop colormap. When a region with a bandId is provided, applies an
 * expression to mask pixels outside that region — out-of-region pixels return 0, which
 * the colormap maps to transparent (alpha=0). */
export function buildSedLoadTileUrl(
  year: number,
  min: number,
  max: number,
  region?: RegionOption,
  rescaleMax?: number,
): string {
  const itemId = `${SED_LOAD_COLLECTION_ID}_${year}`
  const basePath = `${TITILER_API_BASE_URL}/raster/collections/${SED_LOAD_COLLECTION_ID}/items/${itemId}/tiles/WebMercatorQuad/{z}/{x}/{y}`

  const logMax = rescaleMax != null && rescaleMax > 0 ? Math.log10(rescaleMax) : Math.log10(max)
  const logMin = min > 0 ? Math.log10(min) : 0
  const logExpr = `where(cog_b1>0,log10(cog_b1),0)`

  let expression = logExpr
  let isRegional = false
  if (region?.bandId != null) {
    if (region.regionType === 'country') {
      expression = `where((cog_b2==${region.bandId * 1000}),${logExpr},0)`
      isRegional = true
    } else if (region.regionType === 'region') {
      expression = `where((cog_b3==${region.bandId * 1000}),${logExpr},0)`
      isRegional = true
    }
  }

  const colormap = isRegional ? SED_LOAD_COLORMAP_REGIONAL : SED_LOAD_COLORMAP_GLOBAL
  const params = new URLSearchParams({
    rescale: `${logMin},${logMax}`,
    assets: 'cog',
    colormap: JSON.stringify(colormap),
    expression,
  })

  if (isRegional) {
    params.set('nodata', '0')
  }

  return `${basePath}?${params.toString()}`
}
