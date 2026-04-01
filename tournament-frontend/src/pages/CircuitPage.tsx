import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Box,
    Tabs,
    Tab,
    Grid,
    Chip,
    Stack,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    getCircuit,
    getRoundMatches,
    type Circuit,
    type CircuitMatch,
} from '../services/circuitService';
import { getTournamentById, type Tournament } from '../services/tournamentService';
import { listJudges, type Judge } from '../services/judgeService';
import { listRegistrationsByTournament, type Registration } from '../services/registrationService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`circuit-tabpanel-${index}`}
            aria-labelledby={`circuit-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const CircuitPage: React.FC = () => {
    const { id: tournamentId } = useParams<{ id: string }>();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [circuit, setCircuit] = useState<Circuit | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (tournamentId) {
            loadData(tournamentId);
        }
    }, [tournamentId]);

    const loadData = async (tid: string) => {
        try {
            setLoading(true);
            const [tournamentData, circuitData, regData, judgeData] = await Promise.all([
                getTournamentById(tid),
                getCircuit(tid),
                listRegistrationsByTournament(tid),
                listJudges(),
            ]);
            setTournament(tournamentData);
            setCircuit(circuitData);
            setRegistrations(regData);
            setJudges(judgeData);
        } catch (error) {
            console.error('Error loading circuit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTeamName = (teamId: string): string => {
        const reg = registrations.find(r => r.id === teamId);
        return reg?.teamName || teamId;
    };

    const getJudgeNames = (judgeIds: string[]): string => {
        return judgeIds
            .map(id => judges.find(j => j.id === id)?.fullName || id)
            .join('、');
    };

    const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'primary';
            case 'scheduled':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'completed':
                return '已完成';
            case 'in_progress':
                return '进行中';
            case 'scheduled':
                return '待开始';
            case 'cancelled':
                return '已取消';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!tournament) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>赛事未找到</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {tournament.name || tournament.title} - 比赛赛程
                    </Typography>
                    {circuit && (
                        <Stack direction="row" spacing={1}>
                            <Chip label={`${circuit.totalTeams} 支队伍`} size="small" />
                            <Chip
                                label={circuit.status === 'published' ? '已发布' : circuit.status === 'in_progress' ? '进行中' : '草稿'}
                                color={circuit.status === 'published' ? 'success' : circuit.status === 'in_progress' ? 'primary' : 'default'}
                                size="small"
                            />
                            <Chip label={`第 ${circuit.currentRound} 轮`} size="small" variant="outlined" />
                        </Stack>
                    )}
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, newValue) => setTabValue(newValue)}
                        aria-label="circuit tabs"
                    >
                        <Tab label="所有比赛" />
                        <Tab label="对阵图" />
                    </Tabs>
                </Box>

                {/* All Matches Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        所有比赛
                    </Typography>

                    {!circuit || circuit.rounds.length === 0 ? (
                        <Typography color="text.secondary">暂无比赛安排</Typography>
                    ) : (
                        <Stack spacing={4}>
                            {circuit.rounds.map((round, roundIndex) => (
                                <Box key={round.id || roundIndex}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                                        {round.roundName || `第 ${roundIndex + 1} 轮`}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {round.matches.map((match, matchIndex) => (
                                            <Grid item xs={12} md={6} key={match.id || matchIndex}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderLeft: 4,
                                                        borderLeftColor: getStatusColor(match.status) + '.main',
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {match.room ? `房间：${match.room}` : ''}{' '}
                                                            {match.scheduledAt ? new Date(match.scheduledAt).toLocaleString('zh-CN') : ''}
                                                        </Typography>
                                                        <Chip
                                                            label={getStatusLabel(match.status)}
                                                            color={getStatusColor(match.status)}
                                                            size="small"
                                                        />
                                                    </Stack>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 2,
                                                            my: 2,
                                                        }}
                                                    >
                                                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                {match.sideAName || getTeamName(match.sideAId)}
                                                            </Typography>
                                                            <Typography variant="caption" color="primary.main">
                                                                正方
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ px: 2, fontWeight: 'bold', color: 'text.secondary' }}>
                                                            VS
                                                        </Typography>
                                                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                {match.sideBName || getTeamName(match.sideBId)}
                                                            </Typography>
                                                            <Typography variant="caption" color="secondary.main">
                                                                反方
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {match.judgeIds && match.judgeIds.length > 0 && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            <strong>评委：</strong>
                                                            {match.judgeNames?.join('、') || getJudgeNames(match.judgeIds)}
                                                        </Typography>
                                                    )}

                                                    {match.result && (
                                                        <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                结果：{match.result.winner === 'A' ? (match.sideAName || getTeamName(match.sideAId)) : match.result.winner === 'B' ? (match.sideBName || getTeamName(match.sideBId)) : '平局'}
                                                                {match.result.scores?.sideA !== undefined && match.result.scores?.sideB !== undefined && (
                                                                    <> ({match.result.scores.sideA} : {match.result.scores.sideB})</>
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </TabPanel>

                {/* Bracket Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        对阵图
                    </Typography>

                    {!circuit || circuit.rounds.length === 0 ? (
                        <Typography color="text.secondary">暂无对阵图</Typography>
                    ) : (
                        <Box sx={{ overflowX: 'auto', pb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 4, minWidth: 'fit-content' }}>
                                {circuit.rounds.map((round, roundIndex) => (
                                    <Box key={round.id || roundIndex} sx={{ minWidth: 280 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 2,
                                                textAlign: 'center',
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                py: 1,
                                                borderRadius: 1,
                                            }}
                                        >
                                            {round.roundName || `第 ${roundIndex + 1} 轮`}
                                        </Typography>
                                        <Stack spacing={2} sx={{ alignItems: 'center' }}>
                                            {round.matches.map((match, matchIndex) => (
                                                <Paper
                                                    key={match.id || matchIndex}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        width: '100%',
                                                        bgcolor: match.status === 'completed' ? 'success.50' : 'background.paper',
                                                        position: 'relative',
                                                        '&::after': roundIndex < circuit.rounds.length - 1 ? {
                                                            content: '""',
                                                            position: 'absolute',
                                                            right: -20,
                                                            top: '50%',
                                                            width: 20,
                                                            height: 2,
                                                            bgcolor: 'grey.300',
                                                        } : {},
                                                    }}
                                                >
                                                    <Stack spacing={0.5}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                p: 0.5,
                                                                bgcolor: match.result?.winner === 'A' ? 'success.100' : 'transparent',
                                                                borderRadius: 0.5,
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ fontWeight: match.result?.winner === 'A' ? 600 : 400 }}>
                                                                {match.sideAName || getTeamName(match.sideAId)}
                                                            </Typography>
                                                            {match.result?.scores?.sideA !== undefined && (
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {match.result.scores.sideA}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                p: 0.5,
                                                                bgcolor: match.result?.winner === 'B' ? 'success.100' : 'transparent',
                                                                borderRadius: 0.5,
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ fontWeight: match.result?.winner === 'B' ? 600 : 400 }}>
                                                                {match.sideBName || getTeamName(match.sideBId)}
                                                            </Typography>
                                                            {match.result?.scores?.sideB !== undefined && (
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {match.result.scores.sideB}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default CircuitPage;
