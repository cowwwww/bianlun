import { Container, Typography, Paper } from '@mui/material';

const Resources = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          辩论资源
        </Typography>
        <Typography color="text.secondary">
          资源库功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default Resources;
