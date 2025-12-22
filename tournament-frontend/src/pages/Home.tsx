import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CardMedia,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTournaments, type Tournament } from '../services/tournamentService';
import { getFinishedTournaments, type FinishedTournament } from '../services/finishedTournaments';

const Home = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [finishedTournaments, setFinishedTournaments] = useState<FinishedTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
    setFinishedTournaments(getFinishedTournaments());
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          欢迎来到云赛
        </Typography>
        <Typography variant="h6" color="text.secondary">
          发现并参加各类辩论赛事
        </Typography>
      </Box>

      {loading ? (
        <Typography>加载中...</Typography>
      ) : (
        <Grid container spacing={3}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} md={6} lg={4} key={tournament.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {tournament.name || tournament.title}
                  </Typography>
                  <Chip label={tournament.type} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tournament.description}
                  </Typography>
                  <Typography variant="body2">
                    📍 {tournament.location}
                  </Typography>
                  <Typography variant="body2">
                    📅 {tournament.startDate}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                    查看详情
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Finished tournaments from legacy ArcX site */}
      <Box sx={{ mt: 6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              往期赛果
            </Typography>
            <Typography variant="body1" color="text.secondary">
              来自 ArcX 站点的已完成赛事与赛果
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            href="https://cowwwww.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            前往ArcX
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {finishedTournaments.map((item) => (
            <Grid item xs={12} md={6} lg={3} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.image && (
                  <CardMedia component="img" height="160" image={item.image} alt={item.title} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {item.tag && <Chip label={item.tag} size="small" color="primary" />}
                    {item.year && <Chip label={item.year} size="small" />}
                  </Stack>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" href={item.link} target="_blank" rel="noreferrer">
                    查看赛果
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
