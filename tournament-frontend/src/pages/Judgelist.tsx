import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress,
  Rating,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material/Select';
import pb from '../services/pocketbase';
import { auth } from '../services/authService';

interface Judge {
  id: string;
  fullName: string;
  experience?: string;
  expertise?: string[];
  price?: number;
  contactMessage?: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  totalReviews?: number;
  location?: string;
  languages?: string[];
  education?: string;
  certifications?: string[];
  bio?: string;
  avatar?: string;
  specialties?: string[];
  showContactInfo?: boolean;
  judgeTypes?: string[];
}

const JudgeList: React.FC = () => {
  const navigate = useNavigate();
  const [judges, setJudges] = useState<Judge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [contactVisibility, setContactVisibility] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [alreadyRatedMap, setAlreadyRatedMap] = useState<{ [judgeId: string]: boolean }>({});
  const [ratingValueMap, setRatingValueMap] = useState<{ [judgeId: string]: number | null }>({});
  const [reviewMap, setReviewMap] = useState<{ [judgeId: string]: string }>({});
  const [judgeRatings, setJudgeRatings] = useState<{ [judgeId: string]: { avgRating: number; totalReviews: number } }>({});

  // 专业领域选项
  const expertiseOptions = [
    { value: 'debate', label: '辩论赛', icon: '🏆'},
    { value: 'mun', label: '模拟联合国', icon: '🌍'},
    { value: 'negotiation', label: '谈判比赛', icon: '🤝' },
    { value: 'academic', label: '学术竞赛', icon: '📚'},
    { value: 'case-competition', label: '案例分析', icon: '📊'},
    { value: 'other', label: '其他', icon: '📋'},
  ];

  // 语言选项
  const languageOptions = [
    { value: '', label: '全部语言'},
    { value: 'chinese', label: '中文'},
    { value: 'english', label: 'English' },
    { value: 'bilingual', label: '双语' },
    { value: 'multilingual', label: '多语言' },
  ];

  // 价格范围选项
  const priceRanges = [
    { value: '', label: '全部价格' },
    { value: '0-30', label: '¥0 - ¥30' },
    { value: '30-40', label: '¥30 - ¥40' },
    { value: '40-50', label: '¥40 - ¥50' },
    { value: '50+', label: '¥50+' },
  ];

  // Contact visibility options
  const contactVisibilityOptions = [
    { value: '', label: '全部' },
    { value: 'public', label: '已公开' },
    { value: 'private', label: '未公开' },
  ];

  useEffect(() => {
    loadJudges();
    loadAllRatings();
  }, []);

  const loadAllRatings = async () => {
    try {
      const ratingsSnapshot = await pb.collection('ratings').getFullList({ sort: '-created' });
      const ratingsMap: { [judgeId: string]: { avgRating: number; totalReviews: number } } = {};
      const ratingsByJudge: { [judgeId: string]: number[] } = {};
      
      ratingsSnapshot.forEach((doc) => {
        const judgeId = doc.judgeId;
        const rating = doc.rating;
        if (!ratingsByJudge[judgeId]) {
          ratingsByJudge[judgeId] = [];
        }
        ratingsByJudge[judgeId].push(rating);
      });
      
      // Calculate average ratings
      Object.keys(ratingsByJudge).forEach(judgeId => {
        const ratings = ratingsByJudge[judgeId];
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        ratingsMap[judgeId] = {
          avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          totalReviews: ratings.length
        };
      });
      
      setJudgeRatings(ratingsMap);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadJudges = async () => {
    try {
      setLoading(true);
      
      const querySnapshot = await pb.collection('judges').getFullList({ sort: '-created' });
      const loadedJudges: Judge[] = querySnapshot.map((doc) => ({
        id: doc.id,
        fullName: doc.fullName || 'Unknown Judge',
        experience: doc.experience || '',
        expertise: doc.expertise || [],
        price: doc.price ?? 0,
        contactMessage: doc.contactMessage || '',
        email: doc.email || '',
        phone: doc.phone || '',
        createdAt: doc.created ? new Date(doc.created) : undefined,
        status: (doc.status as Judge['status']) || 'pending',
        rating: doc.rating ?? 0,
        totalReviews: doc.totalReviews ?? 0,
        location: doc.location || '北京',
        languages: doc.languages || ['中文', 'English'],
        education: doc.education || '',
        certifications: doc.certifications || [],
        bio: doc.bio || '',
        specialties: doc.specialties || ['辩论赛', '演讲'],
        showContactInfo: !!doc.showContactInfo,
        judgeTypes: doc.judgeTypes || [],
      }));
      setJudges(loadedJudges);
    } catch (err) {
      console.error("Error loading judges: ", err);
      setError('加载评委列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleExpertiseChange = (event: SelectChangeEvent<string>) => {
    setSelectedExpertise(event.target.value);
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setSelectedLanguage(event.target.value);
  };

  const handlePriceRangeChange = (event: SelectChangeEvent<string>) => {
    setPriceRange(event.target.value);
  };

  const handleContactVisibilityChange = (event: SelectChangeEvent<string>) => {
    setContactVisibility(event.target.value);
  };

  const filteredJudges = judges.filter(judge => {
    if (!judge) return false;
    
    const matchesSearch = judge.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         judge.experience?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         judge.expertise?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = selectedExpertise === '' || 
                           judge.expertise?.some(exp => exp.toLowerCase().includes(selectedExpertise.toLowerCase()));
    
    const matchesLanguage = selectedLanguage === '' || 
                          judge.languages?.some(lang => lang.toLowerCase().includes(selectedLanguage.toLowerCase()));
    
    const matchesContactVisibility = contactVisibility === '' || 
                                   (contactVisibility === 'public' && judge.showContactInfo) ||
                                   (contactVisibility === 'private' && !judge.showContactInfo);
    
    let matchesPrice = true;
    if (priceRange) {
      const price = judge.price || 0;
      switch (priceRange) {
        case '0-30':
          matchesPrice = price <= 30;
          break;
        case '30-40':
          matchesPrice = price > 30 && price <= 40;
          break;
        case '40-50':
          matchesPrice = price > 40 && price <= 50;
          break;
        case '50+':
          matchesPrice = price > 50;
          break;
      }
    }
    
    return matchesSearch && matchesExpertise && matchesLanguage && matchesPrice && matchesContactVisibility;
  }).sort((a, b) => {
    // Sort by average rating (highest first)
    const ratingA = judgeRatings[a.id]?.avgRating || 0;
    const ratingB = judgeRatings[b.id]?.avgRating || 0;
    
    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Highest rating first
    }
    
    // If ratings are equal, sort by total reviews (most reviewed first)
    const reviewsA = judgeRatings[a.id]?.totalReviews || 0;
    const reviewsB = judgeRatings[b.id]?.totalReviews || 0;
    
    return reviewsB - reviewsA;
  });

  const getExpertiseIcon = (expertise: string) => {
    const found = expertiseOptions.find(opt => opt.value === expertise.toLowerCase());
    return found?.icon || '📋';
  };

  // Check if user has already rated this judge
  const checkAlreadyRated = async (userId: string, judgeId: string) => {
    const res = await pb.collection('ratings').getList(1, 1, {
      filter: `userId = "${userId}" && judgeId = "${judgeId}"`,
    });
    return res.items.length > 0;
  };

  const handleRatingChange = (judgeId: string, value: number | null) => {
    setRatingValueMap(prev => ({ ...prev, [judgeId]: value }));
  };

  const handleReviewChange = (judgeId: string, value: string) => {
    setReviewMap(prev => ({ ...prev, [judgeId]: value }));
  };

  const handleSubmitRating = async (judge: Judge) => {
    setRatingError(null);
    setRatingSuccess(null);
    setRatingLoading(judge.id);
    try {
      const user = auth.getCurrentUser();
      if (!user) {
        setRatingError('You must be logged in to rate a judge.');
        setRatingLoading(null);
        return;
      }
      const ratingValue = ratingValueMap[judge.id];
      if (!ratingValue) {
        setRatingError('Please select a rating.');
        setRatingLoading(null);
        return;
      }
      // Prevent duplicate ratings
      const hasRated = await checkAlreadyRated(user.id, judge.id);
      if (hasRated) {
        setAlreadyRatedMap(prev => ({ ...prev, [judge.id]: true }));
        setRatingLoading(null);
        return;
      }
      await pb.collection('ratings').create({
        userId: user.id,
        judgeId: judge.id,
        judgeName: judge.fullName,
        rating: ratingValue,
        review: reviewMap[judge.id] || '',
      });
      setRatingSuccess(judge.id);
      setRatingValueMap(prev => ({ ...prev, [judge.id]: null }));
      setReviewMap(prev => ({ ...prev, [judge.id]: '' }));
    } catch (err: any) {
      setRatingError(err.message || 'Failed to submit rating.');
    } finally {
      setRatingLoading(null);
    }
  };

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
          评委列表
        </Typography>
        <Typography variant="h5" align="center" paragraph sx={{ mb: 4, color: '#ffffff' }}>
          寻找资深评委，为您的比赛保驾护航
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
            placeholder="搜索评委姓名、专业领域..."
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
            onClick={() => navigate('/judge-profile')}
            startIcon={<AddIcon />}
          >
            成为评委/教练
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'center' }}>
            <FormControl size="small">
              <InputLabel>专业领域</InputLabel>
              <Select
                value={selectedExpertise}
                onChange={handleExpertiseChange}
                label="专业领域"
              >
                {expertiseOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>价格范围</InputLabel>
              <Select
                value={priceRange}
                onChange={handlePriceRangeChange}
                label="价格范围"
              >
                {priceRanges.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <InputLabel>联系方式公开情况</InputLabel>
              <Select
                value={contactVisibility}
                onChange={handleContactVisibilityChange}
                label="联系方式公开情况"
              >
                {contactVisibilityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Judges Grid */}
        {loading ? (
          <Typography align="center">加载中...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : filteredJudges.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              没有找到匹配的评委
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              尝试调整搜索条件或成为评委
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/judge-profile')}>
              成为评委/教练
            </Button>
          </Paper>
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3
            }}
          >
            {filteredJudges.map((judge) => (
              <Card
                key={judge.id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: 60,
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    color: 'white',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={judge.showContactInfo ? "已公开联系方式" : "未公开联系方式"}
                      size="small"
                      color={judge.showContactInfo ? "success" : "default"}
                      sx={{ 
                        bgcolor: judge.showContactInfo ? 'rgba(46, 125, 50, 0.2)' : 'rgba(255,255,255,0.2)',
                        color: '#ffffff'
                      }}
                    />
                  </Box>
                  <Chip
                    label={
                      judgeRatings[judge.id] 
                        ? `⭐ ${judgeRatings[judge.id].avgRating.toFixed(1)} (${judgeRatings[judge.id].totalReviews}评价)`
                        : '暂无评分'
                    }
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: '#FFD700', 
                      fontWeight: 'bold', 
                      fontSize: judgeRatings[judge.id] ? 12 : 11
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3, bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={judge.avatar}
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        bgcolor: '#000000',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                      }}
                    >
                      {judge.fullName?.[0] || 'J'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#000000' }}>
                        {judge.fullName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {judge.location || '北京'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {(judge.judgeTypes || []).map((type, index) => (
                        <Chip
                          key={index}
                          label={type}
                          size="small"
                          icon={<span>{getExpertiseIcon(type)}</span>}
                          sx={{ 
                            bgcolor: 'rgba(0,0,0,0.05)', 
                            color: '#000000',
                            borderColor: 'rgba(0,0,0,0.1)',
                            '& .MuiChip-icon': {
                              color: '#000000'
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ 
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    mb: 2
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.5,
                        minHeight: '4.5em'
                      }}
                    >
                      {judge.experience || '暂无评委履历'}
                    </Typography>
                  </Box>

                


                </CardContent>




                <CardActions sx={{ p: 2, pt: 0, bgcolor: '#ffffff' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/judge-detail/${judge.id}`)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
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
                </CardActions>


              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default JudgeList; 