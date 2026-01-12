#!/usr/bin/env node

/**
 * Deploy Schema Script
 * Recreates collections with proper schema from export file
 */

const PocketBase = require('pocketbase/cjs');
const fs = require('fs');
const path = require('path');

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';
const EXPORT_FILE = path.join(__dirname, 'pocketbase', 'collections_full_export.json');

const pb = new PocketBase(POCKETBASE_URL);

async function deploySchema() {
  try {
    console.log('🚀 Deploying PocketBase Schema\n');
    console.log(`📍 PocketBase: ${POCKETBASE_URL}`);
    console.log(`📄 Schema File: ${EXPORT_FILE}\n`);

    // Read the schema export
    if (!fs.existsSync(EXPORT_FILE)) {
      throw new Error(`Schema file not found: ${EXPORT_FILE}`);
    }

    const schemaData = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf8'));
    console.log(`✅ Loaded schema with ${schemaData.length} collections\n`);

    // Filter collections we want to deploy (exclude system collections)
    const collectionsToDeploy = schemaData.filter((col: any) =>
      !col.system && ['registrations', 'team_members'].includes(col.name)
    );

    console.log(`🎯 Will deploy ${collectionsToDeploy.length} collections:\n`);
    collectionsToDeploy.forEach((col: any) => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const collection of collectionsToDeploy) {
      try {
        console.log(`🔧 Deploying ${collection.name}...`);

        // Check if collection exists
        let existingCollection = null;
        try {
          existingCollection = await pb.collections.getOne(collection.id);
          console.log(`   Collection exists, will update`);
        } catch (e) {
          console.log(`   Collection doesn't exist, will create`);
        }

        // Prepare collection data
        const collectionData = {
          ...collection,
          // Ensure API rules allow public read
          listRule: 'true',
          viewRule: 'true',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.id != ""',
          deleteRule: '@request.auth.id != ""',
        };

        if (existingCollection) {
          // Update existing collection
          await pb.collections.update(collection.id, collectionData);
          console.log(`   ✅ Updated ${collection.name}`);
        } else {
          // Create new collection
          await pb.collections.create(collectionData);
          console.log(`   ✅ Created ${collection.name}`);
        }

        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed ${collection.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Deployment Summary:');
    console.log(`   ✅ Successfully deployed: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Schema deployed successfully!');
      console.log('💡 You may need to re-import your data.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  deploySchema().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { deploySchema };
