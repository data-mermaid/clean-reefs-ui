import { RegionOption } from '../types/RegionDataTypes'
import {
  TITILER_API_BASE_URL,
  TITILER_API_TIMEOUT,
  SED_DISPERSAL_COLLECTION_ID,
} from '../constants'
export interface ExpressionConfig {
  expression: string | null
  assetBidx: string
}

/** Build the TiTiler expression and required asset bands for the selected region. */
export function buildExpression(region: RegionOption): ExpressionConfig {
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

/** Build the TiTiler item ID for the selected year */
export function buildItemId(year: number): string {
  return `${SED_DISPERSAL_COLLECTION_ID}_${year}`
}

/**
 * Build a MapLibre-compatible tile URL template with dynamic rescale.
 * Uses {z}/{x}/{y} placeholders that MapLibre fills in when fetching tiles.
 * The expression clamps values at max so nothing renders out of range.
 */
export function buildTileUrlTemplate(collectionId: string, itemId: string, max: number): string {
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

interface StatisticsResponse {
  [key: string]: {
    min: number
    max: number
    mean?: number
    count?: number
    sum?: number
    std?: number
    median?: number
  }
}

interface MinMaxValues {
  min: number
  max: number
}

/**
 * Fetch statistics for a region from TiTiler.
 * Pass null expression for global (no region filter).
 * @param collectionId - Collection ID (e.g., 'gpw_sediment_exposure')
 * @param itemId - Item ID (e.g., 'gpw_sediment_exposure_2020')
 * @param expression - Expression for filtering, or null for global
 * @returns MinMaxValues with min and max values
 */
export async function fetchStatistics(
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
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      // request timed out or was cancelled by the caller
    }
    return null
  }
}

/**
 * Build a tile URL with dynamic rescale values
 * @param collectionId - Collection ID
 * @param itemId - Item ID
 * @param z - Zoom level
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 * @param min - Minimum rescale value
 * @param max - Maximum rescale value
 * @param expression - Expression for filtering
 * @param tileMatrixSet - Tile matrix set (default: 'WebMercatorQuad')
 * @returns Full tile URL
 */
export function buildTileUrl(
  collectionId: string,
  itemId: string,
  z: number,
  x: number,
  y: number,
  min: number,
  max: number,
  expression: string,
  tileMatrixSet: string = 'WebMercatorQuad',
): string {
  const url = new URL(
    `${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/${tileMatrixSet}/${z}/${x}/${y}`,
  )

  url.searchParams.append('rescale', `${min},${max}`)
  url.searchParams.append('assets', 'cog')
  url.searchParams.append('colormap_name', 'viridis')
  url.searchParams.append('asset_bidx', 'cog|1')
  url.searchParams.append('expression', expression)

  return url.toString()
}
