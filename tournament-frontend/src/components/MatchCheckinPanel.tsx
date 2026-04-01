import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Cancel as AbsentIcon,
    AccessTime as LateIcon,
} from '@mui/icons-material';
import {
    getMatchCheckins,
    createCheckin,
    updateCheckinStatus,
    type MatchCheckin,
    type CheckinStatus,
    type UserType,
} from '../services/checkinService';
import type { TeamMember } from '../services/teamMemberService';
import type { Judge } from '../services/judgeService';

interface MatchCheckinPanelProps {
    matchId: string;
    tournamentId: string;
    sideAMembers?: TeamMember[];
    sideBMembers?: TeamMember[];
    judges?: Judge[];
    sideATeamName?: string;
    sideBTeamName?: string;
    sideATeamId?: string;
    sideBTeamId?: string;
    isOrganizer?: boolean;
}

const statusConfig: Record<CheckinStatus, { color: 'success' | 'error' | 'warning'; icon: React.ReactElement; label: string }> = {
    checked_in: { color: 'success', icon: <CheckIcon fontSize="small" />, label: '已签到' },
    absent: { color: 'error', icon: <AbsentIcon fontSize="small" />, label: '缺席' },
    late: { color: 'warning', icon: <LateIcon fontSize="small" />, label: '迟到' },
};

const MatchCheckinPanel: React.FC<MatchCheckinPanelProps> = ({
    matchId,
    tournamentId,
    sideAMembers = [],
    sideBMembers = [],
    judges = [],
    sideATeamName = '正方',
    sideBTeamName = '反方',
    sideATeamId,
    sideBTeamId,
    isOrganizer = false,
}) => {
    const [checkins, setCheckins] = useState<MatchCheckin[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadCheckins();
    }, [matchId]);

    const loadCheckins = async () => {
        try {
            setLoading(true);
            const data = await getMatchCheckins(matchId);
            setCheckins(data);
        } catch (error) {
            console.error('Error loading check-ins:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCheckinStatus = (userId: string): MatchCheckin | undefined => {
        return checkins.find(c => c.userId === userId);
    };

    const handleCheckin = async (
        userId: string,
        userName: string,
        userType: UserType,
        teamId?: string,
        status: CheckinStatus = 'checked_in'
    ) => {
        try {
            setProcessing(userId);
            const existing = getCheckinStatus(userId);

            if (existing) {
                await updateCheckinStatus(existing.id, status);
                setCheckins(prev =>
                    prev.map(c => (c.id === existing.id ? { ...c, status } : c))
                );
            } else {
                const newCheckin = await createCheckin({
                    matchId,
                    tournamentId,
                    userId,
                    userName,
                    userType,
                    teamId,
                    status,
                });
                setCheckins(prev => [...prev, newCheckin]);
            }
        } catch (error) {
            console.error('Error processing check-in:', error);
        } finally {
            setProcessing(null);
        }
    };

    const renderStatusChip = (userId: string) => {
        const checkin = getCheckinStatus(userId);
        if (!checkin) {
            return <Chip label="未签到" size="small" variant="outlined" />;
        }
        const config = statusConfig[checkin.status];
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                icon={config.icon}
            />
        );
    };

    const renderActionButtons = (
        userId: string,
        userName: string,
        userType: UserType,
        teamId?: string
    ) => {
        if (!isOrganizer) return null;

        const isProcessing = processing === userId;
        const checkin = getCheckinStatus(userId);

        return (
            <Stack direction="row" spacing={0.5}>
                <Button
                    size="small"
                    variant={checkin?.status === 'checked_in' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => handleCheckin(userId, userName, userType, teamId, 'checked_in')}
                    disabled={isProcessing}
                    sx={{ minWidth: 'auto', px: 1 }}
                >
                    {isProcessing ? <CircularProgress size={16} /> : '签到'}
                </Button>
                <Button
                    size="small"
                    variant={checkin?.status === 'late' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => handleCheckin(userId, userName, userType, teamId, 'late')}
                    disabled={isProcessing}
                    sx={{ minWidth: 'auto', px: 1 }}
                >
                    迟到
                </Button>
                <Button
                    size="small"
                    variant={checkin?.status === 'absent' ? 'contained' : 'outlined'}
                    color="error"
                    onClick={() => handleCheckin(userId, userName, userType, teamId, 'absent')}
                    disabled={isProcessing}
                    sx={{ minWidth: 'auto', px: 1 }}
                >
                    缺席
                </Button>
            </Stack>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    const totalMembers = sideAMembers.length + sideBMembers.length + judges.length;
    const checkedInCount = checkins.filter(c => c.status === 'checked_in').length;

    return (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    比赛签到
                </Typography>
                <Chip
                    label={`${checkedInCount}/${totalMembers} 已签到`}
                    color={checkedInCount === totalMembers ? 'success' : 'default'}
                    size="small"
                />
            </Box>

            {/* Side A Team */}
            {sideAMembers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                        正方 - {sideATeamName}
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>姓名</TableCell>
                                    <TableCell>角色</TableCell>
                                    <TableCell>状态</TableCell>
                                    {isOrganizer && <TableCell>操作</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sideAMembers.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{renderStatusChip(member.id)}</TableCell>
                                        {isOrganizer && (
                                            <TableCell>
                                                {renderActionButtons(member.id, member.name, 'team_member', sideATeamId)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Side B Team */}
            {sideBMembers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.main' }}>
                        反方 - {sideBTeamName}
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>姓名</TableCell>
                                    <TableCell>角色</TableCell>
                                    <TableCell>状态</TableCell>
                                    {isOrganizer && <TableCell>操作</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sideBMembers.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{renderStatusChip(member.id)}</TableCell>
                                        {isOrganizer && (
                                            <TableCell>
                                                {renderActionButtons(member.id, member.name, 'team_member', sideBTeamId)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Judges */}
            {judges.length > 0 && (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
                        评委
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>姓名</TableCell>
                                    <TableCell>类型</TableCell>
                                    <TableCell>状态</TableCell>
                                    {isOrganizer && <TableCell>操作</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {judges.map(judge => (
                                    <TableRow key={judge.id}>
                                        <TableCell>{judge.fullName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={judge.judgeTypes?.includes('随队评委') ? '随评' : '外聘'}
                                                size="small"
                                                variant="outlined"
                                                color={judge.judgeTypes?.includes('随队评委') ? 'info' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{renderStatusChip(judge.id)}</TableCell>
                                        {isOrganizer && (
                                            <TableCell>
                                                {renderActionButtons(judge.id, judge.fullName, 'judge')}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Paper>
    );
};

export default MatchCheckinPanel;
