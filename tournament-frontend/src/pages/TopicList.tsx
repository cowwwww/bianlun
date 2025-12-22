import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Topic as TopicIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTopics, type Topic } from '../services/topicService';
import { useSubscription } from '../hooks/useSubscription';
import type { SelectChangeEvent } from '@mui/material/Select';

const TopicList = () => {
  const navigate = useNavigate();
  const { access } = useSubscription();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [hasExplanation, setHasExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 话题分类
  const categories = [
    { value: '', label: '全部分类', icon: '📋' },
    { value: 'love', label: '爱情关系', icon: '💕' },
    { value: 'technology', label: '科技创新', icon: '🔬' },
    { value: 'politics', label: '政治社会', icon: '🏛️' },
    { value: 'education', label: '教育学习', icon: '📚' },
    { value: 'economy', label: '经济商业', icon: '💼' },
    { value: 'environment', label: '环境生态', icon: '🌱' },
    { value: 'culture', label: '文化艺术', icon: '🎨' },
    { value: 'ethics', label: '道德伦理', icon: '⚖️' },
    { value: 'health', label: '健康医疗', icon: '🏥' },
    { value: 'sports', label: '体育竞技', icon: '🏃‍♂️' },
  ];

  // 语言类型
  const languages = [
    { value: '', label: '全部语言', icon: '🌍' },
    { value: 'chinese', label: '中文', icon: '🇨🇳' },
    { value: 'english', label: 'English', icon: '🇺🇸' },
    { value: 'bilingual', label: '双语', icon: '🌐' },
  ];

  // 赛事类型
  const tournaments = [
    { value: '', label: '全部赛事', icon: '🏆' },
    { value: 'ada-debate', label: 'ADA辩论赛', icon: '🎭' },
    { value: 'xinguobian', label: '新国辩', icon: '🎯' },
    { value: 'huayu-worldcup', label: '华语辩论世界杯', icon: '🏆' },
    { value: 'parliamentary', label: '议会制辩论', icon: '🏛️' },
    { value: 'bp-style', label: 'BP赛制', icon: '🎪' },
    { value: 'asian-style', label: '亚洲赛制', icon: '🌏' },
    { value: 'worlds', label: 'Worlds', icon: '🌍' },
    { value: 'apda', label: 'APDA', icon: '🎓' },
    { value: 'custom', label: '自定义', icon: '⚙️' },
  ];

  // 题解状态
  const explanationOptions = [
    { value: '', label: '全部' },
    { value: 'has', label: '有题解' },
    { value: 'no', label: '无题解' },
  ];

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const loadedTopics = await getTopics();
      setTopics(loadedTopics);
    } catch (err) {
      console.error("Error loading topics: ", err);
      setError('请先登录');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTopic(null);
  };

  const handleSubscriptionUpgrade = () => {
    navigate('/profile');
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleTournamentChange = (event: SelectChangeEvent<string>) => {
    setSelectedTournament(event.target.value);
  };

  const handleExplanationChange = (event: SelectChangeEvent<string>) => {
    setHasExplanation(event.target.value);
  };

  const filteredTopics = topics.filter(topic => {
    if (!topic) return false;
    
    const matchesSearch = topic.text?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || 
                           topic.area?.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesLanguage = selectedLanguage === '' || 
                           topic.language?.toLowerCase() === selectedLanguage.toLowerCase();
    
    const matchesTournament = selectedTournament === '' || 
                             topic.tournament?.toLowerCase() === selectedTournament.toLowerCase();

    const matchesExplanation = hasExplanation === '' ||
                              (hasExplanation === 'has' && topic.explanation?.trim()) ||
                              (hasExplanation === 'no' && !topic.explanation?.trim());
    
    return matchesSearch && matchesCategory && matchesLanguage && matchesTournament && matchesExplanation;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography align="center">加载中...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: '#000000',
          color: '#ffffff',
          py: 8,
          mb: 6,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ color: '#ffffff' }}>
          辩题库
        </Typography>
        <Typography variant="h5" align="center" paragraph sx={{ mb: 4, color: '#ffffff' }}>
          探索热门辩题，激发思辨火花
        </Typography>
        
        {/* Search Bar */}
        <Box 
          component="form" 
          sx={{ 
            width: '100%', 
            maxWidth: 600, 
            mb: 4,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜索辩题内容..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#1976d2' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'white',
                borderRadius: '25px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '12px 14px',
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            sx={{ 
              bgcolor: '#ff9800',
              color: '#ffffff',
              '&:hover': { bgcolor: '#f57c00' }
            }}
            size="large"
            onClick={() => navigate('/add-topic')}
            startIcon={<AddIcon />}
          >
            添加辩题
          </Button>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Filter Bar */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 4,
          bgcolor: '#f5f5f5'
        }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, alignItems: 'center' }}>
            <FormControl size="small">
              <InputLabel>话题分类</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="话题分类"
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>语言类型</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                label="语言类型"
              >
                {languages.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>赛事类型</InputLabel>
              <Select
                value={selectedTournament}
                onChange={handleTournamentChange}
                label="赛事类型"
              >
                {tournaments.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>题解状态</InputLabel>
              <Select
                value={hasExplanation}
                onChange={handleExplanationChange}
                label="题解状态"
              >
                {explanationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Topics Grid */}
        {loading ? (
          <Typography align="center">加载中...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : filteredTopics.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <TopicIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              没有找到匹配的辩题
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              尝试调整搜索条件或添加新的辩题
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/add-topic')}>
              添加辩题
            </Button>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: 40,
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={languages.find(l => l.value === topic.language)?.label || '未指定语言'}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        height: '24px'
                      }}
                    />
                  </Box>
                  <Chip
                    label={tournaments.find(t => t.value === topic.tournament)?.label || '未指定赛事'}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', height: '24px' }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2, bgcolor: '#ffffff' }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1.5,
                      color: '#000000',
                      lineHeight: 1.3
                    }}
                  >
                    {topic.text}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        label={categories.find(c => c.value === topic.area)?.label || '未分类'}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0,0,0,0.05)', 
                          color: '#000000',
                          height: '24px'
                        }}
                      />
                      {topic.explanation && topic.explanation.trim() && (
                        <Chip
                          label="有题解"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76,175,80,0.1)',
                            color: '#4caf50',
                            height: '24px'
                          }}
                        />
                      )}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewTopic(topic)}
                    sx={{
                      py: 1,
                      fontWeight: 'bold',
                      bgcolor: '#000000',
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: '#333333'
                      }
                    }}
                  >
                    查看详情
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* Topic Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedTopic && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon />
                辩题详情
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {selectedTopic.text}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={categories.find(c => c.value === selectedTopic.area)?.label || '未分类'}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={languages.find(l => l.value === selectedTopic.language)?.label || '未指定语言'}
                    size="small"
                    color="secondary"
                  />
                  <Chip
                    label={tournaments.find(t => t.value === selectedTopic.tournament)?.label || '未指定赛事'}
                    size="small"
                    color="info"
                  />
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Solutions Section with Subscription Check */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                题解内容
              </Typography>
              
              {selectedTopic.explanation && selectedTopic.explanation.trim() ? (
                <>
                  {access.canAccessSolutions ? (
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedTopic.explanation}
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper sx={{ p: 3, bgcolor: '#fff3e0', borderRadius: 2, textAlign: 'center' }}>
                      <LockIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        🔒 题解需要订阅会员
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        升级为月度会员或终身会员即可查看完整题解内容
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={handleSubscriptionUpgrade}
                        sx={{ fontWeight: 'bold' }}
                      >
                        立即升级
                      </Button>
                    </Paper>
                  )}
                </>
              ) : (
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    该辩题暂无题解内容
                  </Typography>
                </Paper>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                关闭
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TopicList;
