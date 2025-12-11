import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';

const LoginPage = () => {
  const [wechatId, setWechatId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      // Login with WeChat ID directly
      await auth.signIn(wechatId.trim(), password);
      navigate('/profile');
    } catch (error) {
      console.error('Error signing in:', error);
      const errorMessage = (error as Error).message || '';
      
      // Provide helpful error messages in Chinese
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid login')) {
        setError('微信号或密码错误，请检查后重试');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('网络连接失败，请检查网络后重试');
      } else {
        setError('登录失败，请重试');
      }
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