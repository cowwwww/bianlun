import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';

// WeChat ID to Email mapping for existing users
const wechatToEmailMapping: { [key: string]: string } = {
  'cqhcqh09': 'caoqianhui09@gmail.com',
  'laocao0931': 'qcao0532@gmail.com',
};

const SignupPage = () => {
  const [name, setName] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generate email from WeChat ID
  const generateEmailFromWechatId = (wechatId: string): string => {
    // Check if WeChat ID already has a mapped email
    const existingEmail = wechatToEmailMapping[wechatId.toLowerCase()];
    if (existingEmail) {
      return existingEmail;
    }
    
    // Generate new email format: wechatid@tournament.app
    return `${wechatId.toLowerCase()}@tournament.app`;
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!name?.trim() || !wechatId?.trim() || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('密码不匹配');
      setLoading(false);
      return;
    }

    // Validate WeChat ID format (basic validation)
    const wechatIdRegex = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
    if (!wechatIdRegex.test(wechatId)) {
      setError('微信号格式不正确（6-20位，字母开头，可包含字母、数字、下划线、减号）');
      setLoading(false);
      return;
    }

    try {
      // Generate email from WeChat ID
      const email = generateEmailFromWechatId(wechatId.trim());
      
      // Create PocketBase Auth user
      await auth.signUp(email, password, name.trim());

      console.log('User signed up successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error signing up:', error);
      const errorMessage = error.message || '';
      
      // Handle specific error messages
      if (errorMessage.includes('已被注册') || errorMessage.includes('already')) {
        setError('该微信号已被注册，请直接登录或使用其他微信号');
      } else if (errorMessage.includes('格式无效') || errorMessage.includes('invalid')) {
        setError('微信号格式无效，请检查后重试');
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
        <Typography component="h1" variant="h5">
          注册账号
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2, mb: 3 }}>
          使用微信号创建您的账号
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSignup} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="姓名 *"
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
            id="wechatId"
            label="微信号 *"
            name="wechatId"
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
            placeholder="请输入您的微信号"
            helperText="微信号将作为您的登录账号"
          />
          <TextField
            margin="normal"
            fullWidth
            id="phone"
            label="手机号码（可选）"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入您的手机号码"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码 *"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少6位字符"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirm-password"
            label="确认密码 *"
            type="password"
            id="confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '注册账号'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link to="/login">
            {"已有账号？立即登录"}
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignupPage; 