import pb from './pocketbase';

export type CheckinStatus = 'checked_in' | 'absent' | 'late';
export type UserType = 'team_member' | 'judge' | 'chairman';

export interface MatchCheckin {
    id: string;
    matchId: string;
    tournamentId: string;
    userId: string;
    userName: string;
    userType: UserType;
    teamId?: string;
    status: CheckinStatus;
    chairmanApproved?: boolean;  // For chairman: indicates scores can be shown
    checkedInAt: string;
    createdAt: string;
    updatedAt: string;
}

const mapRecord = (record: any): MatchCheckin => ({
    id: record.id,
    matchId: record.matchId || '',
    tournamentId: record.tournamentId || '',
    userId: record.userId || '',
    userName: record.userName || '',
    userType: (record.userType as UserType) || 'team_member',
    teamId: record.teamId,
    status: (record.status as CheckinStatus) || 'absent',
    chairmanApproved: record.chairmanApproved || false,
    checkedInAt: record.created || '',
    createdAt: record.created || '',
    updatedAt: record.updated || '',
});

export const getMatchCheckins = async (matchId: string): Promise<MatchCheckin[]> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}"`,
            sort: '-created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error fetching match check-ins:', error);
        return [];
    }
};

export const getTournamentCheckins = async (tournamentId: string): Promise<MatchCheckin[]> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `tournamentId="${tournamentId}"`,
            sort: '-created',
        });
        return records.map(mapRecord);
    } catch (error) {
        console.error('Error fetching tournament check-ins:', error);
        return [];
    }
};

export const createCheckin = async (
    checkin: Omit<MatchCheckin, 'id' | 'checkedInAt' | 'createdAt' | 'updatedAt'>
): Promise<MatchCheckin> => {
    try {
        const record = await pb.collection('match_checkins').create({
            ...checkin,
            status: checkin.status || 'checked_in',
        });
        return mapRecord(record);
    } catch (error: any) {
        console.error('Error creating check-in:', error);
        throw new Error(error?.message || 'Failed to create check-in');
    }
};

export const updateCheckinStatus = async (
    id: string,
    status: CheckinStatus
): Promise<void> => {
    try {
        await pb.collection('match_checkins').update(id, { status });
    } catch (error) {
        console.error('Error updating check-in status:', error);
        throw new Error('Failed to update check-in status');
    }
};

export const deleteCheckin = async (id: string): Promise<void> => {
    try {
        await pb.collection('match_checkins').delete(id);
    } catch (error) {
        console.error('Error deleting check-in:', error);
        throw new Error('Failed to delete check-in');
    }
};

export const bulkCheckin = async (
    matchId: string,
    tournamentId: string,
    users: Array<{ userId: string; userName: string; userType: UserType; teamId?: string }>
): Promise<MatchCheckin[]> => {
    const results: MatchCheckin[] = [];
    for (const user of users) {
        try {
            const checkin = await createCheckin({
                matchId,
                tournamentId,
                userId: user.userId,
                userName: user.userName,
                userType: user.userType,
                teamId: user.teamId,
                status: 'checked_in',
            });
            results.push(checkin);
        } catch (error) {
            console.error(`Failed to check in user ${user.userName}:`, error);
        }
    }
    return results;
};

export const getCheckinStatus = async (
    matchId: string,
    userId: string
): Promise<MatchCheckin | null> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}" && userId="${userId}"`,
        });
        return records.length > 0 ? mapRecord(records[0]) : null;
    } catch (error) {
        console.error('Error fetching check-in status:', error);
        return null;
    }
};

// Chairman approval functions
export const setChairmanApproval = async (
    matchId: string,
    approved: boolean
): Promise<void> => {
    try {
        // Find the chairman check-in for this match
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}" && userType="chairman"`,
        });

        if (records.length > 0) {
            await pb.collection('match_checkins').update(records[0].id, { chairmanApproved: approved });
        }
    } catch (error) {
        console.error('Error setting chairman approval:', error);
        throw new Error('Failed to set chairman approval');
    }
};

export const isScoreVisible = async (matchId: string): Promise<boolean> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}" && userType="chairman" && chairmanApproved=true`,
        });
        return records.length > 0;
    } catch (error) {
        console.error('Error checking score visibility:', error);
        return false;
    }
};

export const getChairmanCheckin = async (matchId: string): Promise<MatchCheckin | null> => {
    try {
        const records = await pb.collection('match_checkins').getFullList({
            filter: `matchId="${matchId}" && userType="chairman"`,
        });
        return records.length > 0 ? mapRecord(records[0]) : null;
    } catch (error) {
        console.error('Error fetching chairman check-in:', error);
        return null;
    }
};
