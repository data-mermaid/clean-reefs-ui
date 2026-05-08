import { RegionOption } from '../types/RegionDataTypes'
import { TITILER_API_BASE_URL, TITILER_API_TIMEOUT, SED_DISPERSAL_COLLECTION_ID } from '../constants'
/**
 * Build the TiTiler expression for the selected region.
 * Returns null for global (no filter) or regions with no data (fallback to global).
 */
export function buildExpression(region: RegionOption): string | null {
  if (!region.bandId) {
    return null
  }

  if (region.regionType === 'country') {
    return `where((cog_b8==${region.bandId}), cog_b1, 0)`
  }
  if (region.regionType === 'region') {
    return `where((cog_b9==${region.bandId}), cog_b1, 0)`
  }

  return null
}

/** Build the TiTiler item ID for the selected year */
export function buildItemId(year: number): string {
  return `${SED_DISPERSAL_COLLECTION_ID}_${year}`
}

/** Derive asset_bidx from the expression — only load the bands actually referenced */
function buildAssetBidx(expression: string | null): string {
  // matches all cog_b{N} references (e.g. cog_b8, cog_b9), captures the band number
  const filterBands = [...(expression?.matchAll(/cog_b(\d+)/g) ?? [])]
    .map((m) => Number(m[1]))
    .filter((band) => band !== 1) // band 1 is the value band, always included
  const uniqueBands = [...new Set(filterBands)].sort((a, b) => a - b)
  return uniqueBands.length ? `cog|1,${uniqueBands.join(',')}` : 'cog|1'
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
  expression: string | null
): Promise<MinMaxValues | null> {
  const resolvedExpression = expression ?? 'cog_b1'
  try {
    const url = new URL(`${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/statistics`)

    // Add query parameters
    url.searchParams.append('assets', 'cog')
    url.searchParams.append('asset_bidx', buildAssetBidx(expression))
    url.searchParams.append('expression', resolvedExpression)
    url.searchParams.append('max_size', '1025')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TITILER_API_TIMEOUT)

    console.warn('[TiTiler] Fetching statistics:', url.toString())

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[TiTiler] Statistics API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data: StatisticsResponse = await response.json()

    // The response key is the expression itself
    const statsData = data[resolvedExpression]

    if (!statsData || statsData.min === undefined || statsData.max === undefined) {
      console.error('[TiTiler] Invalid statistics response:', data)
      return null
    }

    const minMax: MinMaxValues = {
      min: parseFloat(statsData.min.toFixed(1)),
      max: parseFloat(statsData.max.toFixed(1)),
    }

    console.warn('[TiTiler] Statistics fetched:', minMax)
    return minMax
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[TiTiler] Statistics request timeout')
    } else {
      console.error('[TiTiler] Statistics fetch error:', error)
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
  tileMatrixSet: string = 'WebMercatorQuad'
): string {
  const url = new URL(
    `${TITILER_API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/${tileMatrixSet}/${z}/${x}/${y}`
  )

  url.searchParams.append('rescale', `${min},${max}`)
  url.searchParams.append('assets', 'cog')
  url.searchParams.append('colormap_name', 'viridis')
  url.searchParams.append('asset_bidx', 'cog|1')
  url.searchParams.append('expression', expression)

  return url.toString()
}
