import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import { loginWithWeChat } from '../services/wechatAuthService';

// WeChat ID to Email mapping for existing users (legacy support)
const wechatToEmailMapping: { [key: string]: string } = {
  'cqhcqh09': 'caoqianhui09@gmail.com',
  'laocao0931': 'qcao0532@gmail.com',
};

const LoginPage = () => {
  const [wechatId, setWechatId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generate email from WeChat ID (same logic as signup)
  const generateEmailFromWechatId = (wechatId: string): string => {
    // Check if WeChat ID already has a mapped email (legacy users)
    const existingEmail = wechatToEmailMapping[wechatId.toLowerCase()];
    if (existingEmail) {
      return existingEmail;
    }
    
    // Generate new email format: wechatid@tournament.app
    return `${wechatId.toLowerCase()}@tournament.app`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate WeChat ID
      if (!wechatId?.trim()) {
        setError('请输入微信号');
        setLoading(false);
        return;
      }

      // Convert WeChat ID to email
      const email = generateEmailFromWechatId(wechatId.trim());

      await auth.signIn(email, password);
      navigate('/');
    } catch (error: any) {
      console.error('Error signing in:', error);
      const errorMessage = error.message || '';
      
      // Provide helpful error messages
      if (errorMessage.includes('Invalid login credentials')) {
        setError('微信号或密码错误，请检查后重试');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('网络连接失败，请检查网络后重试');
      } else {
        setError(errorMessage || '登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignup = async () => {
    setLoading(true);
    try {
      // Anonymous login not supported in PocketBase version
      setError('匿名登录暂不支持，请使用账号登录');
    } catch (error: any) {
      console.error('Error signing in anonymously:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Apple login not supported in PocketBase version
      setError('Apple登录暂不支持，请使用账号登录');
    } catch (error: any) {
      console.error('Error during Apple login:', error);
      setError(error.message || 'An unexpected error occurred during Apple login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          登录
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="wechatId"
            label="微信号 *"
            name="wechatId"
            autoComplete="username"
            autoFocus
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
            error={!!error}
            placeholder="请输入您的微信号"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码 *"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/auth/wechat/login')}
            disabled={loading}
            sx={{ 
              mb: 2, 
              bgcolor: '#07C160', 
              color: '#fff', 
              '&:hover': { bgcolor: '#06AD56' },
              fontSize: 16,
              py: 1.5
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '🎯 使用微信登录'}
          </Button>
          
          <Divider sx={{ my: 2 }}>或</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAnonymousSignup}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '游客访问'}
          </Button>
          {error && !loading && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Typography variant="body2" align="center">
            <Link to="/signup">
              {"还没有账号？立即注册"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 