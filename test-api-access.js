#!/usr/bin/env node

/**
 * Test API Access Script
 * Tests if PocketBase API rules allow public access to collections
 */

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';
const COLLECTION = process.argv[3] || 'registrations';

async function testApiAccess() {
  console.log('🧪 Testing PocketBase API Access\n');
  console.log(`📍 URL: ${POCKETBASE_URL}`);
  console.log(`📋 Collection: ${COLLECTION}\n`);

  try {
    // Test listing records
    const listUrl = `${POCKETBASE_URL}/api/collections/${COLLECTION}/records?page=1&perPage=5&sort=-created`;
    console.log(`🔍 Testing list access: ${listUrl}`);

    const listResponse = await fetch(listUrl);
    console.log(`   Status: ${listResponse.status} ${listResponse.statusText}`);

    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`   ✅ List access works! Found ${data.items?.length || 0} records\n`);
    } else {
      const error = await listResponse.text();
      console.log(`   ❌ List access failed: ${error}\n`);
    }

    // Test with filter (like the frontend uses)
    const filterUrl = `${POCKETBASE_URL}/api/collections/${COLLECTION}/records?page=1&perPage=5&sort=-created&filter=tournamentId="go8jpyetsvirzbp"`;
    console.log(`🔍 Testing filtered access: ${filterUrl}`);

    const filterResponse = await fetch(filterUrl);
    console.log(`   Status: ${filterResponse.status} ${filterResponse.statusText}`);

    if (filterResponse.ok) {
      const data = await filterResponse.json();
      console.log(`   ✅ Filtered access works! Found ${data.items?.length || 0} records\n`);
    } else {
      const error = await filterResponse.text();
      console.log(`   ❌ Filtered access failed: ${error}\n`);
    }

    // Try alternative filter syntax
    console.log('🔍 Testing alternative filter syntax...');
    const altFilters = [
      `tournamentId='go8jpyetsvirzbp'`,
      `tournamentId~'go8jpyetsvirzbp'`,
      `tournamentId%3D%27go8jpyetsvirzbp%27`,
    ];

    for (const filter of altFilters) {
      const altUrl = `${POCKETBASE_URL}/api/collections/${COLLECTION}/records?page=1&perPage=5&sort=-created&filter=${filter}`;
      console.log(`   Testing: ${filter}`);

      try {
        const altResponse = await fetch(altUrl);
        console.log(`   Status: ${altResponse.status} ${altResponse.statusText}`);

        if (altResponse.ok) {
          const data = await altResponse.json();
          console.log(`   ✅ Alternative filter works! Found ${data.items?.length || 0} records`);
          break;
        }
      } catch (e) {
        console.log(`   ❌ Error: ${e.message}`);
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testApiAccess();