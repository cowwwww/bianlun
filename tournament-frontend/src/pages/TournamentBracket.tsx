import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { listMatchesByTournament, type Match } from '../services/matchService';
import { listRegistrationsByTournament, type Registration } from '../services/registrationService';

const TournamentBracket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [matchData, regData] = await Promise.all([
          listMatchesByTournament(id),
          listRegistrationsByTournament(id),
        ]);
        const regMap = regData.reduce<Record<string, Registration>>((acc, r) => {
          acc[r.id] = r;
          return acc;
        }, {});
        setRegistrations(regMap);
        setMatches(matchData);
      } catch (error) {
        console.error('Error loading bracket data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          赛程签表
        </Typography>
        <Typography variant="body2" color="text.secondary">
          对阵与报名队伍数据来自 PocketBase
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="对阵列表" />
        <Tab label="报名队伍" />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            对阵列表
          </Typography>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : matches.length === 0 ? (
            <Typography color="text.secondary">暂无对阵</Typography>
          ) : (
            <Grid container spacing={2}>
              {matches.map((match) => (
                <Grid item xs={12} md={6} key={match.id}>
                  <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip label={match.round || '未命名轮次'} color="primary" size="small" />
                        {match.room && <Chip label={match.room} size="small" />}
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        正方：{registrations[match.sideAId]?.teamName || match.sideAId || '待定'}
                      </Typography>
                      <Typography variant="subtitle1">
                        反方：{registrations[match.sideBId]?.teamName || match.sideBId || '待定'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        评委：{match.judgeIds?.length ? match.judgeIds.join('，') : '待分配'}
                      </Typography>
                      {match.result && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          结果：{match.result}
                        </Typography>
                      )}
                      {match.scheduledAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          时间：{new Date(match.scheduledAt).toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            报名队伍
          </Typography>
          {Object.keys(registrations).length === 0 ? (
            <Typography color="text.secondary">暂无报名</Typography>
          ) : (
            <Stack spacing={1}>
              {Object.values(registrations).map((reg) => (
                <Paper key={reg.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {reg.teamName}（{reg.participants?.length || 0} 人）
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reg.participants?.join('，')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    组别：{reg.category || '未分组'} ｜ 状态：{reg.status} ｜ 支付：{reg.paymentStatus}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default TournamentBracket;



