#!/usr/bin/env node

/**
 * Sync 随评 (Accompanying Judges) to Judges Collection
 * 
 * This script reads team_members with role='accompanying_judge' and creates
 * corresponding records in the judges collection if they don't exist.
 * 
 * Usage:
 *   node sync-judges.js [POCKETBASE_URL] [TOURNAMENT_ID]
 * 
 * Example:
 *   node sync-judges.js https://pocketbase-railway-production-d9aa.up.railway.app go8jpyetsvirzbp
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';
const TOURNAMENT_ID = process.argv[3];

const pb = new PocketBase(POCKETBASE_URL);

async function syncJudges() {
    try {
        console.log('🔄 Syncing 随评 to Judges Collection\n');
        console.log(`PocketBase URL: ${POCKETBASE_URL}`);
        console.log(`Tournament ID: ${TOURNAMENT_ID || 'All'}\n`);

        // Authenticate as admin
        console.log('🔐 Authenticating as admin...');
        try {
            await pb.admins.authWithPassword('caoqianhui09@gmail.com', 'cqhcqh09');
            console.log('✅ Admin authenticated\n');
        } catch (authError) {
            console.error('❌ Admin authentication failed:', authError.message);
            console.log('   Trying to continue without authentication...\n');
        }

        // Get all team_members with role = 'accompanying_judge'
        console.log('📖 Fetching accompanying judges from team_members...');

        let filter = `role="accompanying_judge"`;
        if (TOURNAMENT_ID) {
            filter += ` && tournamentId="${TOURNAMENT_ID}"`;
        }

        const accompanyingJudges = await pb.collection('team_members').getFullList({
            filter: filter,
            sort: 'created'
        });

        console.log(`✅ Found ${accompanyingJudges.length} accompanying judges\n`);

        if (accompanyingJudges.length === 0) {
            console.log('⚠️  No accompanying judges found in team_members');
            return;
        }

        // Get existing judges to avoid duplicates
        console.log('📖 Fetching existing judges...');
        const existingJudges = await pb.collection('judges').getFullList();
        const existingJudgeNames = new Set(existingJudges.map(j => j.fullName));
        console.log(`   Found ${existingJudges.length} existing judges\n`);

        // Get registrations for team names
        console.log('📖 Fetching registrations for team names...');
        const registrations = await pb.collection('registrations').getFullList();
        const regMap = new Map(registrations.map(r => [r.id, r.teamName]));

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Process each accompanying judge
        for (const member of accompanyingJudges) {
            try {
                // Check if judge already exists
                if (existingJudgeNames.has(member.name)) {
                    console.log(`⏭️  Skipping ${member.name} (already exists in judges)`);
                    skipCount++;
                    continue;
                }

                // Get team name from registration
                const teamName = regMap.get(member.registrationId) || 'Unknown Team';

                // Create judge record
                const judgeData = {
                    fullName: member.name,
                    experience: member.experience || '',
                    phone: member.contact || '',
                    wechatId: member.contact || '',
                    judgeTypes: ['随队评委'],
                    status: 'approved',
                    obligationsLeft: 3,
                    totalObligations: 3,
                    teamId: member.registrationId,
                    teamName: teamName
                };

                await pb.collection('judges').create(judgeData);
                console.log(`✅ Created judge: ${member.name} (${teamName})`);
                existingJudgeNames.add(member.name); // Track to avoid duplicates
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to create judge ${member.name}: ${error.message}`);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Sync Summary:');
        console.log(`   ✅ Created: ${successCount} judges`);
        console.log(`   ⏭️  Skipped: ${skipCount} (already exist)`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ Sync error:', error);
        process.exit(1);
    }
}

// Run the sync
syncJudges();
