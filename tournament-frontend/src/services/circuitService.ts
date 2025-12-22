import pb from './pocketbase';
import type { Match } from './matchService';

export type RoundType = 'preliminary' | 'quarterfinal' | 'semifinal' | 'final';
export type CircuitStatus = 'draft' | 'published' | 'in_progress' | 'completed';

export interface CircuitRound {
  id: string;
  tournamentId: string;
  roundName: string;
  roundType: RoundType;
  roundNumber: number;
  matches: CircuitMatch[];
  scheduledAt?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CircuitMatch {
  id: string;
  roundId: string;
  sideAId: string;
  sideBId: string;
  sideAName?: string;
  sideBName?: string;
  judgeIds: string[];
  judgeNames?: string[];
  room?: string;
  scheduledAt?: string;
  result?: {
    winner: 'A' | 'B' | 'tie';
    scores: {
      sideA: number;
      sideB: number;
    };
    judgeScores: Array<{
      judgeId: string;
      judgeName: string;
      sideAScore: number;
      sideBScore: number;
      notes?: string;
    }>;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Circuit {
  id: string;
  tournamentId: string;
  name: string;
  description?: string;
  rounds: CircuitRound[];
  status: CircuitStatus;
  totalTeams: number;
  currentRound: number;
  bracketType: 'single_elimination' | 'double_elimination' | 'round_robin';
  createdAt: string;
  updatedAt: string;
}

const mapCircuitRecord = (record: any): Circuit => ({
  id: record.id,
  tournamentId: record.tournamentId,
  name: record.name || '比赛对阵图',
  description: record.description,
  rounds: record.rounds || [],
  status: (record.status as CircuitStatus) || 'draft',
  totalTeams: record.totalTeams || 0,
  currentRound: record.currentRound || 1,
  bracketType: (record.bracketType as Circuit['bracketType']) || 'single_elimination',
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

const mapRoundRecord = (record: any): CircuitRound => ({
  id: record.id,
  tournamentId: record.tournamentId,
  roundName: record.roundName || `第${record.roundNumber}轮`,
  roundType: (record.roundType as RoundType) || 'preliminary',
  roundNumber: record.roundNumber || 1,
  matches: record.matches || [],
  scheduledAt: record.scheduledAt,
  status: (record.status as CircuitRound['status']) || 'pending',
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

const mapMatchRecord = (record: any): CircuitMatch => ({
  id: record.id,
  roundId: record.roundId,
  sideAId: record.sideAId,
  sideBId: record.sideBId,
  sideAName: record.sideAName,
  sideBName: record.sideBName,
  judgeIds: record.judgeIds || [],
  judgeNames: record.judgeNames,
  room: record.room,
  scheduledAt: record.scheduledAt,
  result: record.result,
  status: (record.status as CircuitMatch['status']) || 'scheduled',
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const getCircuit = async (tournamentId: string): Promise<Circuit | null> => {
  try {
    const records = await pb.collection('circuits').getFullList({
      filter: `tournamentId="${tournamentId}"`,
    });

    if (records.length > 0) {
      return mapCircuitRecord(records[0]);
    }
    return null;
  } catch (error) {
    console.error('Error getting circuit:', error);
    return null;
  }
};

export const createCircuit = async (
  circuit: Omit<Circuit, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Circuit> => {
  try {
    const record = await pb.collection('circuits').create(circuit);
    return mapCircuitRecord(record);
  } catch (error) {
    console.error('Error creating circuit:', error);
    throw new Error('Failed to create circuit');
  }
};

export const updateCircuit = async (id: string, circuit: Partial<Circuit>): Promise<void> => {
  try {
    await pb.collection('circuits').update(id, circuit);
  } catch (error) {
    console.error('Error updating circuit:', error);
    throw new Error('Failed to update circuit');
  }
};

export const generateBracket = async (
  tournamentId: string,
  teamIds: string[],
  bracketType: Circuit['bracketType'] = 'single_elimination'
): Promise<Circuit> => {
  const rounds: CircuitRound[] = [];
  let currentTeams = [...teamIds];

  // For single elimination, create rounds until we have a winner
  let roundNumber = 1;
  while (currentTeams.length > 1) {
    const round: CircuitRound = {
      id: `round-${tournamentId}-${roundNumber}`,
      tournamentId,
      roundName: `第${roundNumber}轮`,
      roundType: roundNumber === 1 ? 'preliminary' :
                currentTeams.length === 2 ? 'final' :
                currentTeams.length === 4 ? 'semifinal' :
                currentTeams.length === 8 ? 'quarterfinal' : 'preliminary',
      roundNumber,
      matches: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pair up teams for this round
    for (let i = 0; i < currentTeams.length; i += 2) {
      if (i + 1 < currentTeams.length) {
        const match: CircuitMatch = {
          id: `match-${tournamentId}-r${roundNumber}-m${Math.floor(i/2) + 1}`,
          roundId: round.id,
          sideAId: currentTeams[i],
          sideBId: currentTeams[i + 1],
          judgeIds: [],
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        round.matches.push(match);
      } else {
        // Odd team out - bye to next round
        currentTeams.splice(i, 1);
        break;
      }
    }

    rounds.push(round);

    // Prepare teams for next round (winners)
    // In a real implementation, this would be determined by match results
    // For now, just take the first half
    currentTeams = currentTeams.slice(0, Math.ceil(currentTeams.length / 2));
    roundNumber++;
  }

  const circuit: Circuit = {
    id: `circuit-${tournamentId}`,
    tournamentId,
    name: '自动生成对阵图',
    rounds,
    status: 'draft',
    totalTeams: teamIds.length,
    currentRound: 1,
    bracketType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await createCircuit(circuit);
};

export const updateMatchResult = async (
  circuitId: string,
  matchId: string,
  result: CircuitMatch['result']
): Promise<void> => {
  try {
    await pb.collection('circuit_matches').update(matchId, { result, status: 'completed' });
  } catch (error) {
    console.error('Error updating match result:', error);
    throw new Error('Failed to update match result');
  }
};

export const assignJudgesToMatch = async (
  matchId: string,
  judgeIds: string[]
): Promise<void> => {
  try {
    await pb.collection('circuit_matches').update(matchId, { judgeIds });
  } catch (error) {
    console.error('Error assigning judges:', error);
    throw new Error('Failed to assign judges');
  }
};

export const getRoundMatches = async (roundId: string): Promise<CircuitMatch[]> => {
  try {
    const records = await pb.collection('circuit_matches').getFullList({
      filter: `roundId="${roundId}"`,
      sort: 'scheduledAt',
    });
    return records.map(mapMatchRecord);
  } catch (error) {
    console.error('Error getting round matches:', error);
    return [];
  }
};

export const publishCircuit = async (circuitId: string): Promise<void> => {
  await updateCircuit(circuitId, { status: 'published' });
};

export const startCircuit = async (circuitId: string): Promise<void> => {
  await updateCircuit(circuitId, { status: 'in_progress' });
};

export const completeCircuit = async (circuitId: string): Promise<void> => {
  await updateCircuit(circuitId, { status: 'completed' });
};

// Utility functions for bracket generation
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateRoundRobinSchedule = (teams: string[]): CircuitMatch[] => {
  const matches: CircuitMatch[] = [];
  const numTeams = teams.length;

  // Round-robin tournament scheduling
  for (let round = 1; round < numTeams; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const teamA = teams[i];
      const teamB = teams[numTeams - 1 - i];

      if (teamA && teamB) {
        matches.push({
          id: `rr-match-r${round}-m${i + 1}`,
          roundId: `round-rr-${round}`,
          sideAId: teamA,
          sideBId: teamB,
          judgeIds: [],
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Rotate teams for next round
    teams.splice(1, 0, teams.pop()!);
  }

  return matches;
};
