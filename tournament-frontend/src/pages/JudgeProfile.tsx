import { Container, Typography, Paper } from '@mui/material';

const JudgeProfile = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          评委资料
        </Typography>
        <Typography color="text.secondary">
          评委资料功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default JudgeProfile;
