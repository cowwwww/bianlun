import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.getCurrentUser());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>请先登录...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
            {user.name?.[0] || user.wechatId?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {user.name || '用户'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            微信号：{user.wechatId || '-'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            账户信息
          </Typography>
          <Typography variant="body2">
            用户ID：{user.id || '-'}
          </Typography>
        </Box>

        <Button 
          variant="outlined" 
          fullWidth 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          退出登录
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;
