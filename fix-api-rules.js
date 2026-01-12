#!/usr/bin/env node

/**
 * Fix PocketBase API Rules Script
 * 
 * This script updates API rules for all collections to allow public read access
 * while requiring authentication for create/update/delete operations.
 * 
 * Requirements:
 *   - Node.js 18+ (for native fetch support)
 *   - Or install node-fetch: npm install node-fetch
 * 
 * Usage:
 *   node fix-api-rules.js [POCKETBASE_URL] [ADMIN_EMAIL] [ADMIN_PASSWORD]
 * 
 * Example:
 *   node fix-api-rules.js https://pocketbase-railway-production-d9aa.up.railway.app admin@example.com password123
 */

const readline = require('readline');

// Use node-fetch if fetch is not available (Node.js < 18)
let fetch;
try {
  fetch = globalThis.fetch;
} catch (e) {
  try {
    fetch = require('node-fetch');
  } catch (e2) {
    console.error('Error: fetch is not available. Please use Node.js 18+ or install node-fetch:');
    console.error('  npm install node-fetch');
    process.exit(1);
  }
}

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';
const ADMIN_EMAIL = process.argv[3];
const ADMIN_PASSWORD = process.argv[4];

// Collections that need public read access
const COLLECTIONS_TO_FIX = [
  'tournaments',
  'topics',
  'timer_projects',
  'judges',
  'matches',
  'circuits',
  'circuit_matches',
  'registrations',
  'team_members',
  'judge_assignments',
  'judge_scores',
  'form_configs',
  'ratings',
  'resources',
  'timers',
];

// API Rules configuration
const API_RULES = {
  listRule: 'true', // Public read access
  viewRule: 'true', // Public read access
  createRule: '@request.auth.id != ""', // Authenticated users only
  updateRule: '@request.auth.id != ""', // Authenticated users only
  deleteRule: '@request.auth.id != ""', // Authenticated users only
};

async function promptForCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      rl.close();
      resolve({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      return;
    }

    console.log('\n📧 PocketBase Admin Credentials Required\n');

    rl.question('Admin Email: ', (email) => {
      rl.question('Admin Password: ', (password) => {
        rl.close();
        resolve({ email, password });
      });
    });
  });
}

async function loginToPocketBase(email, password) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Login failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    throw new Error(`Failed to login: ${error.message}`);
  }
}

async function getCollections(token) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections?perPage=500`, {
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    throw new Error(`Failed to get collections: ${error.message}`);
  }
}

async function updateCollectionRules(token, collectionId, collectionName) {
  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/${collectionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...API_RULES,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update ${collectionName}: ${error.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to update ${collectionName}: ${error.message}`);
  }
}

async function main() {
  console.log('🔧 PocketBase API Rules Fix Script\n');
  console.log(`📍 PocketBase URL: ${POCKETBASE_URL}\n`);

  try {
    // Get credentials
    const { email, password } = await promptForCredentials();

    console.log('\n🔐 Logging in...');
    const token = await loginToPocketBase(email, password);
    console.log('✅ Login successful!\n');

    // Get all collections
    console.log('📋 Fetching collections...');
    const collections = await getCollections(token);
    console.log(`✅ Found ${collections.length} collections\n`);

    // Filter collections that need fixing
    const collectionsToFix = collections.filter((col) =>
      COLLECTIONS_TO_FIX.includes(col.name)
    );

    console.log(`🎯 Found ${collectionsToFix.length} collections to fix:\n`);
    collectionsToFix.forEach((col) => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Update each collection
    let successCount = 0;
    let failCount = 0;

    for (const collection of collectionsToFix) {
      try {
        console.log(`⏳ Updating ${collection.name}...`);
        await updateCollectionRules(token, collection.id, collection.name);
        console.log(`✅ ${collection.name} updated successfully\n`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${collection.name}: ${error.message}\n`);
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 API rules have been updated!');
      console.log('💡 Refresh your frontend application to see the changes.\n');
    }

    if (failCount > 0) {
      console.log('⚠️  Some collections failed to update.');
      console.log('💡 You may need to update them manually using the HTML tool:\n');
      console.log('   file://' + __dirname + '/fix-pocketbase-api-rules.html\n');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Alternative: Use the HTML tool to fix rules manually:');
    console.error('   file://' + __dirname + '/fix-pocketbase-api-rules.html\n');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, API_RULES, COLLECTIONS_TO_FIX };

