import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import pb from '../services/pocketbase';

const WeChatCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('处理微信登录...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get the code and state from URL parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code) {
        throw new Error('未收到微信授权码');
      }

      setStatus('验证微信授权...');

      // Get the stored provider data
      const providerData = localStorage.getItem('wechat_provider');
      if (!providerData) {
        throw new Error('登录会话已过期');
      }

      const provider = JSON.parse(providerData);

      setStatus('完成登录...');

      // Exchange the code for user authentication
      const authData = await pb.collection('users').authWithOAuth2Code(
        provider.name,
        code,
        provider.codeVerifier,
        `${window.location.origin}/auth/wechat/callback`,
        // Optional: create data for new users
        {
          emailVisibility: false,
        }
      );

      // Clean up
      localStorage.removeItem('wechat_provider');

      setStatus('登录成功！');

      // Redirect to home or profile page
      setTimeout(() => {
        navigate('/profile');
      }, 1000);

    } catch (error: any) {
      console.error('WeChat OAuth callback error:', error);
      setError(error.message || '微信登录失败，请重试');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        ) : (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              {status}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请稍候...
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default WeChatCallback;
