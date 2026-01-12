#!/usr/bin/env node

/**
 * List Tournaments from PocketBase
 * Helps find the tournament ID for importing teams
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';

const pb = new PocketBase(POCKETBASE_URL);

async function listTournaments() {
  try {
    console.log('📋 Fetching tournaments from PocketBase...\n');
    console.log(`URL: ${POCKETBASE_URL}\n`);

    const records = await pb.collection('tournaments').getFullList({
      sort: '-created',
    });

    if (records.length === 0) {
      console.log('⚠️  No tournaments found');
      return;
    }

    console.log(`✅ Found ${records.length} tournament(s):\n`);
    console.log('='.repeat(80));
    
    records.forEach((tournament, index) => {
      console.log(`\n${index + 1}. ${tournament.name || tournament.title || 'Untitled'}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Status: ${tournament.status || 'N/A'}`);
      console.log(`   Start Date: ${tournament.startDate || 'N/A'}`);
      console.log(`   Created: ${tournament.created || 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Copy the ID above to use with the import script\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

listTournaments();
