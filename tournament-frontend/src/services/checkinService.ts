import pb from './pocketbase';

export interface MatchCheckin {
    id: string;
    matchId: string;
    tournamentId: string;
    userId: string;
    userName: string;
    userRole: 'player' | 'judge';
    teamId?: string;
    teamName?: string;
    position?: string; // 一辩、二辩、三辩、四辩
    checkinTime: string;
    createdAt: string;
    updatedAt: string;
}

const mapRecord = (record: any): MatchCheckin => ({
    id: record.id,
    matchId: record.matchId,
    tournamentId: record.tournamentId,
    userId: record.userId || '',
    userName: record.userName,
    userRole: record.userRole || 'player',
    teamId: record.teamId,
    teamName: record.teamName,
    position: record.position,
    checkinTime: record.checkinTime || record.created,
    createdAt: record.created,
    updatedAt: record.updated,
});

// Get all check-ins for a match
export const getMatchCheckins = async (matchId: string): Promise<MatchCheckin[]> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}"`,
            sort: 'created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error getting match check-ins:', error);
        return [];
    }
};

// Check in a user for a match
export const checkinForMatch = async (data: {
    matchId: string;
    tournamentId: string;
    userName: string;
    userRole: 'player' | 'judge';
    teamId?: string;
    teamName?: string;
    position?: string;
}): Promise<MatchCheckin | null> => {
    try {
        // Check if already checked in
        const existing = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${data.matchId}" && userName="${data.userName}"`,
        });

        if (existing.length > 0) {
            console.log('Already checked in');
            return mapRecord(existing[0]);
        }

        const record = await pb.collection('match_checkins').create({
            ...data,
            checkinTime: new Date().toISOString(),
        });
        return mapRecord(record);
    } catch (error) {
        console.error('Error checking in for match:', error);
        throw error;
    }
};

// Get all check-ins for a tournament
export const getTournamentCheckins = async (tournamentId: string): Promise<MatchCheckin[]> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `tournamentId="${tournamentId}"`,
            sort: '-created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error getting tournament check-ins:', error);
        return [];
    }
};
