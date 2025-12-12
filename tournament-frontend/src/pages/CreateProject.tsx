import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbase';
import { auth } from '../services/authService';
import logo from '../assets/logo.png';
import { v4 as uuidv4 } from 'uuid';
import {
  Timer as TimerIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface TimerStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  sound?: string;
  autoNext?: boolean;
  mode: 'single' | 'dual';
  side?: 'left' | 'right' | null;
}

interface ProjectFormData {
  projectName: string;
  description: string;
  category: string;
  backgroundColor: string;
  textColor: string;
  isPublic: boolean;
  timerSteps: TimerStep[];
  backgroundImage?: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    projectName: '',
    description: '',
    category: 'custom',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    isPublic: true,
    timerSteps: [],
    backgroundImage: '',
  });

  const [currentStep, setCurrentStep] = useState<TimerStep>({
    id: '',
    title: '',
    description: '',
    duration: 300,
    sound: 'bell',
    autoNext: false,
    mode: 'single',
    side: null,
  });

  const categories = [
    { value: 'xinguobian', label: '新国辩', description: '新国辩系列计时器', icon: <TimerIcon /> },
    { value: 'huayu-worldcup', label: '华语辩论世界杯', description: '华语辩论世界杯系列计时器', icon: <TimerIcon /> },
    { value: 'bp-style', label: 'BP赛制',  description: 'British Parliamentary', icon: <TimerIcon /> },
    { value: 'moot', label: '模拟法庭', description: '模拟法庭计时器', icon: <TimerIcon /> },
    { value: 'negotiation', label: '谈判计时器', description: '多边/单边谈判计时器', icon: <TimerIcon /> },
    { value: 'custom', label: '自定义', description: '创建自定义计时器', icon: <TimerIcon /> },
  ];

  const steps = [
    { label: '基本信息', icon: <SettingsIcon /> },
    { label: '计时步骤', icon: <TimerIcon /> },
    { label: '预览发布', icon: <CheckIcon /> },
  ];

  const soundOptions = [
    { value: 'bell', label: '铃声' },
    { value: 'chime', label: '钟声' },
    { value: 'beep', label: '蜂鸣' },
    { value: 'ding', label: '叮当' },
    { value: 'none', label: '无声音' },
  ];

  const modeOptions = [
    { value: 'single', label: '单边计时' },
    { value: 'dual', label: '双边计时' },
  ];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleAddStep = () => {
    if (currentStep.title && currentStep.duration > 0) {
      const newStep: TimerStep = {
        ...currentStep,
        id: uuidv4(),
      };
      setFormData({
        ...formData,
        timerSteps: [...formData.timerSteps, newStep],
      });
      setCurrentStep({
        id: '',
        title: '',
        description: '',
        duration: 300,
        sound: 'bell',
        autoNext: false,
        mode: 'single',
        side: null,
      });
    }
  };

  const handleDeleteStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      timerSteps: prev.timerSteps.filter(step => step.id !== stepId),
    }));
  };

  const getTotalDuration = () => {
    return formData.timerSteps.reduce((total, step) => total + step.duration, 0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        setError('请先登录');
        setLoading(false);
        return;
      }

      const timerSteps = formData.timerSteps.map(step => ({
        ...step,
        label: step.title,
        isDualTimer: step.mode === 'dual',
      }));

      const totalDuration = getTotalDuration();

      const projectData = {
        name: formData.projectName,
        description: formData.description,
        category: formData.category,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        isPublic: formData.isPublic,
        timerSteps,
        backgroundImage: formData.backgroundImage,
        author: currentUser.id,
        usageCount: 0,
        type: 'countdown',
        duration: totalDuration,
        createdBy: currentUser.id,
      };

      if (formData.isPublic) {
        const record = await pb.collection('timers').create(projectData);
        navigate(`/run-timer/${record.id}`);
      } else {
        const tempId = `temp-${uuidv4()}`;
        const tempProject: ProjectFormData & { id: string } = {
          ...projectData,
          projectName: formData.projectName,
          id: tempId,
        };
        navigate(`/run-timer/${tempId}`, { state: { project: tempProject, isTemp: true } });
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.projectName.trim().length > 0 && formData.category;
      case 1:
        return formData.timerSteps.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                项目基本信息
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="项目名称"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="为计时器起一个名字"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="项目描述"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="描述计时器的用途和特点"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  />
                }
                label="公开发布（保存到计时器列表）"
              />
              <Typography variant="body2" color="text.secondary">
                关闭则创建一次性计时器（不保存到后台，仅本次使用）
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                选择计时器类型
              </Typography>
              <Grid container spacing={2}>
                {categories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.value}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: formData.category === category.value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleInputChange('category', category.value)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {category.icon}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {category.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ⏱️ 设置计时步骤
              </Typography>
            </Grid>

            {/* Add New Step Form */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'grey.50', border: '2px dashed #ddd' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    添加新步骤
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="步骤名称"
                        value={currentStep.title}
                        onChange={(e) => setCurrentStep({...currentStep, title: e.target.value})}
                        placeholder="如：开场陈述"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="持续时间（秒）"
                        type="number"
                        value={currentStep.duration}
                        onChange={(e) => setCurrentStep({...currentStep, duration: parseInt(e.target.value, 10) || 0})}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="步骤描述"
                        value={currentStep.description}
                        onChange={(e) => setCurrentStep({...currentStep, description: e.target.value})}
                        placeholder="详细说明这个步骤的要求"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>计时模式</InputLabel>
                        <Select
                          value={currentStep.mode}
                          onChange={(e) => setCurrentStep({...currentStep, mode: e.target.value as 'single' | 'dual'})}
                          label="计时模式"
                        >
                          {modeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {currentStep.mode === 'dual' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>初始方</InputLabel>
                          <Select
                            value={currentStep.side || 'left'}
                            onChange={(e) => setCurrentStep({...currentStep, side: e.target.value as 'left' | 'right'})}
                            label="初始方"
                          >
                            <MenuItem value="left">左方</MenuItem>
                            <MenuItem value="right">右方</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>提醒音效</InputLabel>
                        <Select
                          value={currentStep.sound}
                          onChange={(e) => setCurrentStep({...currentStep, sound: e.target.value})}
                          label="提醒音效"
                        >
                          {soundOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentStep.autoNext}
                            onChange={(e) => setCurrentStep({...currentStep, autoNext: e.target.checked})}
                          />
                        }
                        label="自动进入下一步"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddStep}
                        disabled={!currentStep.title || currentStep.duration <= 0}
                        sx={{ mt: 1 }}
                      >
                        添加步骤
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Existing Steps */}
            {formData.timerSteps.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  已添加的步骤 ({formData.timerSteps.length})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  总时长：{formatDuration(getTotalDuration())}
                </Typography>
                
                <Stack spacing={2}>
                  {formData.timerSteps.map((step, index) => (
                    <Card key={step.id} sx={{ border: '1px solid #e0e0e0' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {index + 1}. {step.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {step.description}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip label={formatDuration(step.duration)} color="primary" size="small" />
                              <Chip label={step.mode === 'dual' ? '双边计时' : '单边计时'} size="small" />
                              {step.mode === 'dual' && (
                                <Chip label={`初始: ${step.side === 'left' ? '左方' : '右方'}`} size="small" />
                              )}
                              <Chip label={soundOptions.find(s => s.value === step.sound)?.label} size="small" />
                              {step.autoNext && <Chip label="自动继续" color="success" size="small" />}
                            </Stack>
                          </Box>
                          <Box>
                            <IconButton
                              onClick={() => handleDeleteStep(step.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            )}
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ✅ 确认并发布
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {formData.projectName}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
                    <Grid item>
                      <Chip 
                        label={categories.find(c => c.value === formData.category)?.label} 
                        color="primary" 
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={formData.isPublic ? '公开' : '私有'} 
                        variant="outlined" 
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={`${formData.timerSteps.length} 个步骤`} 
                        variant="outlined" 
                      />
                    </Grid>
                    <Grid item>
                      <Chip 
                        label={`总时长 ${formatDuration(getTotalDuration())}`} 
                        variant="outlined" 
                      />
                    </Grid>
                  </Grid>

                  {formData.description && (
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {formData.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    计时步骤
                  </Typography>
                  <Stack spacing={1}>
                    {formData.timerSteps.map((step, index) => (
                      <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 30 }}>
                          {index + 1}.
                        </Typography>
                        <Typography variant="body1" sx={{ flex: 1 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(step.duration)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
          background: '#ff9800',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              创建计时器
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              设计专业的比赛计时器，让每一秒都精准掌控
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
            background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")',
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
              {loading ? '创建中...' : '创建计时器'}
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

export default CreateProject;

