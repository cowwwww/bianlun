import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Card,
  Alert,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Slider,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import pb from '../services/pocketbase';

interface JudgeFormData {
  // Basic Info
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
  comments?: string;
  judgeTypes: string[];
  
  // Evaluation Form
  splitVoteFrequency: number;
  professionalKnowledgeLevel: number;
  persuasionPreference: number;
  argumentationThreshold: number;
  biasAdjustment: number;
  consensusRevocable: number;
  lateArgumentAcceptance: number;
  ruleViolationSeverity: number;
  winningCriteria: string;
  topicBiasResponse?: string;
  judgingCriteria: string;
  argumentTypePreference?: string;
}

const JudgeProfile = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<JudgeFormData>({
    fullName: '',
    wechatId: '',
    phone: '',
    experience: '',
    price: 0,
    location: '',
    education: '',
    expertise: [],
    languages: [],
    showContactInfo: false,
    comments: '',
    judgeTypes: [],
    
    // Initialize evaluation form fields with default values
    splitVoteFrequency: 3,
    professionalKnowledgeLevel: 3,
    persuasionPreference: 3,
    argumentationThreshold: 3,
    biasAdjustment: 3,
    consensusRevocable: 3,
    lateArgumentAcceptance: 3,
    ruleViolationSeverity: 3,
    winningCriteria: '',
    topicBiasResponse: '',
    argumentTypePreference: '',
    judgingCriteria: '',
  });

  const steps = [
    { label: '基本信息', icon: <PersonIcon /> },
    { label: '评审风格', icon: <GavelIcon /> },
  ];

  const handleInputChange = (field: keyof JudgeFormData, value: string | number | string[] | boolean) => {
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      // Frontend required checks to avoid PB 400
      if (!formData.fullName.trim()) throw new Error('姓名不能为空');
      if (!formData.wechatId.trim()) throw new Error('微信号不能为空');
      if (!formData.phone.trim()) throw new Error('手机号不能为空');
      if (!formData.experience.trim()) throw new Error('评委履历不能为空');
      if (!formData.winningCriteria.trim()) throw new Error('评审问卷第9题必填');
      if (!formData.judgingCriteria.trim()) throw new Error('评审问卷第10题必填');
      if (!formData.topicBiasResponse?.trim()) throw new Error('评审问卷第11题必填');
      if (!formData.argumentTypePreference?.trim()) throw new Error('评审问卷第12题必填');
      if (!formData.comments?.trim()) throw new Error('评审问卷第13题必填');
      
      const judgeData = {
        ...formData,
        price: Number(formData.price) || 0,
        // PB json fields currently have maxSize 0; omit them to avoid 400
        expertise: undefined,
        languages: undefined,
        judgeTypes: undefined,
        showContactInfo: !!formData.showContactInfo,
        splitVoteFrequency: Number(formData.splitVoteFrequency) || 0,
        professionalKnowledgeLevel: Number(formData.professionalKnowledgeLevel) || 0,
        persuasionPreference: Number(formData.persuasionPreference) || 0,
        argumentationThreshold: Number(formData.argumentationThreshold) || 0,
        biasAdjustment: Number(formData.biasAdjustment) || 0,
        consensusRevocable: Number(formData.consensusRevocable) || 0,
        lateArgumentAcceptance: Number(formData.lateArgumentAcceptance) || 0,
        ruleViolationSeverity: Number(formData.ruleViolationSeverity) || 0,
        status: 'pending',
        rating: 0,
        totalReviews: 0,
      };
      
      await pb.collection('judges').create(judgeData);
      
      navigate('/judge');
    } catch (err) {
      console.error('Error submitting judge profile:', err);
      const pbErr = err as { response?: { data?: unknown; message?: string; code?: number }; message?: string };
      if (pbErr?.response) {
        console.error('PocketBase response:', pbErr.response);
      }
      if (pbErr?.response?.data) {
        setError(`提交失败：${JSON.stringify(pbErr.response.data)}`);
      } else if (pbErr?.response?.message) {
        setError(`提交失败：${pbErr.response.message}`);
      } else {
        setError(pbErr?.message || 'Failed to submit profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.fullName && formData.wechatId && formData.phone && formData.experience;
      case 1:
        return formData.winningCriteria && 
               formData.topicBiasResponse && 
               formData.argumentTypePreference && 
               formData.judgingCriteria &&
               formData.comments;
      default:
        return false;
    }
  };

  const questions = [
    {
      id: 'splitVoteFrequency',
      question: '1. 你的三票会分票吗？你在什么情况下，会投出三票分票？',
      label: '分票情况 (1表示从不，5表示经常)'
    },
    {
      id: 'professionalKnowledgeLevel',
      question: '2. 你会把自己的专业知识或常识带到比赛中去吗？会代入哪些？多大程度上代入？',
      label: '代入程度 (1表示从不，5表示重度)'
    },
    {
      id: 'persuasionPreference',
      question: '3. 推论、数据和案例，何者更能说服你？为什么？',
      label: '说服力 (1表示推论，3表示数据，5表示案例)'
    },
    {
      id: 'argumentationThreshold',
      question: '4. 对你来说，一个论点怎样才算被论证成功？',
      label: '论证门槛 (1表示很低，5表示较高)'
    },
    {
      id: 'biasAdjustment',
      question: '5. 你认为辩题有没有优势持方？这对你的判决会有什么影响？你会为此主动调整心证么？',
      label: '心证调整 (1表示无，5表示较多)'
    },
    {
      id: 'consensusRevocable',
      question: '6. 双方选手在场上达成的共识重要吗？后续能不能被推翻？',
      label: '共识重要性 (1表示不能推翻，5表示可以推翻)'
    },
    {
      id: 'lateArgumentAcceptance',
      question: '7. 选手在后半场甚至后结辩新提出的论点、证据，会被你接受吗？',
      label: '接受程度 (1表示不接受，5表示完全接受)'
    },
    {
      id: 'ruleViolationSeverity',
      question: '8. 对你来说，辩论场上有"违规操作"吗？如果出现违规操作，会对你的判决造成怎样的影响？',
      label: '厌恶程度 (1表示很低，5表示较高)'
    }
  ];

  // Judge type options
  const judgeTypeOptions = [
    { value: 'debate', label: '辩论赛', icon: '🏆'},
    { value: 'mun', label: '模拟联合国', icon: '🌍'},
    { value: 'negotiation', label: '谈判比赛', icon: '🤝' },
    { value: 'academic', label: '学术竞赛', icon: '📚'},
    { value: 'case-competition', label: '案例分析', icon: '📊'},
    { value: 'other', label: '其他', icon: '📋'},
    ];

  const renderBasicInfo = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          基本信息
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            required
            label="姓名"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
          />

          <TextField
            required
            label="微信号"
            value={formData.wechatId}
            onChange={(e) => handleInputChange('wechatId', e.target.value)}
          />

          <TextField
            required
            label="手机号码"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />

          <TextField
            required
            label="每场比赛收费（教练为每小时收费）"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', Number(e.target.value))}
            InputProps={{
              startAdornment: '¥',
            }}
          />

          <TextField
            label="所在地"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="例如：北京"
          />

          <TextField
            label="教育背景"
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            placeholder="例如：北京大学法学院"
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            评委类型（可多选）
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {judgeTypeOptions.map((option) => (
              <Chip
                key={option.value}
                label={`${option.icon} ${option.label}`}
                onClick={() => {
                  const newTypes = formData.judgeTypes.includes(option.label)
                    ? formData.judgeTypes.filter(t => t !== option.label)
                    : [...formData.judgeTypes, option.label];
                  handleInputChange('judgeTypes', newTypes);
                }}
                color={formData.judgeTypes.includes(option.label) ? "primary" : "default"}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: formData.judgeTypes.includes(option.label) 
                      ? 'primary.dark' 
                      : 'action.hover'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="评委履历"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            placeholder="请详细描述您的评委经验、专业领域和成就"
          />
        </Box>


      </Box>
    );
  };

  const renderEvaluationForm = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          评审风格问卷
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {questions.map((q) => (
            <Card key={q.id} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {q.question}
              </Typography>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography gutterBottom>{q.label}</Typography>
                <Slider
                  value={formData[q.id as keyof JudgeFormData] as number}
                  onChange={(_, value) => handleInputChange(q.id as keyof JudgeFormData, value as number)}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              9. 有的时候会出现一方仅仅举出了推论，而另一方只有案例，或是只有数据的情况，这时候你会怎样判决?一般情况下，推论、数据和案例，何者更能说服你?为什么?
            </Typography>
            <TextField
              required
              fullWidth
              multiline
              rows={4}
              value={formData.winningCriteria}
              onChange={(e) => handleInputChange('winningCriteria', e.target.value)}
              placeholder="请详细说明您的判决标准和理念"
              sx={{ mt: 2 }}
              error={activeStep === 1 && formData.winningCriteria.length === 0}
              helperText={activeStep === 1 && formData.winningCriteria.length === 0 ? '此项为必填项' : ''}
            />
          </Card>

          <Card sx={{ p: 2 }}>
          {/* Winning Criteria */}
          <Typography variant="subtitle1" gutterBottom>
              10. 对你来说，辩论比赛的"赢"意味着什么？当你判一支队伍赢的时候，往往意味着他们是怎样的队伍？你认为以此作为判准对于辩论有什么意义？ <span style={{ color: '#d32f2f' }}>*</span>
            </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="judgingCriteria"
            value={formData.judgingCriteria}
            onChange={(e) => handleInputChange('judgingCriteria', e.target.value)}
            error={activeStep === 1 && !formData.judgingCriteria}
            helperText={activeStep === 1 && !formData.judgingCriteria ? '此项为必填项' : ''}
            sx={{ mb: 3 }}
          />
           </Card>

           <Card sx={{ p: 2 }}>
          {/* Topic Bias Response */}
          <Typography variant="subtitle1" gutterBottom>
          11. 辩题优势方的影响 - 你认为辩题有没有优势持方？这对你的判决会有什么影响？你会为此主动调整心证么？ <span style={{ color: '#d32f2f' }}>*</span>
            </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="topicBiasResponse"
            value={formData.topicBiasResponse || ''}
            onChange={(e) => handleInputChange('topicBiasResponse', e.target.value)}
            error={activeStep === 1 && !formData.topicBiasResponse}
            helperText={activeStep === 1 && !formData.topicBiasResponse ? '此项为必填项' : ''}
            sx={{ mb: 3 }}
          />
          </Card>

         <Card sx={{ p: 2}}>
          {/* Argument Type Preference */}
          <Typography variant="subtitle1" gutterBottom>
          12. 论证方式偏好 - 有的时候会出现一方仅仅举出了推论，而另一方只有案例，或是只有数据的情况，这时候你会怎样判决？一般情况下，推论、数据和案例，何者更能说服你？为什么？ <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="argumentTypePreference"
            value={formData.argumentTypePreference || ''}
            onChange={(e) => handleInputChange('argumentTypePreference', e.target.value)}
            error={activeStep === 1 && !formData.argumentTypePreference}
            helperText={activeStep === 1 && !formData.argumentTypePreference ? '此项为必填项' : ''}
            sx={{ mb: 3 }}
          />
          </Card>
          <Card sx={{ p: 2 }}>
          {/* Additional Comments */}
          <Typography variant="subtitle1" gutterBottom>
          13. 补充说明 <span style={{ color: '#d32f2f' }}>*</span>
          </Typography>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="comments"
            value={formData.comments || ''}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            error={activeStep === 1 && !formData.comments}
            helperText={activeStep === 1 && !formData.comments ? '此项为必填项' : ''}
            sx={{ mb: 3 }}
          />
          </Card>
        </Box>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderEvaluationForm();
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
          background: '#000000',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ width: 40, height: 40, marginRight: 16 }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              评委注册
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              加入我们的评委团队，为比赛增添专业价值
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
              {loading ? '提交中...' : '提交申请'}
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

export default JudgeProfile; 