#!/usr/bin/env node

/**
 * Fix Registrations Script
 * Updates existing registration records with proper data from team_members
 */

const PocketBase = require('pocketbase/cjs');

const POCKETBASE_URL = process.argv[2] || 'https://pocketbase-railway-production-d9aa.up.railway.app';
const TOURNAMENT_ID = process.argv[3] || 'go8jpyetsvirzbp';

const pb = new PocketBase(POCKETBASE_URL);

async function fixRegistrations() {
  try {
    console.log('🔧 Fixing Registration Records\n');
    console.log(`📍 PocketBase: ${POCKETBASE_URL}`);
    console.log(`🏆 Tournament: ${TOURNAMENT_ID}\n`);

    // Get all team members for this tournament
    console.log('📋 Fetching team members...');
    const teamMembers = await pb.collection('team_members').getFullList({
      filter: `tournamentId="${TOURNAMENT_ID}"`,
    });

    console.log(`✅ Found ${teamMembers.length} team members\n`);

    // Group team members by registration
    const registrationGroups = {};
    teamMembers.forEach(member => {
      if (!registrationGroups[member.registrationId]) {
        registrationGroups[member.registrationId] = [];
      }
      registrationGroups[member.registrationId].push(member);
    });

    console.log(`📝 Found ${Object.keys(registrationGroups).length} registrations to fix\n`);

    let successCount = 0;
    let errorCount = 0;

    // Fix each registration
    for (const [registrationId, members] of Object.entries(registrationGroups)) {
      try {
        console.log(`🔧 Fixing registration: ${registrationId}`);

        // Extract data from team members
        const leader = members.find(m => m.role === 'leader');
        const accompanyingJudge = members.find(m => m.role === 'accompanying_judge');
        const regularMembers = members.filter(m => m.role === 'member');

        // Get team name from leader or first member
        const teamName = leader?.name?.replace(/[（(]领队[）)]/g, '').trim() ||
                        members[0]?.name?.replace(/[（(]领队[）)]/g, '').trim() ||
                        `Team ${registrationId.slice(0, 8)}`;

        // Get participants list
        const participants = members.map(m => m.name);

        // Get contact from leader
        const contact = leader?.contact || accompanyingJudge?.contact;

        // Prepare update data
        const updateData = {
          tournamentId: TOURNAMENT_ID,
          teamName: teamName,
          participants: participants,
          contact: contact || undefined,
          status: 'approved',
          paymentStatus: 'paid',
        };

        // Update the registration
        await pb.collection('registrations').update(registrationId, updateData);

        console.log(`   ✅ Updated: "${teamName}" (${members.length} members)`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to update ${registrationId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Fix Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Registration records have been fixed!');
      console.log('💡 Refresh your admin dashboard to see the teams.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixRegistrations().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fixRegistrations };
