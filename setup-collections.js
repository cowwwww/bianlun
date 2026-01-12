#!/usr/bin/env node

/**
 * Create PocketBase collections for match_checkins and match_scores
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = 'https://pocketbase-railway-production-d9aa.up.railway.app';
const pb = new PocketBase(POCKETBASE_URL);

async function createCollections() {
    try {
        console.log('🔧 Creating PocketBase Collections\n');

        // Authenticate as admin
        console.log('🔐 Authenticating as admin...');
        await pb.admins.authWithPassword('caoqianhui09@gmail.com', 'cqhcqh09');
        console.log('✅ Admin authenticated\n');

        // Create match_checkins collection
        console.log('📦 Creating match_checkins collection...');
        try {
            await pb.collections.create({
                name: 'match_checkins',
                type: 'base',
                schema: [
                    { name: 'matchId', type: 'text', required: true },
                    { name: 'tournamentId', type: 'text', required: true },
                    { name: 'userId', type: 'text', required: false },
                    { name: 'userName', type: 'text', required: true },
                    { name: 'userRole', type: 'text', required: true },
                    { name: 'teamId', type: 'text', required: false },
                    { name: 'teamName', type: 'text', required: false },
                    { name: 'position', type: 'text', required: false },
                    { name: 'checkinTime', type: 'text', required: false },
                ],
                listRule: '',
                viewRule: '',
                createRule: '',
                updateRule: '',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ match_checkins collection created');
        } catch (error) {
            if (error.message?.includes('already exists')) {
                console.log('⏭️  match_checkins already exists');
            } else {
                console.log('❌ Failed to create match_checkins:', error.message);
            }
        }

        // Create match_scores collection
        console.log('📦 Creating match_scores collection...');
        try {
            await pb.collections.create({
                name: 'match_scores',
                type: 'base',
                schema: [
                    { name: 'matchId', type: 'text', required: true },
                    { name: 'tournamentId', type: 'text', required: true },
                    { name: 'judgeId', type: 'text', required: true },
                    { name: 'judgeName', type: 'text', required: true },
                    { name: 'sideAScore', type: 'number', required: false },
                    { name: 'sideBScore', type: 'number', required: false },
                    { name: 'winner', type: 'text', required: false },
                    { name: 'playerScores', type: 'json', required: false },
                    { name: 'comments', type: 'text', required: false },
                ],
                listRule: '',
                viewRule: '',
                createRule: '',
                updateRule: '',
                deleteRule: '@request.auth.id != ""',
            });
            console.log('✅ match_scores collection created');
        } catch (error) {
            if (error.message?.includes('already exists')) {
                console.log('⏭️  match_scores already exists');
            } else {
                console.log('❌ Failed to create match_scores:', error.message);
            }
        }

        console.log('\n✅ Collections setup complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createCollections();
