#!/usr/bin/env node

/**
 * Convert pb_schema.json to PocketBase migration
 */

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'pb_schema.json');
const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

console.log(`Found ${schemaData.length} collections in schema file`);

// Generate migration file
const timestamp = Date.now();
const migrationFilename = `${timestamp}_import_pb_schema.js`;
const migrationPath = path.join(__dirname, 'pocketbase', 'pb_migrations', migrationFilename);

let migrationContent = `/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // Delete existing collections if they exist (except system collections)
  const existingCollections = [
    "Users", "Wechatlogin", "timers", "timer_projects", "judges",
    "ratings", "registrations", "tournaments", "matches", "form_configs",
    "circuits", "circuit_matches", "judge_scores", "judge_assignments",
    "team_members", "topics", "resources"
  ];

  existingCollections.forEach(collectionName => {
    try {
      const collection = dao.findCollectionByNameOrId(collectionName);
      if (collection) {
        dao.deleteCollection(collection);
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  });

  // Import collections from pb_schema.json
`;

schemaData.forEach((collectionData, index) => {
  const collectionJson = JSON.stringify(collectionData, null, 2);
  migrationContent += `
  // ${index + 1}. ${collectionData.name} collection
  const ${collectionData.name.toLowerCase()}Collection = new Collection(${collectionJson});

  dao.saveCollection(${collectionData.name.toLowerCase()}Collection);`;
});

migrationContent += `

}, (db) => {
  const dao = new Dao(db);

  // Down migration - delete all imported collections
  const collectionsToDelete = [
    "Users", "Wechatlogin", "timers", "timer_projects", "judges",
    "ratings", "registrations", "tournaments", "matches", "form_configs",
    "circuits", "circuit_matches", "judge_scores", "judge_assignments",
    "team_members", "topics", "resources"
  ];

  collectionsToDelete.forEach(collectionName => {
    try {
      const collection = dao.findCollectionByNameOrId(collectionName);
      if (collection) {
        dao.deleteCollection(collection);
      }
    } catch (error) {
      // Collection doesn't exist, continue
    }
  });
})`;

// Write migration file
fs.writeFileSync(migrationPath, migrationContent);

console.log(`✅ Migration file created: ${migrationFilename}`);
console.log(`📍 Location: ${migrationPath}`);
console.log('');
console.log('To apply this migration:');
console.log('1. cd pocketbase');
console.log('2. ./pocketbase migrate');
console.log('');
console.log('For Railway deployment:');
console.log('1. Commit and push this migration file');
console.log('2. Redeploy on Railway');

