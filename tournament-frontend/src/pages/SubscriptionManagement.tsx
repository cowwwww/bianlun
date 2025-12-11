import { Container, Typography, Paper } from '@mui/material';

const SubscriptionManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          订阅管理
        </Typography>
        <Typography color="text.secondary">
          订阅管理功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default SubscriptionManagement;
