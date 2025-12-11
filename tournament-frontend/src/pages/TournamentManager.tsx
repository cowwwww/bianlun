import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as TournamentIcon,
  PersonAdd as RegistrationIcon,
  AccountTree as BracketIcon,
  Schedule as ScheduleIcon,
  BarChart as AnalyticsIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  ExitToApp as LogoutIcon,
  Diamond as DiamondIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// 导入各个功能模块
import OrganizerDashboard from './OrganizerDashboard';
import RegistrationManagement from './RegistrationManagement';
import TournamentBracket from './TournamentBracket';
import SubscriptionManagement from './SubscriptionManagement';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  badge?: number;
  requiresPremium?: boolean;
}

const TournamentManager: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // 模拟用户信息
  const currentUser = {
    name: '张主办',
    email: 'organizer@example.com',
    subscription: 'professional',
    avatar: '',
  };

  // 导航菜单项
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: '管理面板',
      icon: <DashboardIcon />,
      component: OrganizerDashboard,
    },
    {
      id: 'registration',
      label: '报名管理',
      icon: <RegistrationIcon />,
      component: RegistrationManagement,
      badge: 3, // 待审核报名数
    },
    {
      id: 'bracket',
      label: '赛程签表',
      icon: <BracketIcon />,
      component: TournamentBracket,
    },
    {
      id: 'schedule',
      label: '赛程安排',
      icon: <ScheduleIcon />,
      component: () => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4">⏰ 赛程安排</Typography>
          <Typography>功能开发中...</Typography>
        </Container>
      ),
      requiresPremium: true,
    },
    {
      id: 'analytics',
      label: '数据分析',
      icon: <AnalyticsIcon />,
      component: () => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4">📊 数据分析</Typography>
          <Typography>功能开发中...</Typography>
        </Container>
      ),
      requiresPremium: true,
    },
    {
      id: 'payment',
      label: '支付管理',
      icon: <PaymentIcon />,
      component: () => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4">💰 支付管理</Typography>
          <Typography>功能开发中...</Typography>
        </Container>
      ),
    },
    {
      id: 'subscription',
      label: '订阅管理',
      icon: <DiamondIcon />,
      component: SubscriptionManagement,
    },
    {
      id: 'settings',
      label: '系统设置',
      icon: <SettingsIcon />,
      component: () => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4">⚙️ 系统设置</Typography>
          <Typography>功能开发中...</Typography>
        </Container>
      ),
    },
  ];

  const currentComponent = navigationItems.find(item => item.id === selectedMenuItem)?.component;
  const CurrentComponent = currentComponent || OrganizerDashboard;

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const getSubscriptionIcon = (subscription: string) => {
    switch (subscription) {
      case 'professional': return <DiamondIcon sx={{ fontSize: 16 }} />;
      case 'enterprise': return <StarIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'professional': return '#f093fb';
      case 'enterprise': return '#ffeaa7';
      default: return '#667eea';
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            云赛 Tournament Manager
          </Typography>

          {/* Subscription Badge */}
          <Chip
            icon={getSubscriptionIcon(currentUser.subscription)}
            label={currentUser.subscription === 'professional' ? '专业版' : '企业版'}
            sx={{
              bgcolor: getSubscriptionColor(currentUser.subscription),
              color: 'white',
              fontWeight: 'bold',
              mr: 2,
            }}
          />

          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
              {currentUser.name[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">{currentUser.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              个人设置
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              帮助中心
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          },
        }}
      >
        <Toolbar />
        
        {/* Upgrade Notice for Basic Users */}
        <Paper
          sx={{
            m: 2,
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea20 0%, #764ba240 100%)',
            border: '1px solid #667eea40',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🚀 解锁更多功能
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            升级到专业版获得AI智能助手和高级功能
          </Typography>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => setSelectedMenuItem('subscription')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
            }}
          >
            立即升级
          </Button>
        </Paper>

        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.id}
              button
              selected={selectedMenuItem === item.id}
              onClick={() => setSelectedMenuItem(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderLeft: '4px solid #667eea',
                  '& .MuiListItemIcon-root': {
                    color: '#667eea',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 'bold',
                    color: '#667eea',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.requiresPremium && currentUser.subscription === 'basic' ? (
                  <Badge
                    badgeContent="💎"
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: selectedMenuItem === item.id ? 'bold' : 'normal',
                }}
              />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" />
              )}
            </ListItem>
          ))}
        </List>

        {/* Footer */}
        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            云赛 Tournament Manager v2.0
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            © 2024 云赛科技
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          transition: 'margin-left 0.3s',
          marginLeft: drawerOpen ? 0 : '-280px',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <CurrentComponent />
      </Box>
    </Box>
  );
};

export default TournamentManager; 