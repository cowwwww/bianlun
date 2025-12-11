import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Chip,
  Card,
  CardContent,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Rating,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  ContentCopy as CopyIcon,
  Lock as LockIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import pb from '../services/pocketbase';
import { auth } from '../services/authService';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
// TODO: implement lifetime access check with PocketBase if needed

interface JudgeData {
  fullName: string;
  wechatId: string;
  phone: string;
  experience: string;
  price: number;
  location?: string;
  education?: string;
  expertise?: string[];
  languages?: string[];
  showContactInfo: boolean;
  judgeTypes?: string[];
  comments?: string;
  // Evaluation Form data
  splitVoteFrequency: number;
  professionalKnowledgeLevel: number;
  persuasionPreference: number;
  argumentationThreshold: number;
  biasAdjustment: number;
  consensusRevocable: number;
  lateArgumentAcceptance: number;
  ruleViolationSeverity: number;
  winningCriteria: string;
  // New evaluation fields
  topicBiasResponse?: string;
  argumentTypePreference?: string;
}

interface RatingData {
  id: string;
  userId: string;
  judgeId: string;
  judgeName: string;
  rating: number;
  review: string;
  created: string;
}

const JudgeDetail = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [judge, setJudge] = useState<JudgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [loadingRating, setLoadingRating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [hasLifetimeAccess, setHasLifetimeAccess] = useState(true);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<RatingData | null>(null);

  // Judge type options with icons
  const judgeTypeIcons: Record<string, string> = {
    '辩论赛': '',
    '模拟联合国': '',
    '谈判比赛': '',
    '学术竞赛': '',
    '案例分析': '',
    '其他': '',
  };

  useEffect(() => {
    const fetchJudgeData = async () => {
      try {
        const record = await pb.collection('judges').getOne(id!);
        setJudge(record as unknown as JudgeData);
      } catch (err) {
        console.error('Error fetching judge data:', err);
        setError('获取评委信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchJudgeData();
  }, [id]);

  // For now allow access; implement PB-based check if needed

  // Fetch all ratings for this judge
  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;
      setRatingsLoading(true);
      setRatingsError(null);
      try {
        const list = await pb.collection('ratings').getFullList({
          filter: `judgeId = "${id}"`,
          sort: '-created',
        });
        const user = auth.getCurrentUser();
        const ratingsList: RatingData[] = list.map(r => ({
          id: r.id,
          userId: r.userId,
          judgeId: r.judgeId,
          judgeName: r.judgeName,
          rating: r.rating,
          review: r.review,
          created: r.created,
        }));
        let currentUserRating: RatingData | null = null;
        if (user) {
          currentUserRating = ratingsList.find(r => r.userId === user.id) || null;
        }
        setRatings(ratingsList);
        setUserRating(currentUserRating);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setRatingsError(err.message || '无法获取评分数据');
        } else {
          setRatingsError('无法获取评分数据');
        }
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
    // eslint-disable-next-line
  }, [id]);

  // Calculate average rating and review count
  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [ratings]);
  const totalReviews = ratings.length;

  // Check if user has already rated this judge
  const checkAlreadyRated = async (userId: string, judgeId: string) => {
    const res = await pb.collection('ratings').getList(1, 1, {
      filter: `userId = "${userId}" && judgeId = "${judgeId}"`,
    });
    return res.items.length > 0;
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setAlreadyRated(false);
    setLoadingRating(true);
    try {
      const user = auth.getCurrentUser();
      if (!user) {
        setError('您必须登录才能评分。');
        setLoadingRating(false);
        return;
      }
      if (!id || !judge?.fullName || !rating) {
        setError('请给出评分。');
        setLoadingRating(false);
        return;
      }
      // Prevent duplicate ratings
      const hasRated = await checkAlreadyRated(user.id, id);
      if (hasRated) {
        setAlreadyRated(true);
        setLoadingRating(false);
        return;
      }
      await pb.collection('ratings').create({
        userId: user.id,
        judgeId: id,
        judgeName: judge.fullName,
        rating,
        review,
      });
      setSuccess(true);
      setReview('');
      setRating(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '评分提交失败。');
      } else {
        setError('评分提交失败。');
      }
    } finally {
      setLoadingRating(false);
    }
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a snackbar notification here
  };

  const renderEvaluationItem = (value: number, maxValue: number = 5, color: string = theme.palette.primary.main) => {
    const percentage = (value / maxValue) * 100;
    return (
      <Box sx={{ width: '100%', height: 6, bgcolor: alpha(color, 0.1), borderRadius: 3, position: 'relative' }}>
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: color,
            borderRadius: 3,
            position: 'absolute',
            left: 0,
            top: 0,
            transition: 'width 0.5s ease-in-out',
          }}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="text.secondary">加载中...</Typography>
      </Container>
    );
  }

  if (error || !judge) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          {error || '评委信息不可用'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section - Full Width */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            color: 'white',
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, position: 'relative', zIndex: 1 }}>
            <Avatar
              sx={{
                width: { xs: 80, md: 120 },
                height: { xs: 80, md: 120 },
                bgcolor: alpha('#fff', 0.2),
                fontSize: { xs: '2rem', md: '3rem' },
                border: '4px solid rgba(255,255,255,0.2)',
              }}
            >
              {judge.fullName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                flexWrap: 'wrap'
              }}>
                <Typography 
                  variant="h5" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {judge.fullName}
                </Typography>

                <Chip
                  label={judge.showContactInfo ? "已公开联系方式" : "未公开联系方式"}
                  color={judge.showContactInfo ? "success" : "default"}
                  sx={{ 
                    bgcolor: judge.showContactInfo ? alpha('#ffff', 0.2) : alpha('#fff', 0.1),
                    backdropFilter: 'blur(8px)',
                    fontWeight: 500,
                    fontSize: theme.typography.h5.fontSize,
                    color: '#fff'
                  }}
                />

              </Box>

              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mb: 3 }}
              >
                {judge.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ fontSize: 20, color: alpha('#fff', 0.8) }} />
                    <Typography sx={{ color: alpha('#fff', 0.9) }}>{judge.location}</Typography>
                  </Box>
                )}
                {judge.education && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ fontSize: 20, color: alpha('#fff', 0.8) }} />
                    <Typography sx={{ color: alpha('#fff', 0.9) }}>{judge.education}</Typography>
                  </Box>
                )}
              </Stack>

              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap', 
                  gap: 1,
                  '& .MuiChip-root': {
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }
                }}
              >
                {(judge.judgeTypes || []).map((type, index) => (
                  <Chip
                    key={index}
                    label={`${judgeTypeIcons[type] || '📋'} ${type}`}
                    sx={{ 
                      color: 'white',
                      borderColor: alpha('#fff', 0.3),
                      bgcolor: alpha('#fff', 0.1),
                      backdropFilter: 'blur(8px)',
                      '&:hover': { bgcolor: alpha('#fff', 0.2) }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>


        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          
          {/* Left Column - 40% */}
          
          <Box sx={{ 
            width: { xs: '100%', md: '40%' },
            minWidth: { md: '40%' },
            maxWidth: { md: '40%' }
          }}>

            
            {/* Contact Information */}
                    {/* Rating Form Section */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
              评分与评价
            </Typography>

            {/* Overall rating stats */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: 3,
              mb: 4,
              pb: 4,
              borderBottom: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.3)
            }}>
              {ratingsLoading ? (
                <CircularProgress />
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Rating value={averageRating} precision={0.1} readOnly size="large" sx={{ 
                      color: '#FFD700', 
                      fontSize: 28,
                      mt: 1
                    }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {totalReviews} 条评价
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Optional: Add rating distribution here if needed */}
                  </Box>
                </>
              )}
            </Box>
            
            {/* Rating form */}
            <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.3) }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                为该评委打分
              </Typography>
              {alreadyRated ? (
                <Alert severity="info" sx={{ mb: 2 }}>您已经评价过该评委。</Alert>
              ) : success ? (
                <Alert severity="success" sx={{ mb: 2 }}>感谢您的评价！</Alert>
              ) : (
                <Box sx={{ 
                  p: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ fontWeight: 500 }}>您的评分：</Typography>
                    <Rating
                      name="judge-rating"
                      value={rating}
                      onChange={(_, value) => setRating(value)}
                      precision={1}
                      max={5}
                      sx={{ fontSize: 26, color: '#FFD700' }}
                    />
                    {rating && (
                      <Typography sx={{ ml: 1, color: theme.palette.text.secondary }}>
                        {rating}.0分
                      </Typography>
                    )}
                  </Box>
                  <TextField
                    label="评价内容（可选）"
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="分享您对这位评委的评价和建议..."
                    sx={{ mb: 3 }}
                  />
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  <Button
                    onClick={(e) => handleSubmitRating(e as React.FormEvent)}
                    variant="contained"
                    color="primary"
                    disabled={loadingRating || !rating}
                    size="large"
                    sx={{ 
                      py: 1,
                      fontWeight: 600,
                      minWidth: { xs: '100%', sm: 160 }
                    }}
                  >
                    {loadingRating ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '提交评分'}
                  </Button>
                </Box>
              )}
            </Box>

            {/* Reviews list */}

          </CardContent>
        </Card>

            {/* Contact Information - Restricted to Lifetime Users */}
            {judge.showContactInfo ? (
              hasLifetimeAccess ? (
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    mb: 3
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      联系方式
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MessageIcon color="primary" />
                          <Typography>微信：{judge.wechatId}</Typography>
                        </Box>
                        <Tooltip title="复制微信号">
                          <IconButton size="small" onClick={() => handleCopyContact(judge.wechatId)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon color="primary" />
                          <Typography>电话：{judge.phone}</Typography>
                        </Box>
                        <Tooltip title="复制电话号码">
                          <IconButton size="small" onClick={() => handleCopyContact(judge.phone)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 500 }}>收费：</Typography>
                          <Typography>¥{judge.price}/场</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'warning.main',
                    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)'
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <LockIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'warning.dark' }}>
                      联系方式和收费信息
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      此评委的联系方式和详细收费仅对主办方版开放
                    </Typography>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      请先登录，然后升级为主办方版
                    </Alert>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card 
                sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  mb: 3
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    此评委未公开联系方式
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Style */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 4 }}>
                  评审风格
                </Typography>
                <Stack spacing={4}>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>分票倾向</Typography>
                    {renderEvaluationItem(judge.splitVoteFrequency, 5, '#2196f3')}
                  </Box>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>专业知识代入程度</Typography>
                    {renderEvaluationItem(judge.professionalKnowledgeLevel, 5, '#4caf50')}
                  </Box>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>论证门槛</Typography>
                    {renderEvaluationItem(judge.argumentationThreshold, 5, '#9c27b0')}
                  </Box>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>共识可推翻程度</Typography>
                    {renderEvaluationItem(judge.consensusRevocable, 5, '#3f51b5')}
                  </Box>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>后期论点接受度</Typography>
                    {renderEvaluationItem(judge.lateArgumentAcceptance, 5, '#009688')}
                  </Box>
                  <Box>
                    <Typography gutterBottom sx={{ fontWeight: 500, mb: 1.5 }}>违规操作影响程度</Typography>
                    {renderEvaluationItem(judge.ruleViolationSeverity, 5, '#795548')}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
              全部评分与评价
            </Typography>


            {/* Reviews list */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>全部评价</span>
                <Chip 
                  label={`${totalReviews} 条`} 
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}
                />
              </Typography>

              {ratingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : ratingsError ? (
                <Alert severity="error">{ratingsError}</Alert>
              ) : ratings.length === 0 ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  bgcolor: alpha(theme.palette.divider, 0.05),
                  borderRadius: 2
                }}>
                  <Typography color="text.secondary">暂无评价</Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {/* User's own rating at the top, highlighted */}
                  {userRating && (
                    <Box sx={{ 
                      border: '1px solid',
                      borderColor: theme.palette.primary.main,
                      borderRadius: 2,
                      p: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Typography sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        我的评价
                        <Chip 
                          label="您" 
                          size="small"
                          sx={{ 
                            bgcolor: theme.palette.primary.main,
                            color: '#fff',
                            fontSize: 12,
                            height: 20
                          }}
                        />
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={userRating.rating} readOnly size="small" sx={{ color: '#FFD700' }} />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>{userRating.rating.toFixed(1)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {userRating.created ? new Date(userRating.created).toLocaleString() : ''}
                        </Typography>
                      </Box>
                      {userRating.review && (
                        <Typography sx={{ color: theme.palette.text.secondary }}>
                          {userRating.review}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  {/* Other reviews */}
                  {ratings.filter(r => !userRating || r.id !== userRating.id).map(rating => (
                    <Box key={rating.id} sx={{ 
                      p: 3, 
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.2),
                      '&:last-child': { borderBottom: 0 }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 1.5
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={rating.rating} readOnly size="small" sx={{ color: '#FFD700' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{rating.rating.toFixed(1)}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {rating.created ? new Date(rating.created).toLocaleString() : ''}
                        </Typography>
                      </Box>
                      {rating.review && (
                        <Typography sx={{ color: theme.palette.text.secondary }}>
                          {rating.review}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>
          </Box>

          {/* Right Column - 60% */}
          <Box sx={{ 
            width: { xs: '100%', md: '60%' },
            minWidth: { md: '60%' },
            maxWidth: { md: '60%' }
          }}>
            {/* Experience */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}>
                  评委履历
                </Typography>
                <Typography 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word',
                    color: theme.palette.text.secondary,
                    lineHeight: 1.8
                  }}
                >
                  {judge.experience}
                </Typography>
              </CardContent>
            </Card>

            {/* Question 9 */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}>
有的时候会出现一方仅仅举出了推论，而另一方只有案例，或是只有数据的情况，这时候你会怎样判决？一般情况下，推论、数据和案例，何者更能说服你？为什么？
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>
                  <Typography sx={{ 
                    color: theme.palette.text.secondary, 
                    lineHeight: 1.8, 
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}>
                    {judge.winningCriteria || '评委暂未回答此问题'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Question 10 */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}>
                对你来说，辩论比赛的"赢"意味着什么？当你判一支队伍赢的时候，往往意味着他们是怎样的队伍？你认为以此作为判准对于辩论有什么意义？
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>

                  <Typography sx={{ 
                    color: theme.palette.text.secondary, 
                    lineHeight: 1.8, 
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}>
                    {judge.winningCriteria || '评委暂未回答此问题'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Question 11 */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}>
                你认为辩题有没有优势持方？这对你的判决会有什么影响？你会为此主动调整心证么？
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>
                  <Typography sx={{ 
                    color: theme.palette.text.secondary, 
                    lineHeight: 1.8, 
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}>
                    {judge.topicBiasResponse || '评委暂未回答此问题'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Question 12 */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}>
                有的时候会出现一方仅仅举出了推论，而另一方只有案例，或是只有数据的情况，这时候你会怎样判决？一般情况下，推论、数据和案例，何者更能说服你？为什么？
                </Typography>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>

                  <Typography sx={{ 
                    color: theme.palette.text.secondary, 
                    lineHeight: 1.8, 
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    wordWrap: 'break-word'
                  }}>
                    {judge.argumentTypePreference || '评委暂未回答此问题'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Question 13 - Supplementary Information (Optional) */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}>
                  补充说明 <Typography component="span" variant="caption" color="text.secondary">(选填)</Typography>
                  </Typography>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}>
                    <Typography sx={{ 
                      color: theme.palette.text.secondary, 
                      lineHeight: 1.8, 
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word'
                    }}>
                    {judge.comments || '评委暂未提供补充说明'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
          </Box>
        </Box>

        {/* Reviews Section */}
   


      </Container>
    </Box>
  );
};

export default JudgeDetail; 