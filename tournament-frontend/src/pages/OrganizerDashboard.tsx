import { Container, Typography, Paper } from '@mui/material';

const OrganizerDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          组织者控制台
        </Typography>
        <Typography color="text.secondary">
          控制台功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default OrganizerDashboard;
