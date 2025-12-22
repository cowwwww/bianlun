import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Fab,
  Badge,
  CircularProgress,
  CardMedia,
  type ChipProps,
} from '@mui/material';
import {
  EmojiEvents as TournamentIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  MonetizationOn as MoneyIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getTournaments,
  createTournament,
  type Tournament,
} from '../services/tournamentService';
import { getFinishedTournaments, type FinishedTournament } from '../services/finishedTournaments';

interface Subscription {
  plan: 'basic' | 'professional' | 'enterprise';
  aiUsageLeft: number;
  maxAiUsage: number;
  expiresAt: Date;
}

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<
    Array<
      Tournament & {
        participants?: number;
        maxParticipants?: number;
        registrationFee?: number;
        prizeMoney?: number;
        sport?: string;
      }
    >
  >([]);
  const [finishedTournaments, setFinishedTournaments] = useState<FinishedTournament[]>([]);
  const subscription: Subscription = {
    plan: 'professional',
    aiUsageLeft: 85,
    maxAiUsage: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newTournament, setNewTournament] = useState({
    name: '',
    sport: 'debate',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    maxParticipants: 64,
    playersPerTeam: 4,
    registrationFee: 0,
    prizeMoney: 0,
    category: 'Academic',
    description: '',
    image: '',
    registrationLink: '',
    contact: '',
    organizer: '主办方',
    participationRequirements: '',
    teamsize: '',
    ruleBookLink: '',
    award: '',
  });

  const normalizeTournament = (record: Tournament) => ({
    ...record,
    sport: record.type || 'debate',
    participants: record.totalTeams ?? 0,
    maxParticipants: record.totalTeams ?? 0,
    registrationFee: record.price ?? 0,
    prizeMoney: record.award ? Number(record.award) || 0 : 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await getTournaments();
      setTournaments(records.map(normalizeTournament));
      setFinishedTournaments(getFinishedTournaments());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('加载赛事数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateTournament = async () => {
    try {
      if (!newTournament.name.trim() || !newTournament.startDate || !newTournament.location.trim()) {
        setError('请填写赛事名称、地点和开始日期');
        return;
      }

      setError(null);
      setLoading(true);

      await createTournament({
        name: newTournament.name.trim(),
        title: newTournament.name.trim(),
        description: newTournament.description || '',
        startDate: newTournament.startDate,
        endDate: newTournament.endDate || newTournament.startDate,
        registrationDeadline: newTournament.registrationDeadline || newTournament.startDate,
        date: newTournament.startDate,
        location: newTournament.location,
        type: newTournament.sport === 'debate' ? 'Debate' : newTournament.sport || 'General',
        status: 'registration',
        price: Number(newTournament.registrationFee) || 0,
        teamsize: newTournament.teamsize || '',
        organizer: newTournament.organizer || '主办方',
        contact: newTournament.contact || '',
        category: newTournament.category || '',
        image: newTournament.image || '',
        totalTeams: Number(newTournament.maxParticipants) || 0,
        playersPerTeam: Number(newTournament.playersPerTeam) || 0,
        participationRequirements: newTournament.participationRequirements || '',
        registrationLink: newTournament.registrationLink || '',
        ruleBookLink: newTournament.ruleBookLink || '',
        award: newTournament.prizeMoney ? `¥${newTournament.prizeMoney}` : newTournament.award || '',
        createdBy: 'organizer-dashboard',
      });
      
      setCreateDialogOpen(false);
      setNewTournament({
        name: '',
        sport: 'debate',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        location: '',
        maxParticipants: 64,
        playersPerTeam: 4,
        registrationFee: 0,
        prizeMoney: 0,
        category: 'Academic',
        description: '',
        image: '',
        registrationLink: '',
        contact: '',
        organizer: '主办方',
        participationRequirements: '',
        teamsize: '',
        ruleBookLink: '',
        award: '',
      });
      
      loadDashboardData();
    } catch (error) {
      console.error('Error creating tournament:', error);
      setError((error as Error).message || '创建赛事失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'draft': return 'default';
      case 'registration': return 'info';
      case 'ongoing': return 'warning';
      case 'upcoming': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'registration': return '报名中';
      case 'ongoing': return '进行中';
      case 'upcoming': return '即将开始';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'badminton': return '🏸';
      case 'tennis': return '🎾';
      case 'debate': return '💭';
      case 'basketball': return '🏀';
      case 'football': return '⚽';
      default: return '🏆';
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '待定';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  const stats = [
    {
      title: '活跃赛事',
      value: tournaments.filter(t => t.status === 'ongoing' || t.status === 'registration').length,
      icon: <TournamentIcon />,
      color: '#667eea',
      change: '+12%'
    },
    {
      title: '名额总计',
      value: tournaments.reduce((sum, t) => sum + (t.maxParticipants ?? 0), 0),
      icon: <PeopleIcon />,
      color: '#f093fb',
      change: '+28%'
    },
    {
      title: '报名费基准',
      value: `¥${tournaments.reduce((sum, t) => sum + (t.registrationFee ?? t.price ?? 0), 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: '#ffeaa7',
      change: '+15%'
    },
    {
      title: 'AI使用次数',
      value: `${subscription.maxAiUsage - subscription.aiUsageLeft}/${subscription.maxAiUsage}`,
      icon: <StarIcon />,
      color: '#a29bfe',
      change: `${subscription.aiUsageLeft} 剩余`
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            正在加载赛事数据...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              🏆 主办方管理中心
            </Typography>
            <Typography variant="h6" color="text.secondary">
              专业赛事管理，一站式解决方案
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Badge badgeContent={3} color="error">
              <IconButton>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              创建赛事
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Subscription Status */}
        <Paper
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {subscription.plan === 'professional' ? '专业版' : '企业版'} 订阅
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                到期时间：{subscription.expiresAt.toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {subscription.aiUsageLeft}
              </Typography>
              <Typography variant="body2">AI使用次数剩余</Typography>
              <LinearProgress
                variant="determinate"
                value={(subscription.aiUsageLeft / subscription.maxAiUsage) * 100}
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}40 100%)`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.change.includes('+') ? 'success' : 'default'}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              🚀 快速操作
            </Typography>
            <Grid container spacing={2}>
              {[
                { icon: <TournamentIcon />, title: '创建赛事', desc: '新建比赛项目', action: () => setCreateDialogOpen(true) },
                { icon: <GroupIcon />, title: '管理参赛者', desc: '查看报名信息', action: () => navigate('/organizer/participants') },
                { icon: <ScheduleIcon />, title: '赛程安排', desc: '设置比赛时间', action: () => navigate('/organizer/schedule') },
                { icon: <AnalyticsIcon />, title: '数据分析', desc: '查看报告', action: () => navigate('/organizer/analytics') },
                { icon: <PaymentIcon />, title: '财务管理', desc: '收支统计', action: () => navigate('/organizer/finance') },
                { icon: <SettingsIcon />, title: '系统设置', desc: '个性化配置', action: () => navigate('/organizer/settings') },
              ].map((item, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={item.action}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              📊 近期活动
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { time: '2小时前', desc: '新增报名：张三报名羽毛球赛', type: 'registration' },
                { time: '4小时前', desc: '比赛结果：A组半决赛完成', type: 'result' },
                { time: '6小时前', desc: '系统通知：AI分析报告已生成', type: 'system' },
                { time: '1天前', desc: '付款确认：赛事报名费收款成功', type: 'payment' },
              ].map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: activity.type === 'registration' ? 'success.main' :
                              activity.type === 'result' ? 'warning.main' :
                              activity.type === 'system' ? 'info.main' : 'primary.main',
                    }}
                  >
                    {activity.type === 'registration' ? <GroupIcon sx={{ fontSize: 16 }} /> :
                     activity.type === 'result' ? <CheckIcon sx={{ fontSize: 16 }} /> :
                     activity.type === 'system' ? <AnalyticsIcon sx={{ fontSize: 16 }} /> :
                     <PaymentIcon sx={{ fontSize: 16 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {activity.desc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tournaments List */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🏅 我的赛事
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/organizer/tournaments')}>
            查看全部
          </Button>
        </Box>

        <Grid container spacing={3}>
          {tournaments.map((tournament) => {
            const participants = tournament.participants ?? 0;
            const maxParticipants = tournament.maxParticipants ?? tournament.totalTeams ?? 0;
            const progressValue = maxParticipants > 0 ? (participants / maxParticipants) * 100 : 0;
            const sportIcon = getSportIcon(tournament.sport || tournament.type || 'debate');

            return (
              <Grid item xs={12} md={6} lg={4} key={tournament.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  {tournament.image && (
                    <CardMedia component="img" height="140" image={tournament.image} alt={tournament.name} />
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4">
                          {sportIcon}
                        </Typography>
                        <Chip
                          label={getStatusText(tournament.status)}
                          color={getStatusColor(tournament.status)}
                          size="small"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {tournament.name || tournament.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📍 {tournament.location || '未填写地点'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">
                        报名进度
                      </Typography>
                      <Typography variant="body2">
                        {participants}/{maxParticipants || '∞'}
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={progressValue}
                      sx={{ mb: 2, borderRadius: 1 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(tournament.startDate)}
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<LaunchIcon />}
                        onClick={() => navigate(`/organizer/tournament/${tournament.id}`)}
                      >
                        管理
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Finished tournaments from ArcX */}
      <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            ✅ 往期赛事赛果
          </Typography>
          <Button
            href="https://cowwwww.github.io/"
            target="_blank"
            rel="noreferrer"
            size="small"
          >
            查看ArcX站点
          </Button>
        </Box>

        <Grid container spacing={3}>
          {finishedTournaments.map((item) => (
            <Grid item xs={12} md={6} lg={3} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.image && <CardMedia component="img" height="140" image={item.image} alt={item.title} />}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip label="已完成" size="small" color="success" sx={{ mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Button href={item.link} target="_blank" rel="noreferrer" size="small">
                    查看赛果
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Create Tournament Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>🏆 创建新赛事</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="赛事名称"
                value={newTournament.name}
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="赛事简介"
                value={newTournament.description}
                onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="赛事类型"
                value={newTournament.sport}
                onChange={(e) => setNewTournament({...newTournament, sport: e.target.value})}
                SelectProps={{ native: true }}
              >
                <option value="debate">辩论</option>
                <option value="badminton">羽毛球</option>
                <option value="tennis">网球</option>
                <option value="basketball">篮球</option>
                <option value="football">足球</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="比赛地点"
                value={newTournament.location}
                onChange={(e) => setNewTournament({...newTournament, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="开始日期"
                value={newTournament.startDate}
                onChange={(e) => setNewTournament({...newTournament, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="结束日期"
                value={newTournament.endDate}
                onChange={(e) => setNewTournament({...newTournament, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="报名截止"
                value={newTournament.registrationDeadline}
                onChange={(e) => setNewTournament({...newTournament, registrationDeadline: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="最大参赛人数 / 队伍数"
                value={newTournament.maxParticipants}
                onChange={(e) => setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="报名费（元）"
                value={newTournament.registrationFee}
                onChange={(e) => setNewTournament({...newTournament, registrationFee: parseFloat(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="奖金池（元）"
                value={newTournament.prizeMoney}
                onChange={(e) => setNewTournament({...newTournament, prizeMoney: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="赛事类别标签"
                value={newTournament.category}
                onChange={(e) => setNewTournament({...newTournament, category: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="报名链接"
                value={newTournament.registrationLink}
                onChange={(e) => setNewTournament({...newTournament, registrationLink: e.target.value})}
                placeholder="https://..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="封面图片链接"
                value={newTournament.image}
                onChange={(e) => setNewTournament({...newTournament, image: e.target.value})}
                placeholder="https://example.com/cover.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTournament}
            disabled={!newTournament.name || !newTournament.location}
          >
            创建赛事
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>编辑赛事</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>查看统计</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>导出数据</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>删除赛事</MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default OrganizerDashboard; 