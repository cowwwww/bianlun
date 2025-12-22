const fs = require('fs');
const path = require('path');
const http = require('http');

// Parse team members from the formatted string (same as before)
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

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

async function separateTeamMembers() {
  try {
    console.log('Starting team member separation...');

    // Get all registrations
    const registrationsResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 8090,
      path: '/api/collections/registrations/records?perPage=100',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const registrations = registrationsResponse.items || [];
    console.log(`Found ${registrations.length} registrations`);

    for (const registration of registrations) {
      console.log(`Processing team: ${registration.teamName}`);

      // Check if team members already exist for this registration
      const existingMembersResponse = await makeRequest({
        hostname: '127.0.0.1',
        port: 8090,
        path: `/api/collections/team_members/records?filter=registrationId="${registration.id}"&perPage=50`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (existingMembersResponse.items && existingMembersResponse.items.length > 0) {
        console.log(`  Team members already exist for ${registration.teamName}, skipping...`);
        continue;
      }

      // Parse team composition from the stored data
      let members = [];

      if (registration.teamComposition && Array.isArray(registration.teamComposition)) {
        // Use the stored teamComposition if available
        members = registration.teamComposition.map(member => ({
          name: member.name,
          role: member.role,
          school: member.school || '',
          year: member.year || '',
          contact: member.phone || member.email || '',
          experience: member.experience || ''
        }));
      } else {
        // Fallback to parsing from original CSV-like data
        // Read the CSV to get the original member string
        const csvPath = path.join(__dirname, 'test data.csv');
        const csvText = fs.readFileSync(csvPath, 'utf8');
        const lines = csvText.split('\n').filter(line => line.trim());

        // Find the matching record
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split('","').map(v => v.replace(/^"|"$/g, ''));
          const teamName = values[4];
          if (teamName === registration.teamName) {
            const memberString = values[14]; // "3.选项二：请按照以下格式提交申请"
            members = parseTeamMembers(memberString);
            break;
          }
        }
      }

      if (members.length === 0) {
        console.log(`  No members found for ${registration.teamName}`);
        continue;
      }

      console.log(`  Creating ${members.length} team members...`);

      // Create team member records
      for (const member of members) {
        try {
          const memberData = {
            registrationId: registration.id,
            tournamentId: registration.tournamentId,
            name: member.name,
            role: member.role,
            school: member.school || '',
            year: member.year || '',
            contact: member.contact || '',
            experience: member.experience || '',
            isCompeting: member.role === 'member' // Default competing members
          };

          await makeRequest({
            hostname: '127.0.0.1',
            port: 8090,
            path: '/api/collections/team_members/records',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }, memberData);

          console.log(`    ✅ Created: ${member.name} (${member.role})`);
        } catch (error) {
          console.error(`    ❌ Failed to create ${member.name}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Team member separation completed!');

  } catch (error) {
    console.error('Separation failed:', error);
  }
}

separateTeamMembers();


