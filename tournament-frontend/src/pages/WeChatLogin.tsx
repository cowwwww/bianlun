import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Chat as WeChatIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  isWeChatBrowser,
  isMobile,
  renderWeChatQRCode,
  loginWithWeChat,
} from '../services/wechatAuthService';

const WeChatLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInWeChat = isWeChatBrowser();
  const isMobileDevice = isMobile();

  useEffect(() => {
    // 如果是PC端且不在微信内，显示二维码
    if (!isMobileDevice && !isInWeChat) {
      // 加载微信JS-SDK
      loadWeChatSDK();
    }
  }, [isMobileDevice, isInWeChat]);

  const loadWeChatSDK = () => {
    // 动态加载微信JS-SDK
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.async = true;
    script.onload = () => {
      // SDK加载完成后渲染二维码
      try {
        renderWeChatQRCode('wechat-qr-container');
      } catch (err) {
        console.error('Failed to render WeChat QR code:', err);
        setError('加载微信登录二维码失败');
      }
    };
    script.onerror = () => {
      setError('加载微信登录SDK失败');
    };
    document.body.appendChild(script);
  };

  const handleWeChatLogin = () => {
    setLoading(true);
    setError(null);
    try {
      loginWithWeChat();
    } catch (err: any) {
      setError(err.message || '登录失败');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          微信登录
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* PC端 - 显示二维码 */}
        {!isMobileDevice && !isInWeChat && (
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              请使用微信扫描二维码登录
            </Typography>
            <Box
              id="wechat-qr-container"
              sx={{
                width: '100%',
                minHeight: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                mb: 2,
              }}
            >
              {!error && <CircularProgress />}
            </Box>
            <Typography variant="caption" color="text.secondary">
              扫码后在手机上确认登录
            </Typography>
          </Box>
        )}

        {/* 移动端 - 在微信内 */}
        {isMobileDevice && isInWeChat && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <WeChatIcon sx={{ fontSize: 64, color: '#07C160' }} />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              点击下方按钮授权登录
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleWeChatLogin}
              disabled={loading}
              sx={{
                bgcolor: '#07C160',
                '&:hover': { bgcolor: '#06AD56' },
                fontSize: 18,
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} /> : '微信授权登录'}
            </Button>
          </Box>
        )}

        {/* 移动端 - 不在微信内 */}
        {isMobileDevice && !isInWeChat && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <WeChatIcon sx={{ fontSize: 64, opacity: 0.5 }} />
            </Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              请在微信中打开此页面进行登录
            </Alert>
            <Typography variant="body2" color="text.secondary">
              您可以：
              <br />
              1. 复制链接在微信中打开
              <br />
              2. 使用其他登录方式
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              使用其他方式登录
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => navigate('/login')} size="small">
            返回普通登录
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default WeChatLogin;

