import { useState } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import pb from '../services/pocketbase';

interface WeChatLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const WeChatLogin: React.FC<WeChatLoginProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleWeChatLogin = async () => {
    setLoading(true);
    
    try {
      // Get WeChat OAuth2 provider data from PocketBase
      const authMethods = await pb.collection('users').listAuthMethods();
      
      // Find WeChat provider (you'll need to configure this in PocketBase Admin)
      const providers = (authMethods as any).authProviders || [];
      const wechatProvider = providers.find(
        (provider: any) => provider.name === 'wechat' || provider.name === 'WeChat'
      );
      
      if (!wechatProvider) {
        throw new Error('WeChat login not configured. Please set up OAuth2 in PocketBase Admin Dashboard.');
      }

      // Build the OAuth2 authorization URL
      const redirectUrl = `${window.location.origin}/auth/wechat/callback`;
      const authUrl = wechatProvider.authUrl + redirectUrl;
      
      // Store the provider data in localStorage for the callback
      localStorage.setItem('wechat_provider', JSON.stringify(wechatProvider));
      
      // Redirect to WeChat OAuth2 authorization page
      window.location.href = authUrl;
      
    } catch (error: any) {
      console.error('WeChat login error:', error);
      setLoading(false);
      if (onError) {
        onError(error.message || 'WeChat login failed');
      }
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        fullWidth
        onClick={handleWeChatLogin}
        disabled={loading}
        sx={{
          backgroundColor: '#09BB07',
          color: 'white',
          '&:hover': {
            backgroundColor: '#08A006',
          },
          py: 1.5,
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <>
            <img 
              src="https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon48_wx_button.png" 
              alt="WeChat" 
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Typography>微信登录</Typography>
          </>
        )}
      </Button>
    </Box>
  );
};

export default WeChatLogin;

