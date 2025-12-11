import pb from './pocketbase';

// 微信登录配置
const WECHAT_CONFIG = {
  appId: import.meta.env.VITE_WECHAT_APPID || 'wx78427a667a2ca948',
  appSecret: import.meta.env.VITE_WECHAT_APPSECRET || '',
  redirectUri: import.meta.env.VITE_APP_URL || window.location.origin,
};

// 检测是否在微信浏览器中
export const isWeChatBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
};

// 检测是否为移动设备
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * PC端微信扫码登录
 * 使用微信开放平台网站应用
 */
export const loginWithWeChatQR = () => {
  const state = generateState();
  sessionStorage.setItem('wechat_login_state', state);

  const params = new URLSearchParams({
    appid: WECHAT_CONFIG.appId,
    redirect_uri: encodeURIComponent(`${WECHAT_CONFIG.redirectUri}/auth/wechat/callback`),
    response_type: 'code',
    scope: 'snsapi_login', // 网站应用扫码登录
    state: state,
  });

  // 微信开放平台扫码登录页面
  window.location.href = `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
};

/**
 * 手机端微信内网页授权登录
 * 使用微信公众号网页授权
 */
export const loginWithWeChatMobile = () => {
  const state = generateState();
  sessionStorage.setItem('wechat_login_state', state);

  const params = new URLSearchParams({
    appid: WECHAT_CONFIG.appId,
    redirect_uri: encodeURIComponent(`${WECHAT_CONFIG.redirectUri}/auth/wechat/callback`),
    response_type: 'code',
    scope: 'snsapi_userinfo', // 公众号网页授权，获取用户信息
    state: state,
  });

  // 微信公众号网页授权
  window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;
};

/**
 * 统一微信登录入口
 * 自动判断环境（PC扫码 or 手机网页授权）
 */
export const loginWithWeChat = () => {
  if (isWeChatBrowser()) {
    // 在微信浏览器内，使用网页授权
    loginWithWeChatMobile();
  } else if (isMobile()) {
    // 移动端但不在微信内，提示用户在微信中打开
    alert('请在微信中打开此页面进行登录');
  } else {
    // PC端，使用扫码登录
    loginWithWeChatQR();
  }
};

/**
 * 处理微信回调
 * 获取access_token和用户信息，然后登录或注册
 */
export const handleWeChatCallback = async (code: string, state: string) => {
  // 验证 state 防止 CSRF 攻击
  const savedState = sessionStorage.getItem('wechat_login_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter');
  }
  sessionStorage.removeItem('wechat_login_state');

  try {
    // 通过PocketBase API处理微信登录
    // 这需要在PocketBase中创建自定义路由来处理微信OAuth
    const response = await fetch(`${pb.baseUrl}/api/auth/wechat/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('WeChat login failed');
    }

    const data = await response.json();
    
    // 使用返回的token登录PocketBase
    pb.authStore.save(data.token, data.record);
    
    return data.record;
  } catch (error) {
    console.error('WeChat callback error:', error);
    throw error;
  }
};

/**
 * 生成随机state用于CSRF防护
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 从URL获取微信回调参数
 */
export const getWeChatCallbackParams = (): { code: string; state: string } | null => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (code && state) {
    return { code, state };
  }

  return null;
};

/**
 * 微信扫码登录组件（用于嵌入页面）
 * 使用微信JS-SDK在页面中显示二维码
 */
export const renderWeChatQRCode = (containerId: string) => {
  const state = generateState();
  sessionStorage.setItem('wechat_login_state', state);

  const redirectUri = encodeURIComponent(`${WECHAT_CONFIG.redirectUri}/auth/wechat/callback`);
  
  // 使用微信提供的iframe方式显示二维码
  const obj = new (window as any).WxLogin({
    self_redirect: false,
    id: containerId,
    appid: WECHAT_CONFIG.appId,
    scope: 'snsapi_login',
    redirect_uri: redirectUri,
    state: state,
    style: 'black', // 二维码样式: black 或 white
    href: '', // 可选：自定义样式表链接
  });

  return obj;
};

