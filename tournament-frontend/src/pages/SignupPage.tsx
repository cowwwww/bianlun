import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!name?.trim()) {
      setError('请输入真实姓名');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('请设置一个密码');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    try {
      // Create user with name and password
      // Using name as both identifier and display name
      await auth.signUp(name.trim(), password, name.trim());

      console.log('User signed up successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error signing up:', error);
      const errorMessage = (error as Error).message || '';
      
      // Handle specific error messages
      if (errorMessage.includes('已被注册') || errorMessage.includes('already')) {
        setError('该姓名已被注册，请直接登录或使用其他姓名');
      } else if (errorMessage.includes('密码') || errorMessage.includes('password')) {
        setError('密码不符合要求，请使用至少6位字符');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('网络连接失败，请检查网络后重试');
      } else {
        setError(errorMessage || '注册失败，请稍后重试');
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
        <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          注册账号
        </Typography>

        <Card sx={{ width: '100%' }}>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignup} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="真实姓名"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的真实姓名"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="设置一个密码"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位字符"
                helperText="密码至少需要6个字符"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '注册账号'}
              </Button>
            </Box>

            <Typography variant="body2" align="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                {"已有账号？立即登录"}
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignupPage; 