const fs = require('fs');
const path = require('path');

// Simple HTTP client for PocketBase API
const http = require('http');
const https = require('https');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// CSV parsing function
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split('","').map(h => h.replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values = line.split('","').map(v => v.replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Parse team members from the formatted string
function parseTeamMembers(memberString) {
  if (!memberString || memberString === 'B.不需要') return [];

  const members = [];
  const memberEntries = memberString.split('|');

  memberEntries.forEach(entry => {
    const parts = entry.split(',');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const school = parts[1].trim();
      const year = parts[2] ? parts[2].trim() : '';
      const contact = parts[3] ? parts[3].trim() : '';
      const experience = parts[4] ? parts[4].trim() : '';

      // Determine role based on name
      let role = 'member';
      if (name.includes('（领队）')) {
        role = 'leader';
      } else if (name.includes('（随评）')) {
        role = 'accompanying_judge';
      }

      members.push({
        name: name.replace(/[（领队）（随评）]/g, ''),
        role,
        school,
        year,
        contact: contact.startsWith('无') ? '' : contact,
        experience: experience.startsWith('无') ? '' : experience
      });
    }
  });

  return members;
}

async function importTestData() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, 'test data.csv');
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(csvText);

    console.log(`Found ${records.length} records to import`);

    // Clear existing registrations for this tournament
    const tournamentId = 'ada-2026-fastdebate';
    try {
      const response = await makeRequest({
        hostname: '127.0.0.1',
        port: 8090,
        path: `/api/collections/registrations/records?filter=tournamentId~"${tournamentId}"&perPage=500`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.items && response.items.length > 0) {
        for (const record of response.items) {
          await makeRequest({
            hostname: '127.0.0.1',
            port: 8090,
            path: `/api/collections/registrations/records/${record.id}`,
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
        }
        console.log(`Cleared ${response.items.length} existing registrations`);
      }
    } catch (error) {
      console.log('No existing registrations to clear or collection doesn\'t exist yet');
    }

    // Import new registrations
    for (const record of records) {
      try {
        const teamName = record['1.队伍名称'] || record['队伍名称'];
        const memberString = record['3.选项二：请按照以下格式提交申请'];
        const members = parseTeamMembers(memberString);

        // Find leader and judge info
        const leader = members.find(m => m.role === 'leader');
        const accompanyingJudge = members.find(m => m.role === 'accompanying_judge');

        // Create registration data
        const registrationData = {
          tournamentId,
          teamName,
          participants: members.map(m => `${m.name}（${m.role === 'leader' ? '领队' : m.role === 'accompanying_judge' ? '随评' : '队员'}）`),
          contact: leader?.contact || '',
          wechatId: leader?.contact || '',
          category: '公开组',
          status: 'approved',
          paymentStatus: 'paid',
          notes: record['6.备注（如有）'] || '',

          // Extended fields for team composition
          teamComposition: members.map(m => ({
            name: m.name,
            role: m.role,
            email: '',
            phone: m.contact
          })),

          // Judge information
          accompanyingJudge: accompanyingJudge ? {
            name: accompanyingJudge.name,
            experience: accompanyingJudge.experience,
            contact: accompanyingJudge.contact
          } : null
        };

        // Create registration record
        const result = await makeRequest({
          hostname: '127.0.0.1',
          port: 8090,
          path: '/api/collections/registrations/records',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, registrationData);

        console.log(`✅ Imported team: ${teamName} (${members.length} members)`);

        // If there's an accompanying judge, create judge record
        if (accompanyingJudge) {
          try {
            const judgeData = {
              fullName: accompanyingJudge.name,
              wechatId: accompanyingJudge.contact,
              phone: accompanyingJudge.contact,
              experience: accompanyingJudge.experience,
              expertise: ['辩论赛'],
              price: 0, // Free for accompanying judges
              location: record['地理位置市'] || '福州市',
              affiliation: accompanyingJudge.school || '随队评委',
              languages: ['中文'],
              judgeTypes: ['随队评委'],
              status: 'approved',
              maxObligationRounds: 5,
              currentObligationRounds: 0
            };

            await makeRequest({
              hostname: '127.0.0.1',
              port: 8090,
              path: '/api/collections/judges/records',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }, judgeData);

            console.log(`✅ Created judge: ${accompanyingJudge.name}`);
          } catch (judgeError) {
            console.log(`⚠️ Judge creation failed for ${accompanyingJudge.name}:`, judgeError.message);
          }
        }

      } catch (error) {
        console.error(`❌ Failed to import record:`, error.message);
      }
    }

    console.log('\n🎉 Import completed!');

  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importTestData();
