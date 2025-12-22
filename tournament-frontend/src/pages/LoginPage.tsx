import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import { loginWithWeChat, renderWeChatQRCode, isWeChatBrowser, isMobile } from '../services/wechatAuthService';

const LoginPage = () => {
  const [wechatId, setWechatId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize WeChat QR code on mount (for desktop users)
  useEffect(() => {
    if (!isWeChatBrowser() && !isMobile()) {
      // Only render QR code for desktop users
      setTimeout(() => {
        try {
          renderWeChatQRCode('wechat-qr-container');
        } catch (error) {
          console.error('Failed to render WeChat QR code:', error);
        }
      }, 1000);
    }
  }, []);

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

  const handleWeChatLogin = async () => {
    setWechatLoading(true);
    try {
      await loginWithWeChat();
    } catch (error) {
      console.error('WeChat login error:', error);
      setError('微信登录失败，请重试');
      setWechatLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          登录到辩论赛管理系统
        </Typography>

        <Box sx={{ width: '100%', maxWidth: 800 }}>
          {/* WeChat Login Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                微信快速登录
              </Typography>

              {isWeChatBrowser() ? (
                // Mobile WeChat browser - show login button
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleWeChatLogin}
                    disabled={wechatLoading}
                    startIcon={wechatLoading ? <CircularProgress size={20} /> : null}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {wechatLoading ? '登录中...' : '微信登录'}
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    点击使用微信账号登录
                  </Typography>
                </Box>
              ) : isMobile() ? (
                // Mobile but not WeChat browser
                <Alert severity="info" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2">
                    请在微信中打开此页面，或使用账号密码登录
                  </Typography>
                </Alert>
              ) : (
                // Desktop - show QR code
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    请使用微信扫码登录
                  </Typography>
                  <Box
                    id="wechat-qr-container"
                    sx={{
                      display: 'inline-block',
                      border: '1px solid #ddd',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: '#f9f9f9'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    打开微信 → 发现 → 扫一扫
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
              或
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          {/* Traditional Login Form */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                账号密码登录
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate>
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
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
                </Button>
              </Box>

              <Typography variant="body2" align="center">
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  {"还没有账号？立即注册"}
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage; 