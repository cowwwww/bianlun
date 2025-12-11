import { Container, Typography, Paper } from '@mui/material';

const TournamentOrganizer = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          赛事组织
        </Typography>
        <Typography color="text.secondary">
          赛事组织功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default TournamentOrganizer;
