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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTournaments, updateTournament, type Tournament } from '../services/tournamentService';

const TournamentOrganizer: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [scoringJson, setScoringJson] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState<number | undefined>(undefined);
  const [totalTeams, setTotalTeams] = useState<number | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        setError((err as Error).message || '加载赛事失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            主办方赛事中心
          </Typography>
          <Typography variant="body2" color="text.secondary">
            来自 PocketBase 的赛事列表
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/create-tournament')}>
          创建赛事
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tournaments.map((t) => (
          <Grid item xs={12} md={6} lg={4} key={t.id}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
              <CardContent>
                <Chip label={t.type || '赛事'} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t.title || t.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t.description || '暂无描述'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  时间：{t.startDate} - {t.endDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  地点：{t.location}
                </Typography>
              {t.playersPerTeam ? (
                <Typography variant="body2" color="text.secondary">
                  队伍人数：{t.playersPerTeam}
                </Typography>
              ) : null}
              {t.totalTeams ? (
                <Typography variant="body2" color="text.secondary">
                  规模：{t.totalTeams} 支队伍
                </Typography>
              ) : null}
              {t.scoringConfig?.length ? (
                <Typography variant="body2" color="text.secondary">
                  评分维度：{t.scoringConfig.map((d) => d.label).join(' / ')}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button size="small" variant="outlined" onClick={() => navigate(`/tournaments/${t.id}`)}>
                  查看详情
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setEditing(t);
                    setPlayersPerTeam(t.playersPerTeam);
                    setTotalTeams(t.totalTeams);
                    setScoringJson(JSON.stringify(t.scoringConfig || [], null, 2));
                    setEditOpen(true);
                  }}
                >
                  配置规则
                </Button>
              </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

    <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>配置队伍人数与评分维度</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="队伍人数上限"
            type="number"
            value={playersPerTeam ?? ''}
            onChange={(e) => setPlayersPerTeam(e.target.value ? Number(e.target.value) : undefined)}
            helperText="由主办方设定的每队人数"
          />
          <TextField
            label="队伍数量上限"
            type="number"
            value={totalTeams ?? ''}
            onChange={(e) => setTotalTeams(e.target.value ? Number(e.target.value) : undefined)}
            helperText="由主办方设定的参赛队伍规模"
          />
          <TextField
            label="评分维度配置（JSON 数组）"
            multiline
            minRows={6}
            value={scoringJson}
            onChange={(e) => setScoringJson(e.target.value)}
            helperText='示例：[{"key":"expression","label":"表达","max":10,"weight":1}]'
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>取消</Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (!editing) return;
            try {
              const parsed = scoringJson ? JSON.parse(scoringJson) : [];
              await updateTournament(editing.id, {
                playersPerTeam,
                totalTeams,
                scoringConfig: parsed,
              });
              setEditOpen(false);
              const data = await getTournaments();
              setTournaments(data);
            } catch (err) {
              console.error('更新失败', err);
              alert('保存失败，请检查 JSON 格式或稍后再试');
            }
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
    </Container>
  );
};

export default TournamentOrganizer;

