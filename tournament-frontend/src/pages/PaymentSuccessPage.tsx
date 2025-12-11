import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Payment success logic would go here
    // For now, this is a placeholder
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          支付成功！
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          感谢您的购买，您的会员已激活。
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/profile')}
        >
          返回个人中心
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;
