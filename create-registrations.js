// Simple script to create registrations
const PocketBase = require('pocketbase/cjs');

async function createRegistrations() {
  const pb = new PocketBase('http://127.0.0.1:8090');

  try {
    // Create first registration
    const reg1 = await pb.collection('registrations').create({
      tournamentId: '5zrkihweutfv72k',
      teamName: '橙子酱队',
      participants: ['冯文静', '叶宇亮', '施少坦', '罗涵玥', '蔡悦晨', '游柔婧', '余美琪'],
      status: 'approved',
      paymentStatus: 'paid'
    });
    console.log('Created registration 1:', reg1.id, reg1.teamName);

    // Create second registration
    const reg2 = await pb.collection('registrations').create({
      tournamentId: '5zrkihweutfv72k',
      teamName: '显允—啊！打～',
      participants: ['黄华', '刘畅', '吴昊森', '翁一凡', '张睿', '金瀚博', '张月', '王腾鑫', '江俊蕾', '吴欣虹', '廖梓杰', '李东升'],
      status: 'approved',
      paymentStatus: 'paid'
    });
    console.log('Created registration 2:', reg2.id, reg2.teamName);

    // Update the match to use the correct registration IDs
    await pb.collection('matches').update('b826pfztf2ime4p', {
      sideAId: reg1.id,
      sideBId: reg2.id
    });
    console.log('Updated match with correct team IDs');

  } catch (error) {
    console.error('Error:', error);
  }
}

createRegistrations();
