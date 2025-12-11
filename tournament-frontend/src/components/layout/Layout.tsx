import type { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate/*, useLocation*/ } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../assets/logo.png';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [resourceJudgeAnchorEl, setResourceJudgeAnchorEl] = useState<null | HTMLElement>(null);
  const [timerAnchorEl, setTimerAnchorEl] = useState<null | HTMLElement>(null);

  const handleResourceJudgeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setResourceJudgeAnchorEl(event.currentTarget);
  };

  const handleResourceJudgeMenuClose = () => {
    setResourceJudgeAnchorEl(null);
  };

  const handleTimerMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleTimerMenuClose = () => {
    setTimerAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar always rendered */}
      <AppBar position="static" sx={{ bgcolor: '#ffffff', color: '#000000', boxShadow: 'none' }}>
        <Toolbar>
        <img src={logo} alt="Logo" style={{ width: 30, height: 30 }} />
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            云赛

          </Typography>

          <Button color="inherit" onClick={() => { navigate('/'); }} sx={{ color: 'inherit' }}>
            赛事中心
          </Button>

          {/* Resources/Judge Dropdown */}
          <Button color="inherit" onClick={handleResourceJudgeMenuOpen} sx={{ color: 'inherit' }}>
            资源中心
          </Button>
          <Menu
            anchorEl={resourceJudgeAnchorEl}
            open={Boolean(resourceJudgeAnchorEl)}
            onClose={handleResourceJudgeMenuClose}
          >
            <MenuItem onClick={() => { navigate('/resources'); handleResourceJudgeMenuClose(); }}>
              辩论资源
            </MenuItem>
            <MenuItem onClick={() => { navigate('/judge'); handleResourceJudgeMenuClose(); }}>
              评委库
            </MenuItem>
            <MenuItem onClick={() => { navigate('/topics'); handleResourceJudgeMenuClose(); }}>
              辩题库
            </MenuItem>
          </Menu>

          {/* Timers Dropdown */}
          <Button color="inherit" onClick={handleTimerMenuOpen} sx={{ color: 'inherit' }}>
            计时器
          </Button>
          <Menu
            anchorEl={timerAnchorEl}
            open={Boolean(timerAnchorEl)}
            onClose={handleTimerMenuClose}
          >
            <MenuItem onClick={() => { navigate('/projects'); handleTimerMenuClose(); }}>
              计时器中心
            </MenuItem>
            <MenuItem onClick={() => { navigate('/timer-introduction'); handleTimerMenuClose(); }}>
              计时器介绍
            </MenuItem>

          </Menu>
        
          {/* Profile Link */}
        <Button color="inherit" component={RouterLink} to="/profile" sx={{ color: 'inherit' }}>
        个人中心
        </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Box>

      {/* Footer always rendered */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[200],
        }}
      >
        <Box maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} 云赛. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 