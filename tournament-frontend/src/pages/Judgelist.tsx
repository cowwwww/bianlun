import { Container, Typography, Paper } from '@mui/material';

const JudgeList = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          评委库
        </Typography>
        <Typography color="text.secondary">
          评委库功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default JudgeList;
