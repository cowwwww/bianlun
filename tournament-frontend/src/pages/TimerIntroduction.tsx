import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  Chip,
  Alert,
} from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon,
  Fullscreen as FullscreenIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TimerIntroduction: React.FC = () => {
  const navigate = useNavigate();

  const timerFeatures = [
    {
      title: '基础计时功能',
      icon: <TimerIcon color="primary" />,
      description: '支持正计时和倒计时，精确到毫秒级别',
      features: [
        '正计时：从0开始向上计时',
        '倒计时：设定时间向下计时',
        '毫秒级精度显示',
        '大屏幕数字显示',
      ]
    },
    {
      title: '控制操作',
      icon: <PlayIcon color="success" />,
      description: '完整的计时器控制功能',
      features: [
        '开始/暂停计时',
        '停止并重置计时器',
        '快速重启功能',
        '键盘快捷键支持',
      ]
    },
    {
      title: '提醒功能',
      icon: <NotificationIcon color="warning" />,
      description: '多种提醒方式确保不错过重要时间点',
      features: [
        '声音提醒（可自定义铃声）',
        '视觉提醒（屏幕闪烁）',
        '倒计时警告提醒',
        '时间到达通知',
      ]
    },
    {
      title: '自定义设置',
      icon: <SettingsIcon color="info" />,
      description: '丰富的个性化设置选项',
      features: [
        '自定义计时时长',
        '调整显示字体大小',
        '选择主题颜色',
        '设置提醒间隔',
      ]
    },
    {
      title: '全屏模式',
      icon: <FullscreenIcon color="secondary" />,
      description: '专业的全屏显示模式',
      features: [
        '全屏大字体显示',
        '适合投影仪使用',
        '清晰的时间显示',
        '简洁的界面设计',
      ]
    },
    {
      title: '保存与分享',
      icon: <SaveIcon color="primary" />,
      description: '保存计时记录和分享功能',
      features: [
        '保存计时记录',
        '导出计时数据',
        '分享计时器设置',
        '历史记录查看',
      ]
    },
  ];

  const usageSteps = [
    {
      step: 1,
      title: '创建计时器',
      description: '点击"创建新计时器"按钮，选择计时器类型（正计时或倒计时）',
      details: [
        '选择计时器类型：正计时适合记录用时，倒计时适合限时任务',
        '设置初始时间：对于倒计时，设置目标时间长度',
        '命名计时器：给计时器起一个有意义的名称',
        '选择提醒设置：配置声音和视觉提醒选项',
      ]
    },
    {
      step: 2,
      title: '配置设置',
      description: '根据需要调整计时器的各项设置',
      details: [
        '显示设置：调整字体大小、颜色主题',
        '提醒设置：选择提醒音效、设置提醒时间点',
        '快捷键设置：自定义键盘快捷键',
        '全屏设置：配置全屏模式的显示选项',
      ]
    },
    {
      step: 3,
      title: '开始计时',
      description: '点击播放按钮开始计时，使用各种控制功能',
      details: [
        '开始计时：点击播放按钮或按空格键',
        '暂停计时：点击暂停按钮或再次按空格键',
        '停止计时：点击停止按钮重置计时器',
        '全屏模式：点击全屏按钮进入专业显示模式',
      ]
    },
    {
      step: 4,
      title: '管理记录',
      description: '查看和管理计时记录，导出数据',
      details: [
        '查看历史：在历史记录页面查看所有计时记录',
        '导出数据：将计时数据导出为CSV或PDF格式',
        '分享设置：分享计时器配置给其他用户',
        '删除记录：清理不需要的历史记录',
      ]
    },
  ];

  const shortcuts = [
    { key: '空格键', action: '开始/暂停计时' },
    { key: 'R', action: '重置计时器' },
    { key: 'F', action: '切换全屏模式' },
    { key: 'S', action: '保存当前记录' },
    { key: 'Esc', action: '退出全屏模式' },
    { key: '↑/↓', action: '调整时间设置' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 48, mr: 2 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              计时器功能介绍
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
              专业的计时工具，支持多种计时模式和丰富的自定义功能
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
            startIcon={<PlayIcon />}
            onClick={() => navigate('/projects')}
          >
            开始使用计时器
          </Button>
        </Stack>
      </Paper>

      {/* Features Overview */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        🚀 功能特色
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {timerFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <List dense>
                  {feature.features.map((item, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Usage Guide */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        📖 使用指南
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {usageSteps.map((step, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={`步骤 ${step.step}`} 
                    color="primary" 
                    sx={{ mr: 2, fontWeight: 'bold' }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {step.title}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  {step.description}
                </Typography>
                <List dense>
                  {step.details.map((detail, idx) => (
                    <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <SpeedIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={detail} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Keyboard Shortcuts */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          ⌨️ 键盘快捷键
        </Typography>
        <Grid container spacing={2}>
          {shortcuts.map((shortcut, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Chip 
                  label={shortcut.key} 
                  variant="outlined" 
                  sx={{ mr: 2, fontFamily: 'monospace', fontWeight: 'bold' }}
                />
                <Typography variant="body2">{shortcut.action}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tips and Best Practices */}
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          💡 使用技巧
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                辩论比赛使用建议
              </Typography>
              <Typography variant="body2">
                建议使用倒计时模式，设置发言时间限制。开启声音提醒，在剩余30秒时提醒选手。
              </Typography>
            </Alert>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                演讲练习技巧
              </Typography>
              <Typography variant="body2">
                使用正计时记录练习时长，多次练习后可以更好地掌握演讲节奏。
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={6}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                全屏模式注意事项
              </Typography>
              <Typography variant="body2">
                在全屏模式下，确保音量适中，避免突然的提醒声音影响现场秩序。
              </Typography>
            </Alert>
            <Alert severity="error">
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                重要提醒
              </Typography>
              <Typography variant="body2">
                重要比赛建议提前测试计时器功能，确保所有设备正常工作。
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      {/* Call to Action */}
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          准备好开始使用了吗？
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          立即体验我们的专业计时器功能，让您的比赛和练习更加高效！
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
            startIcon={<TimerIcon />}
            onClick={() => navigate('/projects')}
          >
            创建计时器
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default TimerIntroduction; 