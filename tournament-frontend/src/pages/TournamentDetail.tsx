import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip, Button } from '@mui/material';
import { getTournamentById, type Tournament } from '../services/tournamentService';

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTournament(id);
    }
  }, [id]);

  const loadTournament = async (tournamentId: string) => {
    try {
      const data = await getTournamentById(tournamentId);
      setTournament(data);
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
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
          <Typography variant="h3" gutterBottom>
            {tournament.name || tournament.title}
          </Typography>
          <Chip label={tournament.type} sx={{ mr: 1 }} />
          <Chip label={tournament.status} color="primary" />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            赛事简介
          </Typography>
          <Typography variant="body1" paragraph>
            {tournament.description}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            赛事信息
          </Typography>
          <Typography variant="body2">📍 地点：{tournament.location}</Typography>
          <Typography variant="body2">📅 开始时间：{tournament.startDate}</Typography>
          <Typography variant="body2">📅 结束时间：{tournament.endDate}</Typography>
          <Typography variant="body2">📝 报名截止：{tournament.registrationDeadline}</Typography>
          <Typography variant="body2">👥 组织者：{tournament.organizer}</Typography>
          <Typography variant="body2">📞 联系方式：{tournament.contact}</Typography>
        </Box>

        <Button variant="contained" size="large">
          立即报名
        </Button>
      </Paper>
    </Container>
  );
};

export default TournamentDetail;
