import pb from './pocketbase';

export interface MatchScore {
    id: string;
    matchId: string;
    tournamentId: string;
    judgeId: string;
    judgeName: string;

    // Team scores
    sideAScore: number;
    sideBScore: number;
    winner: 'A' | 'B' | 'tie';

    // Individual player scores (optional, based on scoring config)
    playerScores?: {
        playerId: string;
        playerName: string;
        position: string;
        side: 'A' | 'B';
        scores: Record<string, number>; // dimension key -> score
        totalScore: number;
        isBestDebater: boolean;
    }[];

    // Comments
    comments?: string;

    createdAt: string;
    updatedAt: string;
}

export interface ScoringDimension {
    key: string;
    label: string;
    max: number;
    weight?: number;
    description?: string;
}

const mapRecord = (record: any): MatchScore => ({
    id: record.id,
    matchId: record.matchId,
    tournamentId: record.tournamentId,
    judgeId: record.judgeId,
    judgeName: record.judgeName,
    sideAScore: record.sideAScore || 0,
    sideBScore: record.sideBScore || 0,
    winner: record.winner || 'tie',
    playerScores: record.playerScores,
    comments: record.comments,
    createdAt: record.created,
    updatedAt: record.updated,
});

// Get scores for a match
export const getMatchScores = async (matchId: string): Promise<MatchScore[]> => {
    try {
        const records = await pb.collection('match_scores').getFullList({
            filter: `matchId="${matchId}"`,
            sort: 'created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error getting match scores:', error);
        return [];
    }
};

// Submit a score for a match
export const submitMatchScore = async (data: {
    matchId: string;
    tournamentId: string;
    judgeId: string;
    judgeName: string;
    sideAScore: number;
    sideBScore: number;
    winner: 'A' | 'B' | 'tie';
    playerScores?: MatchScore['playerScores'];
    comments?: string;
}): Promise<MatchScore | null> => {
    try {
        // Check if judge already scored this match
        const existing = await pb.collection('match_scores').getFullList({
            filter: `matchId="${data.matchId}" && judgeId="${data.judgeId}"`,
        });

        if (existing.length > 0) {
            // Update existing score
            const record = await pb.collection('match_scores').update(existing[0].id, data);
            return mapRecord(record);
        }

        // Create new score
        const record = await pb.collection('match_scores').create(data);
        return mapRecord(record);
    } catch (error) {
        console.error('Error submitting match score:', error);
        throw error;
    }
};

// Get all scores for a tournament
export const getTournamentScores = async (tournamentId: string): Promise<MatchScore[]> => {
    try {
        const records = await pb.collection('match_scores').getFullList({
            filter: `tournamentId="${tournamentId}"`,
            sort: '-created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error getting tournament scores:', error);
        return [];
    }
};

// Get default scoring dimensions
export const getDefaultScoringDimensions = (): ScoringDimension[] => [
    { key: 'argument', label: '论点', max: 25, description: '论点的清晰度和说服力' },
    { key: 'evidence', label: '论据', max: 25, description: '论据的充分性和相关性' },
    { key: 'rebuttal', label: '反驳', max: 25, description: '反驳的有效性和针对性' },
    { key: 'expression', label: '表达', max: 15, description: '语言表达的清晰度和感染力' },
    { key: 'teamwork', label: '配合', max: 10, description: '团队配合和整体节奏' },
];
