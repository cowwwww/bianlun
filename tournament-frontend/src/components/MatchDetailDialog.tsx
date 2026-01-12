import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip,
    Stack,
    TextField,
    Alert,
    Paper,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { type Match } from '../services/matchService';
import { type Registration } from '../services/registrationService';
import { type Judge } from '../services/judgeService';
import { type TeamMember } from '../services/teamMemberService';
import { getMatchCheckins, checkinForMatch, type MatchCheckin } from '../services/checkinService';
import { getMatchScores, submitMatchScore, type MatchScore } from '../services/scoringService';

interface MatchDetailDialogProps {
    open: boolean;
    onClose: () => void;
    match: Match | null;
    registrations: Registration[];
    judges: Judge[];
    teamMembers: TeamMember[];
    tournamentId: string;
}

const MatchDetailDialog: React.FC<MatchDetailDialogProps> = ({
    open,
    onClose,
    match,
    registrations,
    judges,
    teamMembers,
    tournamentId,
}) => {
    const [checkins, setCheckins] = useState<MatchCheckin[]>([]);
    const [scores, setScores] = useState<MatchScore[]>([]);
    const [checkinName, setCheckinName] = useState('');
    const [checkinMode, setCheckinMode] = useState<'player' | 'judge'>('player');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (match && open) {
            loadMatchData();
        }
    }, [match, open]);

    const loadMatchData = async () => {
        if (!match) return;
        try {
            const [checkinData, scoreData] = await Promise.all([
                getMatchCheckins(match.id),
                getMatchScores(match.id),
            ]);
            setCheckins(checkinData);
            setScores(scoreData);
        } catch (error) {
            console.error('Error loading match data:', error);
        }
    };

    const handleCheckin = async () => {
        if (!match || !checkinName.trim()) return;
        setLoading(true);
        setMessage(null);

        try {
            // Check if already checked in
            const existing = checkins.find(c => c.userName === checkinName.trim());
            if (existing) {
                setMessage({ type: 'error', text: '您已经签到过了！' });
                setLoading(false);
                return;
            }

            const result = await checkinForMatch({
                matchId: match.id,
                tournamentId: tournamentId,
                userName: checkinName.trim(),
                userRole: checkinMode,
            });

            if (result) {
                setCheckins([...checkins, result]);
                setCheckinName('');
                setMessage({ type: 'success', text: '签到成功！' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '签到失败，请重试' });
        } finally {
            setLoading(false);
        }
    };

    if (!match) return null;

    const sideATeam = registrations.find(r => r.id === match.sideAId);
    const sideBTeam = registrations.find(r => r.id === match.sideBId);
    const matchJudges = match.judgeIds?.map(jid => judges.find(j => j.id === jid)).filter(Boolean) || [];

    // Get expected players
    const sideAMembers = teamMembers.filter(m => m.registrationId === match.sideAId);
    const sideBMembers = teamMembers.filter(m => m.registrationId === match.sideBId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    {match.round || '比赛详情'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Match Info Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        比赛信息
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    {sideATeam?.teamName || '正方待定'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">正方</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mx: 2, color: 'text.secondary' }}>VS</Typography>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                    {sideBTeam?.teamName || '反方待定'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">反方</Typography>
                            </Box>
                        </Stack>

                        {match.scheduledAt && (
                            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                                ⏰ {new Date(match.scheduledAt).toLocaleString('zh-CN')}
                            </Typography>
                        )}

                        {matchJudges.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                                👨‍⚖️ 评委: {matchJudges.map(j => j?.fullName).join('、')}
                            </Typography>
                        )}
                    </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Check-in Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        签到 ({checkins.length}人已签到)
                    </Typography>

                    {message && (
                        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                            {message.text}
                        </Alert>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <TextField
                            label="您的姓名"
                            value={checkinName}
                            onChange={(e) => setCheckinName(e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCheckin}
                            disabled={!checkinName.trim() || loading}
                        >
                            {loading ? '签到中...' : '签到'}
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {checkins.map((c) => (
                            <Chip
                                key={c.id}
                                label={`${c.userName} ${c.userRole === 'judge' ? '(评委)' : ''}`}
                                size="small"
                                color={c.userRole === 'judge' ? 'info' : 'success'}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Scores Section */}
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        评分结果 ({scores.length}位评委已提交)
                    </Typography>

                    {scores.length > 0 ? (
                        <Stack spacing={1}>
                            {scores.map((s) => (
                                <Paper key={s.id} variant="outlined" sx={{ p: 1.5 }}>
                                    <Typography variant="body2">
                                        <strong>{s.judgeName}：</strong>
                                        正方 <Chip label={s.sideAScore} size="small" /> -
                                        <Chip label={s.sideBScore} size="small" /> 反方
                                        （{s.winner === 'A' ? '✅ 正方胜' : s.winner === 'B' ? '✅ 反方胜' : '平局'}）
                                    </Typography>
                                    {s.comments && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            💬 {s.comments}
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            暂无评分
                        </Typography>
                    )}

                    {match.result && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <strong>最终结果：</strong> {match.result}
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>关闭</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MatchDetailDialog;
