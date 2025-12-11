import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTournaments, type Tournament } from '../services/tournamentService';

const Home = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
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
    </Container>
  );
};

export default Home;
