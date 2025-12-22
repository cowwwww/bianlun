import pb from './pocketbase';

export interface Match {
  id: string;
  tournamentId: string;
  round: string;
  room?: string;
  sideAId: string;
  sideBId: string;
  judgeIds: string[];
  topicId?: string;
  scheduledAt?: string;
  result?: string;
  sideACompetingMembers?: string[];
  sideBCompetingMembers?: string[];
  createdAt: string;
  updatedAt: string;
}

const staticMatches: Match[] = [
];

const mapRecord = (record: any): Match => ({
  id: record.id,
  tournamentId: record.tournamentId || record.tournament || '',
  round: record.round || '',
  room: record.room,
  sideAId: record.sideAId || record.sideA || '',
  sideBId: record.sideBId || record.sideB || '',
  judgeIds: record.judgeIds || [],
  topicId: record.topicId || record.topic,
  scheduledAt: record.scheduledAt || record.date,
  result: record.result,
  sideACompetingMembers: record.sideACompetingMembers || record.side_a_competing_members || [],
  sideBCompetingMembers: record.sideBCompetingMembers || record.side_b_competing_members || [],
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const getMatchById = async (id: string): Promise<Match | null> => {
  const staticMatch = staticMatches.find((m) => m.id === id);
  if (staticMatch) return staticMatch;

  try {
    const record = await pb.collection('matches').getOne(id);
    return mapRecord(record);
  } catch (error) {
    console.error('Error fetching match by ID:', error);
    return null;
  }
};

export const listMatchesByTournament = async (tournamentId: string): Promise<Match[]> => {
  try {
    const records = await pb.collection('matches').getFullList({
      sort: 'round',
      filter: `tournamentId="${tournamentId}"`,
    });
    const mapped = records.map(mapRecord);
    const merged = [
      ...staticMatches.filter((s) => s.tournamentId === tournamentId && !mapped.find((m) => m.id === s.id)),
      ...mapped,
    ];
    return merged;
  } catch (error) {
    console.error('Error listing matches:', error);
    return staticMatches.filter((s) => s.tournamentId === tournamentId);
  }
};

export const createMatch = async (
  match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Match> => {
  const record = await pb.collection('matches').create(match);
  return mapRecord(record);
};

export const updateMatch = async (id: string, match: Partial<Match>): Promise<void> => {
  await pb.collection('matches').update(id, match);
};

export const deleteMatch = async (id: string): Promise<void> => {
  await pb.collection('matches').delete(id);
};

