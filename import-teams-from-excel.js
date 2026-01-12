#!/usr/bin/env node

/**
 * Import Teams from Excel File
 * 
 * This script reads team registration data from an Excel file and imports it into PocketBase.
 * 
 * Logic for "随评" (accompanying judge):
 * - If "name(随评)" field exists OR if "4.是否需要代请评委" says "不需要"
 * - Then the second team member is marked as "accompanying_judge"
 * 
 * Usage:
 *   node import-teams-from-excel.js [POCKETBASE_URL] [TOURNAMENT_ID] [EXCEL_FILE_PATH]
 * 
 * Example:
 *   node import-teams-from-excel.js http://127.0.0.1:8090 tournament-id-here "编号 (1).xlsx"
 */

const XLSX = require('xlsx');
const PocketBase = require('pocketbase/cjs');
const path = require('path');
const readline = require('readline');

const POCKETBASE_URL = process.argv[2] || 'http://127.0.0.1:8090';
const TOURNAMENT_ID = process.argv[3];
const EXCEL_FILE = process.argv[4] || path.join(__dirname, '编号 (1).xlsx');

const pb = new PocketBase(POCKETBASE_URL);

// Helper function to prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Parse member info from format: "Name, School, Year, Contact, Experience"
function parseMemberInfo(memberString) {
  if (!memberString) return null;

  const parts = memberString.split(',').map(p => p.trim());
  const name = parts[0] || '';

  // Check if name contains (随评)
  const isAccompanyingJudge = name.includes('（随评）') || name.includes('(随评)');
  const cleanName = name.replace(/[（(]随评[）)]/g, '').trim();

  return {
    name: cleanName,
    school: parts[1] || '',
    year: parts[2] || '',
    contact: parts[3] || '',
    experience: parts.slice(4).join(', ') || '',
    isAccompanyingJudge: isAccompanyingJudge,
  };
}

// Extract team members from a row
function extractTeamMembers(row) {
  const members = [];

  // Get team name column
  const teamNameCol = Object.keys(row).find(key => key.includes('队伍名称'));
  if (!teamNameCol) return members;

  // Get first member from "3.选项二：请按照以下格式提交申请"
  const firstMemberCol = Object.keys(row).find(key =>
    key.includes('选项二') || key.includes('请按照以下格式')
  );

  if (firstMemberCol && row[firstMemberCol]) {
    const memberInfo = parseMemberInfo(row[firstMemberCol].toString());
    if (memberInfo && memberInfo.name) {
      members.push({
        name: memberInfo.name,
        role: 'leader',
        school: memberInfo.school,
        year: memberInfo.year,
        contact: memberInfo.contact,
        experience: memberInfo.experience,
      });
    }
  }

  // Get additional members from __EMPTY columns
  const emptyCols = Object.keys(row)
    .filter(key => key.startsWith('__EMPTY'))
    .sort((a, b) => {
      // Sort __EMPTY, __EMPTY_1, __EMPTY_2, etc.
      const aNum = a === '__EMPTY' ? 0 : parseInt(a.replace('__EMPTY_', '')) || 0;
      const bNum = b === '__EMPTY' ? 0 : parseInt(b.replace('__EMPTY_', '')) || 0;
      return aNum - bNum;
    });

  // Check if "4.是否需要代请评委" says "不需要"
  const needJudgeCol = Object.keys(row).find(key => key.includes('是否需要代请评委'));
  const needJudge = needJudgeCol ? row[needJudgeCol]?.toString() : '';
  const shouldBeAccompanyingJudge = needJudge.includes('不需要');

  emptyCols.forEach((col, index) => {
    if (row[col] && row[col].toString().trim()) {
      const memberInfo = parseMemberInfo(row[col].toString());
      if (memberInfo && memberInfo.name) {
        // Second member (index 0 of __EMPTY) is accompanying judge if:
        // 1. Name contains (随评), OR
        // 2. "4.是否需要代请评委" says "不需要"
        const isAccompanyingJudge = memberInfo.isAccompanyingJudge ||
          (shouldBeAccompanyingJudge && index === 0);

        members.push({
          name: memberInfo.name,
          role: isAccompanyingJudge ? 'accompanying_judge' : 'member',
          school: memberInfo.school,
          year: memberInfo.year,
          contact: memberInfo.contact,
          experience: memberInfo.experience,
        });
      }
    }
  });

  return members;
}

async function importTeams() {
  try {
    console.log('📊 Importing Teams from Excel\n');
    console.log(`PocketBase URL: ${POCKETBASE_URL}`);
    console.log(`Excel File: ${EXCEL_FILE}\n`);

    // Check if tournament ID is provided
    let tournamentId = TOURNAMENT_ID;
    if (!tournamentId) {
      tournamentId = await prompt('Enter Tournament ID: ');
      if (!tournamentId) {
        console.error('❌ Tournament ID is required');
        process.exit(1);
      }
    }

    // Read Excel file
    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`✅ Found ${data.length} rows\n`);

    if (data.length === 0) {
      console.log('⚠️  No data found in Excel file');
      return;
    }

    // Display first row to understand structure
    console.log('📋 Column names found:');
    const columns = Object.keys(data[0]);
    columns.forEach((col, i) => console.log(`  ${i}: ${col}`));
    console.log('\n');

    // Ask for confirmation
    const confirm = await prompt('Continue with import? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('Import cancelled');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const judgesCreated = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Find team name - look for column containing "队伍名称"
        const teamNameCol = Object.keys(row).find(key =>
          key.includes('队伍名称')
        );

        if (!teamNameCol || !row[teamNameCol]) {
          console.log(`⚠️  Row ${i + 1}: Skipping - no team name found`);
          continue;
        }

        const teamName = row[teamNameCol].toString().trim();
        if (!teamName) {
          console.log(`⚠️  Row ${i + 1}: Skipping - empty team name`);
          continue;
        }

        // Find members from "选项二" column (first member with 领队)
        const members = [];

        // Get first member from "3.选项二：请按照以下格式提交申请" column
        const firstMemberCol = Object.keys(row).find(key =>
          key.includes('选项二') && key.includes('格式')
        );

        if (firstMemberCol && row[firstMemberCol]) {
          const memberInfo = parseMemberInfo(row[firstMemberCol].toString());
          if (memberInfo && memberInfo.name) {
            members.push({
              name: memberInfo.name,
              role: memberInfo.isAccompanyingJudge ? 'accompanying_judge' : 'leader',
              school: memberInfo.school,
              year: memberInfo.year,
              contact: memberInfo.contact,
              experience: memberInfo.experience,
            });
          }
        }

        // Check if team needs accompanying judge ("不需要" means they have their own)
        const needJudgeCol = Object.keys(row).find(key => key.includes('是否需要代请评委'));
        const needJudge = needJudgeCol ? row[needJudgeCol]?.toString() : '';
        const hasOwnJudge = needJudge.includes('不需要');

        // Get additional members from subsequent columns (null headers become indexed)
        // These appear after the first member column
        let memberIndex = 0;
        for (const key of Object.keys(row)) {
          // Skip known columns
          if (key.includes('队伍名称') || key.includes('选项一') ||
            key.includes('是否需要') || key.includes('随评履历') ||
            key.includes('备注') || key.includes('报名须知') ||
            key.includes('编号') || key.includes('时间') ||
            key.includes('地理位置') || key.includes('IP') ||
            key.includes('UA') || key.includes('Referrer') ||
            key === firstMemberCol) {
            continue;
          }

          const value = row[key];
          if (!value || typeof value !== 'string') continue;

          // Check if it looks like member info (contains comma-separated data)
          if (value.includes(',') && !value.includes('http')) {
            const memberInfo = parseMemberInfo(value);
            if (memberInfo && memberInfo.name && !members.find(m => m.name === memberInfo.name)) {
              // Determine role
              let role = 'member';
              if (memberInfo.isAccompanyingJudge) {
                role = 'accompanying_judge';
              } else if (hasOwnJudge && memberIndex === 0 && members.length === 1) {
                // Second person is accompanying judge if they don't need external judge
                role = 'accompanying_judge';
              }

              members.push({
                name: memberInfo.name,
                role: role,
                school: memberInfo.school,
                year: memberInfo.year,
                contact: memberInfo.contact,
                experience: memberInfo.experience,
              });
              memberIndex++;
            }
          }
        }

        if (members.length === 0) {
          console.log(`⚠️  Row ${i + 1} (${teamName}): Skipping - no team members found`);
          continue;
        }

        // Get contact from first member
        const contact = members[0]?.contact || '';

        // Create registration
        console.log(`\n📝 Row ${i + 1}: Creating registration for: ${teamName}`);
        console.log(`   Members: ${members.length}`);
        const accompanyingJudge = members.find(m => m.role === 'accompanying_judge');
        console.log(`   随评: ${accompanyingJudge ? accompanyingJudge.name : 'None'}`);

        const registration = await pb.collection('registrations').create({
          tournamentId: tournamentId,
          teamName: teamName,
          participants: members.map(m => m.name),
          contact: contact || undefined,
          status: 'approved',
          paymentStatus: 'paid',
        });

        console.log(`   ✅ Registration created: ${registration.id}`);

        // Create team members
        for (const member of members) {
          const memberData = {
            registrationId: registration.id,
            tournamentId: tournamentId,
            name: member.name,
            role: member.role,
            school: member.school || undefined,
            year: member.year || undefined,
            contact: member.contact || undefined,
            experience: member.experience || undefined,
            isCompeting: member.role !== 'accompanying_judge',
          };

          await pb.collection('team_members').create(memberData);
          console.log(`   ✅ Member added: ${member.name} (${member.role})`);

          // If this is an accompanying judge, also add to judges collection
          if (member.role === 'accompanying_judge') {
            try {
              const judgeData = {
                fullName: member.name,
                experience: member.experience || '',
                phone: member.contact || '',
                wechatId: member.contact || '',
                judgeTypes: ['随队评委'],
                status: 'approved',
                obligationsLeft: 3,
                totalObligations: 3,
                teamId: registration.id,
                teamName: teamName
              };

              await pb.collection('judges').create(judgeData);
              console.log(`   ✅ Judge created: ${member.name} (随队评委)`);
              judgesCreated.push(member.name);
            } catch (judgeError) {
              console.log(`   ⚠️  Judge creation skipped for ${member.name}: ${judgeError.message}`);
            }
          }
        }

        successCount++;
      } catch (error) {
        console.error(`\n❌ Row ${i + 1} error:`, error.message);
        if (error.response) {
          console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        }
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log(`   ✅ Successfully imported: ${successCount} teams`);
    console.log(`   ✅ Judges created: ${judgesCreated.length}`);
    if (judgesCreated.length > 0) {
      console.log(`      - ${judgesCreated.join('\n      - ')}`);
    }
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Import error:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importTeams().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { importTeams };

