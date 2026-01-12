#!/usr/bin/env node

/**
 * Fix PocketBase API rules for matches collection to allow public creation
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = 'https://pocketbase-railway-production-d9aa.up.railway.app';
const pb = new PocketBase(POCKETBASE_URL);

async function fixMatchesRule() {
    try {
        console.log('🔧 Fixing Matches Collection API Rules\n');

        // Authenticate as admin
        console.log('🔐 Authenticating as admin...');
        await pb.admins.authWithPassword('caoqianhui09@gmail.com', 'cqhcqh09');
        console.log('✅ Admin authenticated\n');

        // Update matches collection rules
        console.log('📦 Updating matches collection rules...');
        try {
            const collection = await pb.collections.getOne('matches');

            await pb.collections.update('matches', {
                listRule: '',      // Public read
                viewRule: '',      // Public read
                createRule: '',    // Public create (was probably requiring auth)
                updateRule: '',    // Public update
                deleteRule: '@request.auth.id != ""',  // Keep delete protected
            });
            console.log('✅ matches collection rules updated');
        } catch (error) {
            console.log('❌ Failed to update matches:', error.message);
        }

        console.log('\n✅ Done!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixMatchesRule();
