import { Container, Typography, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

const JudgeDetail = () => {
  const { id } = useParams();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          评委详情 {id}
        </Typography>
        <Typography color="text.secondary">
          评委详情功能正在开发中...
        </Typography>
      </Paper>
    </Container>
  );
};

export default JudgeDetail;
