#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Direct API test script for TiTiler endpoints
 * Run with: node src/utils/test-titiler-api.js
 */

const API_BASE_URL = 'https://mermaid.prescient.earth'

async function testStatisticsEndpoint() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║  Test 1: Statistics Endpoint (Realm ID 2)              ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  const collectionId = 'gpw_sediment_exposure'
  const itemId = 'gpw_sediment_exposure_2020'
  const expression = 'where((cog_b9==2), cog_b1, 0)'

  const url = new URL(
    `${API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/statistics`
  )

  url.searchParams.append('assets', 'cog')
  url.searchParams.append('asset_bidx', 'cog|1,9')
  url.searchParams.append('expression', expression)
  url.searchParams.append('max_size', '1025')

  console.log('📍 URL:', url.toString())
  console.log('\n⏳ Fetching statistics...\n')

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    console.log('✅ Success! Raw Response (first 500 chars):')
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...')

    const statsData = data[expression]
    if (statsData) {
      const min = parseFloat(statsData.min.toFixed(1))
      const max = parseFloat(statsData.max.toFixed(1))

      console.log('\n📊 Extracted Values:')
      console.log(`   Min (1 decimal): ${min}`)
      console.log(`   Max (1 decimal): ${max}`)
      console.log(`   Mean: ${statsData.mean}`)
      console.log(`   Valid pixels: ${statsData.valid_pixels}`)

      return { min, max }
    }
    return null
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

async function testGlobalStatistics() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║  Test 2: Statistics Endpoint (Global - No Filter)      ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  const collectionId = 'gpw_sediment_exposure'
  const itemId = 'gpw_sediment_exposure_2020'
  const expression = 'cog_b1'

  const url = new URL(
    `${API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/statistics`
  )

  url.searchParams.append('assets', 'cog')
  url.searchParams.append('asset_bidx', 'cog|1,9')
  url.searchParams.append('expression', expression)
  url.searchParams.append('max_size', '1025')

  console.log('📍 URL:', url.toString())
  console.log('\n⏳ Fetching statistics...\n')

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    console.log('✅ Success!')

    const statsData = data[expression]
    if (statsData) {
      const min = parseFloat(statsData.min.toFixed(1))
      const max = parseFloat(statsData.max.toFixed(1))

      console.log('\n📊 Extracted Values:')
      console.log(`   Min (1 decimal): ${min}`)
      console.log(`   Max (1 decimal): ${max}`)

      return { min, max }
    }
    return null
  } catch (error) {
    console.error('❌ Error:', error.message)
    return null
  }
}

function testBuildTileUrl() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║  Test 3: Build Tile URL with Dynamic Rescale           ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  const collectionId = 'gpw_sediment_exposure'
  const itemId = 'gpw_sediment_exposure_2020'
  const z = 10
  const x = 512
  const y = 512
  const min = 0.4
  const max = 34.2
  const expression = 'where((cog_b9==2), cog_b1, 0)'

  const url = new URL(
    `${API_BASE_URL}/raster/collections/${collectionId}/items/${itemId}/tiles/WebMercatorQuad/${z}/${x}/${y}`
  )

  url.searchParams.append('rescale', `${min},${max}`)
  url.searchParams.append('assets', 'cog')
  url.searchParams.append('colormap_name', 'viridis')
  url.searchParams.append('asset_bidx', 'cog|1')
  url.searchParams.append('expression', expression)

  const tileUrl = url.toString()

  console.log('🎨 Generated Tile URL:')
  console.log(tileUrl)

  console.log('\n✅ URL Components:')
  console.log(`   Base: ${API_BASE_URL}`)
  console.log(`   Path: /raster/collections/${collectionId}/items/${itemId}/tiles/WebMercatorQuad/${z}/${x}/${y}`)
  console.log(`   Rescale: ${min},${max}`)
  console.log(`   Colormap: viridis`)
  console.log(`   Expression: ${expression}`)

  return tileUrl
}

async function runAllTests() {
  console.log('\n')
  console.log(
    '═══════════════════════════════════════════════════════════════'
  )
  console.log('         TiTiler API Endpoint Tests                      ')
  console.log(
    '═══════════════════════════════════════════════════════════════'
  )

  const statsRealm = await testStatisticsEndpoint()
  const statsGlobal = await testGlobalStatistics()
  const tileUrl = testBuildTileUrl()

  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║  Summary                                                ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  console.log('Test 1 (Realm Statistics):', statsRealm ? '✅ PASS' : '❌ FAIL')
  console.log('Test 2 (Global Statistics):', statsGlobal ? '✅ PASS' : '❌ FAIL')
  console.log('Test 3 (Tile URL):', tileUrl ? '✅ PASS' : '❌ FAIL')

  console.log('\n')
}

runAllTests().catch(console.error)
