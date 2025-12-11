import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  Divider,
  Container,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTournament, type Tournament } from '../services/tournamentService';
import logo from '../assets/logo.png';

interface TournamentFormData {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  teamSize: string;
  price: string;
  maxTeams: string;
  isPublic: boolean;
  requirements: string[];
  tags: string[];
  registrationLink: string;
  ruleBookLink: string;
  contactEmail: string;
  organizer: string;
  award: string;
}

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    title: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: {
      city: '',
      state: '',
      country: '',
    },
    teamSize: '',
    price: '0',
    maxTeams: '',
    isPublic: true,
    requirements: [],
    tags: [],
    registrationLink: '',
    ruleBookLink: '',
    contactEmail: '',
    organizer: '',
    award: '',
  });

  const tournamentTypes = [
    { 
      value: 'debate', 
      label: '辩论赛',
      icon: '🗣️',
      description: '逻辑思辨，口才较量'
    },
    { 
      value: 'mun', 
      label: '模拟联合国',
      icon: '🌍',
      description: '外交模拟，国际视野'
    },
    { 
      value: 'hackathon', 
      label: '黑客马拉松',
      icon: '💻',
      description: '编程竞赛，创新挑战'
    },
    { 
      value: 'academic', 
      label: '学术竞赛',
      icon: '📚',
      description: '知识竞赛，学术交流'
    },
    { 
      value: 'case-competition', 
      label: '案例分析',
      icon: '📊',
      description: '商业案例，策略分析'
    },
    { 
      value: 'speech', 
      label: '演讲比赛',
      icon: '🎤',
      description: '演讲技巧，表达能力'
    },
  ];

  const steps = [
    { label: '基本信息', icon: <DescriptionIcon /> },
    { label: '时间地点', icon: <EventIcon /> },
    { label: '确认发布', icon: <CheckIcon /> },
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: TournamentFormData) => {
        const parentValue = prev[parent as keyof TournamentFormData];
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData((prev: TournamentFormData) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform form data to match service expectations
      const tournamentData: Omit<Tournament, 'id'> = {
        name: formData.title,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        date: formData.startDate,
        location: formData.location.city ? JSON.stringify(formData.location) : '线上',
        status: 'upcoming',
        teamsize: formData.teamSize,
        price: parseInt(formData.price) || 0,
        organizer: formData.organizer,
        contact: formData.contactEmail,
        category: formData.type,
        image: '',
        totalTeams: parseInt(formData.maxTeams) || 0,
        playersPerTeam: parseInt(formData.teamSize) || 1,
        participationRequirements: formData.requirements.join('\n'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        award: formData.award,
      };
      
      await createTournament(tournamentData);
      navigate('/');
    } catch (err) {
      console.error('链接错误，请重试或联系工作人员:', err);
      setError('不可创建比赛，请确认已登录');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.title && formData.description && formData.type && formData.teamSize && formData.maxTeams;
      case 1:
        return formData.startDate && formData.endDate && formData.registrationDeadline;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                比赛基本信息
              </Typography>
              
              <TextField
                fullWidth
                label="比赛名称"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="输入一个吸引人的比赛名称"
                required
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="比赛介绍"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="详细描述比赛内容、目标和特色"
                required
              />

              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                选择比赛类型
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                {tournamentTypes.map((type) => (
                  <Card
                    key={type.value}
                    sx={{
                      cursor: 'pointer',
                      border: formData.type === type.value ? '2px solid #667eea' : '1px solid #e0e0e0',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {type.icon}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                参赛设置
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="团队大小（多少人/队）"
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />

                <TextField
                  fullWidth
                  label="赛事队伍数量"
                  type="number"
                  value={formData.maxTeams}
                  onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                  placeholder="限制参与人数"
                  required
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="报名费用 (¥)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0表示免费"
                  InputProps={{
                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                <TextField
                  fullWidth
                  label="奖金/奖品"
                  value={formData.award}
                  onChange={(e) => handleInputChange('award', e.target.value)}
                  placeholder="例如：冠军 ¥10000，亚军 ¥5000，季军 ¥2000"
                  helperText="描述比赛的奖励设置"
                />
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="参赛要求"
                value={formData.requirements.join('\n')}
                onChange={(e) => handleInputChange('requirements', e.target.value.split('\n'))}
                placeholder="描述参赛资格、技能要求等（可选）"
                helperText="例如：需要有相关经验、年龄限制等"
              />

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                联系与报名信息
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="主办方"
                  value={formData.organizer}
                  onChange={(e) => handleInputChange('organizer', e.target.value)}
                  placeholder="输入主办方名称"
                  required
                />

                <TextField
                  fullWidth
                  label="联系邮箱"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                  required
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="报名链接"
                  value={formData.registrationLink}
                  onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                  placeholder="https://example.com/register"
                  helperText="参赛者可以通过此链接直接报名"
                />

                <TextField
                  fullWidth
                  label="赛事章程链接"
                  value={formData.ruleBookLink}
                  onChange={(e) => handleInputChange('ruleBookLink', e.target.value)}
                  placeholder="https://example.com/rules.pdf"
                  helperText="比赛规则和章程文档"
                />
              </Stack>
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                时间安排
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="报名截止时间"
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  fullWidth
                  label="比赛开始时间"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />

                <TextField
                  fullWidth
                  label="比赛结束时间"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Stack>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                举办地点
              </Typography>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="城市"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  placeholder="如：北京"
                />

                <TextField
                  fullWidth
                  label="省份/州"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  placeholder="如：北京市"
                />

                <TextField
                  fullWidth
                  label="国家"
                  value={formData.location.country}
                  onChange={(e) => handleInputChange('location.country', e.target.value)}
                  placeholder="如：中国"
                />
              </Stack>

              <Alert severity="info">
                💡 如果是线上比赛，可以留空地点信息，系统会自动标记为"在线"
              </Alert>
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ✅ 确认比赛信息
              </Typography>

              <Card sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {formData.title}
                      </Typography>
                      <Chip 
                        label={tournamentTypes.find(t => t.value === formData.type)?.label} 
                        color="primary" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={formData.isPublic ? '公开比赛' : '私人比赛'} 
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body1" color="text.secondary">
                      {formData.description}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        时间地点
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            报名截止时间
                          </Typography>
                          <Typography>
                            {new Date(formData.registrationDeadline).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            比赛时间
                          </Typography>
                          <Typography>
                            {new Date(formData.startDate).toLocaleString()} - {new Date(formData.endDate).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            地点
                          </Typography>
                          <Typography>
                            {formData.location.city ? `${formData.location.city}, ${formData.location.state}, ${formData.location.country}` : '线上比赛'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        参赛信息
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            队伍人数
                          </Typography>
                          <Typography>{formData.teamSize}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            队伍数量
                          </Typography>
                          <Typography>{formData.maxTeams} 支队伍</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            报名费用
                          </Typography>
                          <Typography>
                            {formData.price === '0' ? '免费' : `¥${formData.price}`}
                          </Typography>
                        </Box>
                        {formData.award && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              奖金/奖品
                            </Typography>
                            <Typography>{formData.award}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        联系方式
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            主办方
                          </Typography>
                          <Typography>{formData.organizer}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            联系邮箱
                          </Typography>
                          <Typography>{formData.contactEmail}</Typography>
                        </Box>
                        {formData.registrationLink && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              报名链接
                            </Typography>
                            <Typography component="a" href={formData.registrationLink} target="_blank">
                              {formData.registrationLink}
                            </Typography>
                          </Box>
                        )}
                        {formData.ruleBookLink && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              赛事章程
                            </Typography>
                            <Typography component="a" href={formData.ruleBookLink} target="_blank">
                              {formData.ruleBookLink}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: 50, height: 50, marginRight: 16 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              创建比赛
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              创建一个精彩的比赛，聚集优秀的参与者
            </Typography>
          </Box>
        </Box>

        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />
      </Paper>

      {/* Stepper */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  <Avatar
                    sx={{
                      bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {step.icon}
                  </Avatar>
                }
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent()}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ mr: 1 }}
          >
            上一步
          </Button>
          
          <Box sx={{ flex: '1 1 auto' }} />
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !isStepValid(activeStep)}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
              }}
            >
              {loading ? '创建中...' : '发布比赛'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
              }}
            >
              下一步
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTournament; 