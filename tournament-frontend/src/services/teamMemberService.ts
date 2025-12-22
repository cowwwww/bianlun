import pb from './pocketbase';

export interface TeamMember {
  id: string;
  registrationId: string;
  tournamentId: string;
  name: string;
  role: 'leader' | 'accompanying_judge' | 'member';
  school?: string;
  year?: string;
  contact?: string;
  experience?: string;
  isCompeting?: boolean;
  createdAt: string;
  updatedAt: string;
}

const mapRecord = (record: any): TeamMember => ({
  id: record.id,
  registrationId: record.registrationId,
  tournamentId: record.tournamentId,
  name: record.name,
  role: record.role,
  school: record.school,
  year: record.year,
  contact: record.contact,
  experience: record.experience,
  isCompeting: record.isCompeting || false,
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const getTeamMembers = async (registrationId: string): Promise<TeamMember[]> => {
  try {
    const records = await pb.collection('team_members').getFullList({
      filter: `registrationId="${registrationId}"`,
      sort: 'created',
    });
    return records.map(mapRecord);
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
};

export const getTournamentTeamMembers = async (tournamentId: string): Promise<TeamMember[]> => {
  try {
    const records = await pb.collection('team_members').getFullList({
      filter: `tournamentId="${tournamentId}"`,
      sort: 'registrationId,created',
    });
    return records.map(mapRecord);
  } catch (error) {
    console.error('Error getting tournament team members:', error);
    return [];
  }
};

export const createTeamMember = async (
  member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<TeamMember> => {
  try {
    const record = await pb.collection('team_members').create(member);
    return mapRecord(record);
  } catch (error) {
    console.error('Error creating team member:', error);
    throw new Error('Failed to create team member');
  }
};

export const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<void> => {
  try {
    await pb.collection('team_members').update(id, member);
  } catch (error) {
    console.error('Error updating team member:', error);
    throw new Error('Failed to update team member');
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    await pb.collection('team_members').delete(id);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw new Error('Failed to delete team member');
  }
};

export const createTeamMembersFromComposition = async (
  registrationId: string,
  tournamentId: string,
  teamComposition: Array<{ name: string; role: string; email?: string; phone?: string }>
): Promise<TeamMember[]> => {
  const members: TeamMember[] = [];

  for (const member of teamComposition) {
    const teamMember = await createTeamMember({
      registrationId,
      tournamentId,
      name: member.name,
      role: member.role as TeamMember['role'],
      contact: member.phone || member.email,
      isCompeting: member.role === 'member', // Default competing members
    });
    members.push(teamMember);
  }

  return members;
};


