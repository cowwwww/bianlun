import pb from './pocketbase';

export type JudgeType = '随队评委' | '外聘评委' | '教学导师' | '技术裁判';

export interface Judge {
  id: string;
  fullName: string;
  wechatId?: string;
  phone?: string;
  experience?: string;
  expertise?: string[];
  price?: number;
  location?: string;
  education?: string;
  affiliation?: string;
  languages?: string[];
  showContactInfo?: boolean;
  judgeTypes?: JudgeType[];
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  totalReviews?: number;
  // Judge obligation tracking
  maxObligationRounds?: number; // How many rounds they can judge per tournament
  currentObligationRounds?: number; // How many they've judged so far
  obligationsLeft?: number; // How many obligations they have left
  totalObligations?: number; // Total obligations assigned
  teamId?: string; // ID of the team they belong to (for accompanying judges)
  teamName?: string; // Name of the team they belong to (for accompanying judges)
  comments?: string; // Admin comments/notes about the judge
  createdAt: string;
  updatedAt: string;
}

const staticJudges: Judge[] = [
];

const mapRecord = (record: any): Judge => ({
  id: record.id,
  fullName: record.fullName || 'Unknown Judge',
  wechatId: record.wechatId,
  phone: record.phone,
  experience: record.experience || '',
  expertise: record.expertise || [],
  price: record.price ?? 0,
  location: record.location || '北京',
  education: record.education || '',
  affiliation: record.affiliation || '',
  languages: record.languages || ['中文'],
  showContactInfo: !!record.showContactInfo,
  judgeTypes: record.judgeTypes || [],
  status: (record.status as Judge['status']) || 'pending',
  rating: record.rating ?? 0,
  totalReviews: record.totalReviews ?? 0,
  maxObligationRounds: record.maxObligationRounds ?? 3,
  currentObligationRounds: record.currentObligationRounds ?? 0,
  obligationsLeft: record.obligationsLeft ?? 3,
  totalObligations: record.totalObligations ?? 3,
  teamId: record.teamId || '',
  teamName: record.teamName || '',
  comments: record.comments || '',
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const listJudges = async (): Promise<Judge[]> => {
  try {
    const records = await pb.collection('judges').getFullList({
      sort: '-created',
    });
    const mapped = records.map(mapRecord);
    const merged = [
      ...staticJudges.filter((s) => !mapped.find((m) => m.id === s.id)),
      ...mapped,
    ];
    return merged;
  } catch (error) {
    console.error('Error listing judges:', error);
    return staticJudges;
  }
};

export const getJudgeById = async (id: string): Promise<Judge | null> => {
  const staticJudge = staticJudges.find((j) => j.id === id);
  if (staticJudge) return staticJudge;

  try {
    const record = await pb.collection('judges').getOne(id);
    return mapRecord(record);
  } catch (error) {
    console.error('Error fetching judge by ID:', error);
    return null;
  }
};

export const createJudge = async (
  judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Judge> => {
  try {
    const record = await pb.collection('judges').create(judge);
    return mapRecord(record);
  } catch (error) {
    console.error('Error creating judge:', error);
    throw new Error('Failed to create judge');
  }
};

export const updateJudge = async (id: string, judge: Partial<Judge>): Promise<void> => {
  try {
    await pb.collection('judges').update(id, judge);
  } catch (error) {
    console.error('Error updating judge:', error);
    throw new Error('Failed to update judge');
  }
};

export const updateJudgeTypes = async (id: string, judgeTypes: JudgeType[]): Promise<void> => {
  await updateJudge(id, { judgeTypes });
};

export const updateJudgeObligation = async (
  judgeId: string,
  tournamentId: string,
  roundsJudged: number
): Promise<void> => {
  const judge = await getJudgeById(judgeId);
  if (!judge) throw new Error('Judge not found');

  await updateJudge(judgeId, {
    currentObligationRounds: (judge.currentObligationRounds || 0) + roundsJudged,
  });
};

export const getAvailableJudges = async (tournamentId?: string): Promise<Judge[]> => {
  const judges = await listJudges();
  return judges.filter((j) => {
    // Filter out judges who have reached their obligation limit
    const availableRounds = (j.maxObligationRounds || 3) - (j.currentObligationRounds || 0);
    return availableRounds > 0 && j.status === 'approved';
  });
};

export const deleteJudge = async (id: string): Promise<void> => {
  try {
    await pb.collection('judges').delete(id);
  } catch (error) {
    console.error('Error deleting judge:', error);
    throw new Error('Failed to delete judge');
  }
};
