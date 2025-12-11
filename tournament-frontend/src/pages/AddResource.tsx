import { Container, Typography, Paper } from '@mui/material';

const AddResource = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          添加资源
        </Typography>
        <Typography color="text.secondary">
          添加资源功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default AddResource;
