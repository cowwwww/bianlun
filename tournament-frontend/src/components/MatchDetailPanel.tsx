import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import {
    getMatchCheckins,
    createCheckin,
    getChairmanCheckin,
    setChairmanApproval,
    type MatchCheckin,
    type UserType,
} from '../services/checkinService';
import { getJudgeScoresByMatch, type JudgeScore } from '../services/judgeScoringService';
import MatchCheckinPanel from './MatchCheckinPanel';
import JudgeScoringForm from './JudgeScoringForm';
import type { TeamMember } from '../services/teamMemberService';
import type { Judge } from '../services/judgeService';
import type { Match } from '../services/matchService';

interface MatchDetailPanelProps {
    match: Match;
    tournamentId: string;
    sideAMembers?: TeamMember[];
    sideBMembers?: TeamMember[];
    judges?: Judge[];
    chairmanId?: string;
    chairmanName?: string;
    sideATeamName?: string;
    sideBTeamName?: string;
    sideATeamId?: string;
    sideBTeamId?: string;
    currentUserId?: string;
    currentUserType?: 'organizer' | 'judge' | 'player' | 'chairman';
    isOrganizer?: boolean;
}

const MatchDetailPanel: React.FC<MatchDetailPanelProps> = ({
    match,
    tournamentId,
    sideAMembers = [],
    sideBMembers = [],
    judges = [],
    chairmanId,
    chairmanName = '主席',
    sideATeamName = '正方',
    sideBTeamName = '反方',
    sideATeamId,
    sideBTeamId,
    currentUserId,
    currentUserType,
    isOrganizer = false,
}) => {
    const [loading, setLoading] = useState(true);
    const [chairmanCheckin, setChairmanCheckin] = useState<MatchCheckin | null>(null);
    const [judgeScores, setJudgeScores] = useState<JudgeScore[]>([]);
    const [expanded, setExpanded] = useState<string | false>('checkin');
    const [processingApproval, setProcessingApproval] = useState(false);

    const JUDGES_PER_MATCH = 3;

    useEffect(() => {
        loadData();
    }, [match.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [chairman, scores] = await Promise.all([
                getChairmanCheckin(match.id),
                getJudgeScoresByMatch(match.id),
            ]);
            setChairmanCheckin(chairman);
            setJudgeScores(scores);
        } catch (error) {
            console.error('Error loading match detail data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChairmanCheckin = async () => {
        if (!chairmanId) return;
        try {
            const checkin = await createCheckin({
                matchId: match.id,
                tournamentId,
                userId: chairmanId,
                userName: chairmanName,
                userType: 'chairman',
                status: 'checked_in',
                chairmanApproved: false,
            });
            setChairmanCheckin(checkin);
        } catch (error) {
            console.error('Error checking in chairman:', error);
        }
    };

    const handleChairmanApproval = async () => {
        try {
            setProcessingApproval(true);
            await setChairmanApproval(match.id, true);
            setChairmanCheckin(prev => prev ? { ...prev, chairmanApproved: true } : null);
        } catch (error) {
            console.error('Error approving scores:', error);
        } finally {
            setProcessingApproval(false);
        }
    };

    const isScoreVisible = chairmanCheckin?.chairmanApproved === true;
    const allJudgesSubmitted = judgeScores.filter(s => s.status === 'submitted').length >= JUDGES_PER_MATCH;
    const isChairman = currentUserType === 'chairman' || currentUserId === chairmanId;
    const isJudge = currentUserType === 'judge' || judges.some(j => j.id === currentUserId);
    const currentJudge = judges.find(j => j.id === currentUserId);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            {/* Match Header */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    比赛详情 - {match.room || '待定'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString('zh-CN') : '时间待定'}
                </Typography>
            </Box>

            {/* Teams Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">{sideATeamName}</Typography>
                    <Chip label="正方" size="small" color="primary" variant="outlined" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'grey.500' }}>VS</Typography>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h6" color="secondary.main">{sideBTeamName}</Typography>
                    <Chip label="反方" size="small" color="secondary" variant="outlined" />
                </Box>
            </Box>

            {/* Chairman Check-in Section */}
            <Accordion expanded={expanded === 'chairman'} onChange={() => setExpanded(expanded === 'chairman' ? false : 'chairman')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>主席签到</Typography>
                        {chairmanCheckin?.status === 'checked_in' && (
                            <Chip icon={<CheckIcon />} label="已签到" color="success" size="small" />
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                            主席需要先签到，比赛结束后确认评分可以公开
                        </Typography>

                        {!chairmanCheckin ? (
                            <Button
                                variant="contained"
                                onClick={handleChairmanCheckin}
                                disabled={!chairmanId}
                            >
                                主席签到
                            </Button>
                        ) : (
                            <Stack spacing={1}>
                                <Alert severity="success" icon={<CheckIcon />}>
                                    主席 {chairmanCheckin.userName} 已签到
                                </Alert>

                                {/* Chairman Approval Button */}
                                {(isChairman || isOrganizer) && !chairmanCheckin.chairmanApproved && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            评委评分状态：{judgeScores.filter(s => s.status === 'submitted').length}/{JUDGES_PER_MATCH} 已提交
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleChairmanApproval}
                                            disabled={processingApproval || !allJudgesSubmitted}
                                        >
                                            {processingApproval ? <CircularProgress size={20} /> : '确认公开评分'}
                                        </Button>
                                        {!allJudgesSubmitted && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                需等待所有评委提交评分后才能公开
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {chairmanCheckin.chairmanApproved && (
                                    <Alert severity="info" icon={<InfoIcon />}>
                                        评分已公开显示
                                    </Alert>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Team & Judge Check-in Section */}
            <Accordion expanded={expanded === 'checkin'} onChange={() => setExpanded(expanded === 'checkin' ? false : 'checkin')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>队员与评委签到</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <MatchCheckinPanel
                        matchId={match.id}
                        tournamentId={tournamentId}
                        sideAMembers={sideAMembers}
                        sideBMembers={sideBMembers}
                        judges={judges}
                        sideATeamName={sideATeamName}
                        sideBTeamName={sideBTeamName}
                        sideATeamId={sideATeamId}
                        sideBTeamId={sideBTeamId}
                        isOrganizer={isOrganizer}
                    />
                </AccordionDetails>
            </Accordion>

            {/* Judge Scoring Section - Only visible to judges */}
            {isJudge && currentJudge && (
                <Accordion expanded={expanded === 'scoring'} onChange={() => setExpanded(expanded === 'scoring' ? false : 'scoring')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>评委评分</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <JudgeScoringForm
                            matchId={match.id}
                            tournamentId={tournamentId}
                            judgeId={currentJudge.id}
                            judgeName={currentJudge.fullName}
                            sideAId={match.sideAId}
                            sideBId={match.sideBId}
                            sideAName={sideATeamName}
                            sideBName={sideBTeamName}
                            onSubmitSuccess={loadData}
                        />
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Score Results Section - Only visible after chairman approval */}
            <Accordion
                expanded={expanded === 'results'}
                onChange={() => setExpanded(expanded === 'results' ? false : 'results')}
                disabled={!isScoreVisible && !isOrganizer && !isChairman}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>比赛结果</Typography>
                        {!isScoreVisible && (
                            <Chip label="主席确认后公开" size="small" variant="outlined" />
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {isScoreVisible || isOrganizer || isChairman ? (
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                评委评分结果 ({judgeScores.filter(s => s.status === 'submitted').length}/{JUDGES_PER_MATCH} 评委已提交)
                            </Typography>

                            {judgeScores.length === 0 ? (
                                <Typography color="text.secondary">暂无评分</Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {judgeScores.map((score, idx) => (
                                        <Paper key={score.id} variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                评委 {idx + 1}: {score.judgeName || '未知'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                <Typography variant="body2">
                                                    {sideATeamName}: <strong>{score.sideAScore}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    {sideBTeamName}: <strong>{score.sideBScore}</strong>
                                                </Typography>
                                            </Box>
                                            {score.notes && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    点评: {score.notes}
                                                </Typography>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            )}

                            {/* Total Score Summary */}
                            {judgeScores.length > 0 && (
                                <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>总分统计</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="primary.main">
                                                {judgeScores.reduce((sum, s) => sum + s.sideAScore, 0)}
                                            </Typography>
                                            <Typography variant="body2">{sideATeamName}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h5" color="secondary.main">
                                                {judgeScores.reduce((sum, s) => sum + s.sideBScore, 0)}
                                            </Typography>
                                            <Typography variant="body2">{sideBTeamName}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}
                        </Stack>
                    ) : (
                        <Alert severity="info">
                            评分结果将在主席确认后公开显示
                        </Alert>
                    )}
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default MatchDetailPanel;
