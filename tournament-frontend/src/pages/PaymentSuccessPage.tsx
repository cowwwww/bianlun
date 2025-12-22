import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          支付成功
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          感谢您的支持！如有疑问请联系管理员确认订单。
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button variant="contained" onClick={() => navigate('/resources')}>
            去资源库
          </Button>
          <Button variant="outlined" onClick={() => navigate('/profile')}>
            查看账户
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentSuccessPage;



