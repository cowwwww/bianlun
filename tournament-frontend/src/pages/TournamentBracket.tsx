import { Container, Typography, Paper } from '@mui/material';

const TournamentBracket = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          赛程表
        </Typography>
        <Typography color="text.secondary">
          赛程表功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default TournamentBracket;
