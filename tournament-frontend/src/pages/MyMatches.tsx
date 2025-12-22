import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import { listMatchesByTournament, type Match } from '../services/matchService';
import { listRegistrationsByTournament, type Registration } from '../services/registrationService';
import { getTournaments, type Tournament } from '../services/tournamentService';

const MyMatches: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Record<string, Tournament>>({});
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) {
        setError('请先登录，以查看分配的场次');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 取全部赛事，后续按 judgeId 过滤 match
        const tournamentsList = await getTournaments();
        const tourMap = tournamentsList.reduce<Record<string, Tournament>>((acc, t) => {
          acc[t.id] = t;
          return acc;
        }, {});

        // 为简化：遍历所有赛事的对阵并过滤
        const allMatches: Match[] = [];
        const allRegs: Record<string, Registration> = {};
        for (const t of tournamentsList) {
          const mList = await listMatchesByTournament(t.id);
          const filtered = mList.filter((m) => m.judgeIds?.includes(currentUser.id));
          if (filtered.length) {
            const regs = await listRegistrationsByTournament(t.id);
            regs.forEach((r) => {
              allRegs[r.id] = r;
            });
            allMatches.push(...filtered);
          }
        }

        setTournaments(tourMap);
        setRegistrations(allRegs);
        setMatches(allMatches);
      } catch (err) {
        setError((err as Error).message || '加载我的场次失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          我的裁判场次
        </Typography>
        <Typography variant="body2" color="text.secondary">
          仅显示分配到您账号的场次。评分规则以主办方通知为准。
        </Typography>
      </Box>

      {matches.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">暂无分配给您的场次</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {matches.map((m) => {
            const tournament = tournaments[m.tournamentId];
            const sideA = registrations[m.sideAId]?.teamName || m.sideAId || '待定';
            const sideB = registrations[m.sideBId]?.teamName || m.sideBId || '待定';
            return (
              <Grid item xs={12} md={6} key={m.id}>
                <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                      {tournament && <Chip label={tournament.title || tournament.name} size="small" />}
                      <Chip label={m.round || '未命名轮次'} color="primary" size="small" />
                      {m.room && <Chip label={m.room} size="small" />}
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      正方：{sideA}
                    </Typography>
                    <Typography variant="subtitle1">反方：{sideB}</Typography>
                    {m.scheduledAt && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        时间：{new Date(m.scheduledAt).toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      评委：{m.judgeIds?.join('，')}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button size="small" variant="contained" onClick={() => navigate(`/matches/${m.id}/score`)}>
                        录入评分
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/tournaments/${m.tournamentId}`)}>
                        查看赛事
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MyMatches;



