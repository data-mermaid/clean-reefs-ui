const API_BASE_URL = 'https://mermaid.prescient.earth'
const API_TIMEOUT = 10000 // 10 seconds in milliseconds

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
 * Fetch statistics for a region from TiTiler
 * @param collectionId - Collection ID (e.g., 'gpw_sediment_exposure')
 * @param itemId - Item ID (e.g., 'gpw_sediment_exposure_2020')
 * @param expression - Expression for filtering (e.g., 'where((cog_b9==2), cog_b1, 0)')
 * @returns MinMaxValues with min and max values
 */
export async function fetchStatistics(
  collectionId: string,
  itemId: string,
  expression: string
): Promise<MinMaxValues | null> {
  try {
    const url = new URL(`${API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/statistics`)

    // Add query parameters
    url.searchParams.append('assets', 'cog')
    url.searchParams.append('asset_bidx', 'cog|1,9')
    url.searchParams.append('expression', expression)
    url.searchParams.append('max_size', '1025')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

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
    const statsData = data[expression]

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
    `${API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/${tileMatrixSet}/${z}/${x}/${y}`
  )

  url.searchParams.append('rescale', `${min},${max}`)
  url.searchParams.append('assets', 'cog')
  url.searchParams.append('colormap_name', 'viridis')
  url.searchParams.append('asset_bidx', 'cog|1')
  url.searchParams.append('expression', expression)

  return url.toString()
}
