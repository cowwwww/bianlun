import React from 'react';
import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import { type Match } from '../services/matchService';
import { type Registration } from '../services/registrationService';

interface BracketProps {
    matches: Match[];
    registrations: Registration[];
    onMatchClick?: (match: Match) => void;
}

// Group matches by round
const groupMatchesByRound = (matches: Match[]): Record<string, Match[]> => {
    const groups: Record<string, Match[]> = {};
    matches.forEach(match => {
        const round = match.round || 'Unknown';
        if (!groups[round]) {
            groups[round] = [];
        }
        groups[round].push(match);
    });
    return groups;
};

// Get round order for positioning
const getRoundOrder = (round: string): number => {
    const lowerRound = round.toLowerCase();
    if (lowerRound.includes('final') && !lowerRound.includes('semi') && !lowerRound.includes('quarter')) return 100;
    if (lowerRound.includes('semi')) return 90;
    if (lowerRound.includes('quarter')) return 80;
    if (lowerRound.includes('r16') || lowerRound.includes('16强')) return 70;
    if (lowerRound.includes('r32') || lowerRound.includes('32强')) return 60;
    // Try to extract round number
    const match = round.match(/(\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 50;
};

const TournamentBracket: React.FC<BracketProps> = ({ matches, registrations, onMatchClick }) => {
    const matchGroups = groupMatchesByRound(matches);
    const sortedRounds = Object.keys(matchGroups).sort((a, b) => getRoundOrder(a) - getRoundOrder(b));

    const getTeamName = (teamId: string): string => {
        const reg = registrations.find(r => r.id === teamId);
        return reg?.teamName || teamId || 'TBD';
    };

    if (matches.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                暂无比赛可显示
            </Typography>
        );
    }

    return (
        <Box sx={{ overflowX: 'auto', py: 2 }}>
            <Stack direction="row" spacing={4} sx={{ minWidth: sortedRounds.length * 280 }}>
                {sortedRounds.map((round) => (
                    <Box key={round} sx={{ minWidth: 250 }}>
                        {/* Round Header */}
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                mb: 2,
                                py: 1,
                                bgcolor: 'primary.main',
                                color: 'white',
                                borderRadius: 1,
                            }}
                        >
                            {round}
                        </Typography>

                        {/* Matches in this round */}
                        <Stack spacing={2}>
                            {matchGroups[round].map((match, index) => (
                                <Paper
                                    key={match.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        cursor: onMatchClick ? 'pointer' : 'default',
                                        transition: 'all 0.2s',
                                        '&:hover': onMatchClick ? {
                                            boxShadow: 2,
                                            borderColor: 'primary.main',
                                        } : {},
                                    }}
                                    onClick={() => onMatchClick?.(match)}
                                >
                                    {/* Match number */}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                        #{index + 1}
                                    </Typography>

                                    {/* Side A */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: match.result?.includes('正方') ? 700 : 400,
                                                color: match.result?.includes('正方') ? 'success.main' : 'text.primary',
                                            }}
                                        >
                                            {getTeamName(match.sideAId)}
                                        </Typography>
                                        {match.result?.includes('正方') && (
                                            <Chip label="●" size="small" color="success" sx={{ minWidth: 20, height: 20, '& .MuiChip-label': { px: 0.5 } }} />
                                        )}
                                    </Stack>

                                    {/* Side B */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: match.result?.includes('反方') ? 700 : 400,
                                                color: match.result?.includes('反方') ? 'success.main' : 'text.primary',
                                            }}
                                        >
                                            {getTeamName(match.sideBId)}
                                        </Typography>
                                        {match.result?.includes('反方') && (
                                            <Chip label="●" size="small" color="success" sx={{ minWidth: 20, height: 20, '& .MuiChip-label': { px: 0.5 } }} />
                                        )}
                                    </Stack>

                                    {/* Time */}
                                    {match.scheduledAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            {new Date(match.scheduledAt).toLocaleDateString('zh-CN')}
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default TournamentBracket;
