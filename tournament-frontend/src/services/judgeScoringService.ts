import pb from './pocketbase';

export interface JudgeScore {
  id: string;
  matchId: string;
  judgeId: string;
  judgeName?: string;
  tournamentId: string;
  sideAId: string;
  sideBId: string;
  sideAScore: number;
  sideBScore: number;
  criteriaScores: Record<string, number>; // key: criterion key, value: score
  notes?: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ScoringCriteria {
  key: string;
  label: string;
  maxScore: number;
  weight?: number;
  description?: string;
}

export interface JudgeScoringAssignment {
  id: string;
  judgeId: string;
  judgeName: string;
  matchId: string;
  matchName: string;
  tournamentId: string;
  tournamentName: string;
  deadline?: string;
  status: 'assigned' | 'in_progress' | 'submitted' | 'overdue';
  assignedAt: string;
  submittedAt?: string;
}

const mapScoreRecord = (record: any): JudgeScore => ({
  id: record.id,
  matchId: record.matchId,
  judgeId: record.judgeId,
  judgeName: record.judgeName,
  tournamentId: record.tournamentId,
  sideAId: record.sideAId,
  sideBId: record.sideBId,
  sideAScore: record.sideAScore || 0,
  sideBScore: record.sideBScore || 0,
  criteriaScores: record.criteriaScores || {},
  notes: record.notes,
  submittedAt: record.submittedAt || record.created,
  status: (record.status as JudgeScore['status']) || 'draft',
  reviewedBy: record.reviewedBy,
  reviewedAt: record.reviewedAt,
  reviewNotes: record.reviewNotes,
});

const mapAssignmentRecord = (record: any): JudgeScoringAssignment => ({
  id: record.id,
  judgeId: record.judgeId,
  judgeName: record.judgeName,
  matchId: record.matchId,
  matchName: record.matchName,
  tournamentId: record.tournamentId,
  tournamentName: record.tournamentName,
  deadline: record.deadline,
  status: (record.status as JudgeScoringAssignment['status']) || 'assigned',
  assignedAt: record.assignedAt || record.created,
  submittedAt: record.submittedAt,
});

export const getJudgeScoresByMatch = async (matchId: string): Promise<JudgeScore[]> => {
  try {
    const records = await pb.collection('judge_scores').getFullList({
      filter: `matchId="${matchId}"`,
      sort: '-submittedAt',
    });
    return records.map(mapScoreRecord);
  } catch (error) {
    console.error('Error getting judge scores:', error);
    return [];
  }
};

export const getJudgeScoresByJudge = async (judgeId: string): Promise<JudgeScore[]> => {
  try {
    const records = await pb.collection('judge_scores').getFullList({
      filter: `judgeId="${judgeId}"`,
      sort: '-submittedAt',
    });
    return records.map(mapScoreRecord);
  } catch (error) {
    console.error('Error getting judge scores by judge:', error);
    return [];
  }
};

export const submitJudgeScore = async (
  score: Omit<JudgeScore, 'id' | 'submittedAt' | 'status'>
): Promise<JudgeScore> => {
  try {
    // Calculate total scores from criteria if not provided
    let sideAScore = score.sideAScore;
    let sideBScore = score.sideBScore;

    if (Object.keys(score.criteriaScores).length > 0) {
      // If we have detailed criteria scores, use them to calculate totals
      // This would depend on the tournament's scoring configuration
      sideAScore = Object.values(score.criteriaScores).reduce((sum, score) => sum + score, 0);
      sideBScore = 100 - sideAScore; // Simple assumption, should be configurable
    }

    const payload = {
      ...score,
      sideAScore,
      sideBScore,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    const record = await pb.collection('judge_scores').create(payload);
    return mapScoreRecord(record);
  } catch (error) {
    console.error('Error submitting judge score:', error);
    throw new Error('Failed to submit score');
  }
};

export const updateJudgeScore = async (
  id: string,
  updates: Partial<JudgeScore>
): Promise<void> => {
  try {
    await pb.collection('judge_scores').update(id, updates);
  } catch (error) {
    console.error('Error updating judge score:', error);
    throw new Error('Failed to update score');
  }
};

export const reviewJudgeScore = async (
  id: string,
  reviewerId: string,
  reviewNotes?: string
): Promise<void> => {
  await updateJudgeScore(id, {
    status: 'reviewed',
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewNotes,
  });
};

export const getJudgeAssignments = async (judgeId: string): Promise<JudgeScoringAssignment[]> => {
  try {
    const records = await pb.collection('judge_assignments').getFullList({
      filter: `judgeId="${judgeId}"`,
      sort: '-assignedAt',
    });
    return records.map(mapAssignmentRecord);
  } catch (error) {
    console.error('Error getting judge assignments:', error);
    return [];
  }
};

export const getMatchAssignments = async (matchId: string): Promise<JudgeScoringAssignment[]> => {
  try {
    const records = await pb.collection('judge_assignments').getFullList({
      filter: `matchId="${matchId}"`,
    });
    return records.map(mapAssignmentRecord);
  } catch (error) {
    console.error('Error getting match assignments:', error);
    return [];
  }
};

export const assignJudgeToMatch = async (
  assignment: Omit<JudgeScoringAssignment, 'id' | 'assignedAt' | 'status'>
): Promise<JudgeScoringAssignment> => {
  try {
    const payload = {
      ...assignment,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };

    const record = await pb.collection('judge_assignments').create(payload);
    return mapAssignmentRecord(record);
  } catch (error) {
    console.error('Error assigning judge:', error);
    throw new Error('Failed to assign judge');
  }
};

export const updateAssignmentStatus = async (
  id: string,
  status: JudgeScoringAssignment['status']
): Promise<void> => {
  try {
    await pb.collection('judge_assignments').update(id, { status });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    throw new Error('Failed to update assignment');
  }
};

export const calculateMatchResult = async (matchId: string): Promise<{
  winner: 'A' | 'B' | 'tie';
  averageScores: { sideA: number; sideB: number };
  judgeCount: number;
}> => {
  const scores = await getJudgeScoresByMatch(matchId);

  if (scores.length === 0) {
    return { winner: 'tie', averageScores: { sideA: 0, sideB: 0 }, judgeCount: 0 };
  }

  const totalAScore = scores.reduce((sum, score) => sum + score.sideAScore, 0);
  const totalBScore = scores.reduce((sum, score) => sum + score.sideBScore, 0);

  const avgAScore = totalAScore / scores.length;
  const avgBScore = totalBScore / scores.length;

  let winner: 'A' | 'B' | 'tie';
  if (avgAScore > avgBScore) {
    winner = 'A';
  } else if (avgBScore > avgAScore) {
    winner = 'B';
  } else {
    winner = 'tie';
  }

  return {
    winner,
    averageScores: { sideA: avgAScore, sideB: avgBScore },
    judgeCount: scores.length,
  };
};

export const getScoringCriteria = async (tournamentId: string): Promise<ScoringCriteria[]> => {
  // This would typically come from tournament configuration
  // For now, return default criteria
  return [
    { key: 'expression', label: '表达', maxScore: 10, weight: 1, description: '语言表达清晰度' },
    { key: 'logic', label: '逻辑', maxScore: 10, weight: 1, description: '论证逻辑严密性' },
    { key: 'evidence', label: '资料', maxScore: 10, weight: 1, description: '证据使用恰当性' },
    { key: 'teamwork', label: '团队', maxScore: 10, weight: 1, description: '团队协作表现' },
  ];
};

export const validateScoreSubmission = (
  score: Partial<JudgeScore>,
  criteria: ScoringCriteria[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!score.judgeId) errors.push('缺少评委ID');
  if (!score.matchId) errors.push('缺少比赛ID');
  if (!score.sideAId || !score.sideBId) errors.push('缺少队伍信息');

  // Validate criteria scores
  criteria.forEach((criterion) => {
    const scoreValue = score.criteriaScores?.[criterion.key];
    if (scoreValue !== undefined) {
      if (scoreValue < 0) {
        errors.push(`${criterion.label}分数不能为负数`);
      }
      if (scoreValue > criterion.maxScore) {
        errors.push(`${criterion.label}分数不能超过${criterion.maxScore}`);
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

// Statistics and reporting
export const getJudgePerformanceStats = async (judgeId: string): Promise<{
  totalMatches: number;
  averageScoreGiven: number;
  consistencyRating: number;
  onTimeSubmissionRate: number;
}> => {
  const scores = await getJudgeScoresByJudge(judgeId);
  const assignments = await getJudgeAssignments(judgeId);

  const totalMatches = scores.length;
  const averageScoreGiven = scores.length > 0
    ? scores.reduce((sum, score) => sum + score.sideAScore + score.sideBScore, 0) / (scores.length * 2)
    : 0;

  // Simple consistency calculation (variance in scores)
  const allScores = scores.flatMap(s => [s.sideAScore, s.sideBScore]);
  const mean = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  const variance = allScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / allScores.length;
  const consistencyRating = Math.max(0, 10 - Math.sqrt(variance)); // Lower variance = higher consistency

  const onTimeSubmissions = assignments.filter(a => a.status === 'submitted').length;
  const onTimeSubmissionRate = assignments.length > 0 ? onTimeSubmissions / assignments.length : 0;

  return {
    totalMatches,
    averageScoreGiven,
    consistencyRating,
    onTimeSubmissionRate,
  };
};


