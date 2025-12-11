import { Container, Typography, Paper } from '@mui/material';

const RateJudgePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          评价评委
        </Typography>
        <Typography color="text.secondary">
          评价功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default RateJudgePage;
