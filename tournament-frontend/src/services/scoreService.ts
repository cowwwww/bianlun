import pb from './pocketbase';
import { auth } from './authService';

export interface Score {
  id: string;
  matchId: string;
  judgeId: string;
  sideAScore: number;
  sideBScore: number;
  comments?: string;
  submittedAt: string;
}

const mapRecord = (record: any): Score => ({
  id: record.id,
  matchId: record.matchId || record.match || '',
  judgeId: record.judgeId || record.judge || '',
  sideAScore: Number(record.sideAScore ?? record.side_a ?? 0),
  sideBScore: Number(record.sideBScore ?? record.side_b ?? 0),
  comments: record.comments,
  submittedAt: record.created || '',
});

export const listScoresByMatch = async (matchId: string): Promise<Score[]> => {
  try {
    const records = await pb.collection('scores').getFullList({
      sort: '-created',
      filter: `matchId="${matchId}"`,
    });
    return records.map(mapRecord);
  } catch (error) {
    console.error('Error listing scores:', error);
    return [];
  }
};

export const submitScore = async (
  input: Omit<Score, 'id' | 'submittedAt' | 'judgeId'> & { judgeId?: string }
): Promise<Score> => {
  const judgeId = input.judgeId || auth.getCurrentUser()?.id;
  if (!judgeId) {
    throw new Error('Judge must be logged in');
  }

  // Upsert by (matchId + judgeId) if backend rules allow; otherwise create new.
  const payload = {
    ...input,
    judgeId,
  };

  // Try to find existing score by this judge for this match.
  try {
    const existing = await pb.collection('scores').getList(1, 1, {
      filter: `matchId="${input.matchId}" && judgeId="${judgeId}"`,
    });
    if (existing.items.length > 0) {
      const record = existing.items[0];
      const updated = await pb.collection('scores').update(record.id, payload);
      return mapRecord(updated);
    }
  } catch (error) {
    // Ignore lookup failures, continue to create
    console.warn('Score lookup failed, creating new:', error);
  }

  const created = await pb.collection('scores').create(payload);
  return mapRecord(created);
};



