import pb from './pocketbase';

export type Tournament = {
  id: string;
  name: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  date: string;
  location: string;
  type: string;
  status: string;
  price: number;
  teamsize: string;
  organizer: string;
  contact: string;
  category: string;
  image: string;
  totalTeams: number;
  playersPerTeam: number;
  participationRequirements: string;
  registrationLink?: string;
  ruleBookLink?: string;
  award?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const records = await pb.collection('tournaments').getFullList({
      sort: '-created',
    });
    
    return records.map(record => ({
      id: record.id,
      name: record.name || record.title || '',
      title: record.title || record.name || '',
      description: record.description || '',
      startDate: record.startDate || '',
      endDate: record.endDate || '',
      registrationDeadline: record.registrationDeadline || '',
      date: record.date || '',
      location: record.location || '',
      type: record.type || '',
      status: record.status || 'upcoming',
      price: record.price || 0,
      teamsize: record.teamsize || '',
      organizer: record.organizer || '',
      contact: record.contact || '',
      category: record.category || '',
      image: record.image || '',
      totalTeams: record.totalTeams || 0,
      playersPerTeam: record.playersPerTeam || 0,
      participationRequirements: record.participationRequirements || '',
      registrationLink: record.registrationLink,
      ruleBookLink: record.ruleBookLink,
      award: record.award,
      createdAt: record.created || '',
      updatedAt: record.updated || '',
      createdBy: record.createdBy || '',
    }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const record = await pb.collection('tournaments').getOne(id);
    
    return {
      id: record.id,
      name: record.name || record.title || '',
      title: record.title || record.name || '',
      description: record.description || '',
      startDate: record.startDate || '',
      endDate: record.endDate || '',
      registrationDeadline: record.registrationDeadline || '',
      date: record.date || '',
      location: record.location || '',
      type: record.type || '',
      status: record.status || 'upcoming',
      price: record.price || 0,
      teamsize: record.teamsize || '',
      organizer: record.organizer || '',
      contact: record.contact || '',
      category: record.category || '',
      image: record.image || '',
      totalTeams: record.totalTeams || 0,
      playersPerTeam: record.playersPerTeam || 0,
      participationRequirements: record.participationRequirements || '',
      registrationLink: record.registrationLink,
      ruleBookLink: record.ruleBookLink,
      award: record.award,
      createdAt: record.created || '',
      updatedAt: record.updated || '',
      createdBy: record.createdBy || '',
    };
  } catch (error) {
    console.error('Error fetching tournament by ID:', error);
    return null;
  }
};

export const createTournament = async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tournament> => {
  try {
    const record = await pb.collection('tournaments').create(tournament);
    
    return {
      ...tournament,
      id: record.id,
      createdAt: record.created,
      updatedAt: record.updated,
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw new Error('Failed to create tournament');
  }
};

export const updateTournament = async (id: string, tournament: Partial<Tournament>): Promise<void> => {
  try {
    await pb.collection('tournaments').update(id, tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw new Error('Failed to update tournament');
  }
};

export const deleteTournament = async (id: string): Promise<void> => {
  try {
    await pb.collection('tournaments').delete(id);
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw new Error('Failed to delete tournament');
  }
};
