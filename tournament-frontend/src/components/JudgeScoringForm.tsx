import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Slider,
    CircularProgress,
    Alert,
    Divider,
    Chip,
} from '@mui/material';
import {
    getScoringCriteria,
    submitJudgeScore,
    getJudgeScoresByMatch,
    validateScoreSubmission,
    type ScoringCriteria,
    type JudgeScore,
} from '../services/judgeScoringService';

interface JudgeScoringFormProps {
    matchId: string;
    tournamentId: string;
    judgeId: string;
    judgeName: string;
    sideAId: string;
    sideBId: string;
    sideAName?: string;
    sideBName?: string;
    onSubmitSuccess?: () => void;
    readOnly?: boolean;
}

const JudgeScoringForm: React.FC<JudgeScoringFormProps> = ({
    matchId,
    tournamentId,
    judgeId,
    judgeName,
    sideAId,
    sideBId,
    sideAName = '正方',
    sideBName = '反方',
    onSubmitSuccess,
    readOnly = false,
}) => {
    const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
    const [sideAScores, setSideAScores] = useState<Record<string, number>>({});
    const [sideBScores, setSideBScores] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [existingScore, setExistingScore] = useState<JudgeScore | null>(null);

    useEffect(() => {
        loadData();
    }, [matchId, tournamentId, judgeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [criteriaData, matchScores] = await Promise.all([
                getScoringCriteria(tournamentId),
                getJudgeScoresByMatch(matchId),
            ]);

            setCriteria(criteriaData);

            // Check if this judge already submitted a score
            const myScore = matchScores.find(s => s.judgeId === judgeId);
            if (myScore) {
                setExistingScore(myScore);
                // Pre-fill scores from criteria
                // Note: The current data structure only has criteriaScores for side A
                // In a real implementation, you'd want separate scores for each side
                if (myScore.criteriaScores) {
                    const parsedScores = myScore.criteriaScores;
                    const aScores: Record<string, number> = {};
                    const bScores: Record<string, number> = {};

                    Object.keys(parsedScores).forEach(key => {
                        if (key.endsWith('_A')) {
                            aScores[key.replace('_A', '')] = parsedScores[key];
                        } else if (key.endsWith('_B')) {
                            bScores[key.replace('_B', '')] = parsedScores[key];
                        }
                    });

                    setSideAScores(aScores);
                    setSideBScores(bScores);
                }
                setNotes(myScore.notes || '');
            } else {
                // Initialize with default scores
                const defaultScores: Record<string, number> = {};
                criteriaData.forEach(c => {
                    defaultScores[c.key] = Math.floor(c.maxScore / 2);
                });
                setSideAScores(defaultScores);
                setSideBScores({ ...defaultScores });
            }
        } catch (err) {
            console.error('Error loading scoring data:', err);
            setError('加载评分数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (
        side: 'A' | 'B',
        criterionKey: string,
        value: number
    ) => {
        if (side === 'A') {
            setSideAScores(prev => ({ ...prev, [criterionKey]: value }));
        } else {
            setSideBScores(prev => ({ ...prev, [criterionKey]: value }));
        }
    };

    const calculateTotal = (scores: Record<string, number>): number => {
        return Object.values(scores).reduce((sum, score) => sum + score, 0);
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            // Combine scores into criteriaScores format
            const criteriaScores: Record<string, number> = {};
            Object.entries(sideAScores).forEach(([key, value]) => {
                criteriaScores[`${key}_A`] = value;
            });
            Object.entries(sideBScores).forEach(([key, value]) => {
                criteriaScores[`${key}_B`] = value;
            });

            const scoreData = {
                matchId,
                tournamentId,
                judgeId,
                judgeName,
                sideAId,
                sideBId,
                sideAScore: calculateTotal(sideAScores),
                sideBScore: calculateTotal(sideBScores),
                criteriaScores,
                notes,
            };

            // Validate
            const validation = validateScoreSubmission(scoreData, criteria);
            if (!validation.isValid) {
                setError(validation.errors.join('\n'));
                return;
            }

            await submitJudgeScore(scoreData);
            setSuccess(true);
            onSubmitSuccess?.();
        } catch (err) {
            console.error('Error submitting score:', err);
            setError('提交评分失败，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (success) {
        return (
            <Alert severity="success" sx={{ mb: 2 }}>
                评分提交成功！
            </Alert>
        );
    }

    const isSubmitted = existingScore?.status === 'submitted' || existingScore?.status === 'reviewed';

    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    评委评分
                </Typography>
                {isSubmitted && (
                    <Chip label="已提交" color="success" size="small" />
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                评委：{judgeName}
            </Typography>

            {/* Scoring Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                {/* Side A */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                        {sideAName}
                    </Typography>
                    <Stack spacing={2}>
                        {criteria.map(criterion => (
                            <Box key={`A_${criterion.key}`}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {criterion.label} (满分 {criterion.maxScore})
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Slider
                                        value={sideAScores[criterion.key] || 0}
                                        onChange={(_, value) => handleScoreChange('A', criterion.key, value as number)}
                                        min={0}
                                        max={criterion.maxScore}
                                        step={1}
                                        disabled={readOnly || isSubmitted}
                                        sx={{ flex: 1 }}
                                    />
                                    <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
                                        {sideAScores[criterion.key] || 0}
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ textAlign: 'right', color: 'primary.main' }}>
                        总分：{calculateTotal(sideAScores)}
                    </Typography>
                </Paper>

                {/* Side B */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'secondary.50' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main', mb: 2 }}>
                        {sideBName}
                    </Typography>
                    <Stack spacing={2}>
                        {criteria.map(criterion => (
                            <Box key={`B_${criterion.key}`}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {criterion.label} (满分 {criterion.maxScore})
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Slider
                                        value={sideBScores[criterion.key] || 0}
                                        onChange={(_, value) => handleScoreChange('B', criterion.key, value as number)}
                                        min={0}
                                        max={criterion.maxScore}
                                        step={1}
                                        disabled={readOnly || isSubmitted}
                                        sx={{ flex: 1 }}
                                    />
                                    <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
                                        {sideBScores[criterion.key] || 0}
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ textAlign: 'right', color: 'secondary.main' }}>
                        总分：{calculateTotal(sideBScores)}
                    </Typography>
                </Paper>
            </Box>

            {/* Notes */}
            <Box sx={{ mt: 3 }}>
                <TextField
                    label="评委点评 (选填)"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={readOnly || isSubmitted}
                    placeholder="请输入对本场比赛的点评..."
                />
            </Box>

            {/* Submit Button */}
            {!readOnly && !isSubmitted && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting}
                        size="large"
                    >
                        {submitting ? <CircularProgress size={24} /> : '提交评分'}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default JudgeScoringForm;
