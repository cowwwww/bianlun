// Update match with competing members
const PocketBase = require('pocketbase/cjs');

async function updateMatch() {
  const pb = new PocketBase('http://127.0.0.1:8090');

  try {
    await pb.collection('matches').update('b826pfztf2ime4p', {
      sideACompetingMembers: ['冯文静', '叶宇亮', '施少坦', '罗涵玥'],
      sideBCompetingMembers: ['黄华', '刘畅', '吴昊森', '翁一凡']
    });
    console.log('Updated match with competing members');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateMatch();
