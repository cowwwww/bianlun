import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addTopic } from '../services/topicService';

const AddTopic = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    text: '',
    explanation: '',
    area: '',
    language: '',
    tournament: '',
    ratings: {},
    averageRating: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 话题分类
  const categories = [
    { value: 'love', label: '爱情关系'},
    { value: 'technology', label: '科技创新' },
    { value: 'politics', label: '政治社会'},
    { value: 'education', label: '教育学习' },
    { value: 'economy', label: '经济商业' },
    { value: 'environment', label: '环境生态' },
    { value: 'culture', label: '文化艺术' },
    { value: 'ethics', label: '道德伦理' },
    { value: 'health', label: '健康医疗' },
    { value: 'sports', label: '体育竞技'},
    { value: 'other', label: '其他'},
  ];

  // 语言类型
  const languages = [
    { value: 'chinese', label: '中文'},
    { value: 'english', label: 'English'},
    { value: 'bilingual', label: '双语' },
  ];

  // 赛事类型
  const tournaments = [
    { value: 'ada-debate', label: 'ADA辩论赛' },
    { value: 'xinguobian', label: '新国辩' },
    { value: 'huayu-worldcup', label: '华语辩论世界杯' },
    { value: 'parliamentary', label: '议会制辩论' },
    { value: 'bp-style', label: 'BP赛制' },
    { value: 'asian-style', label: '亚洲赛制' },
    { value: 'worlds', label: 'Worlds' },
    { value: 'apda', label: 'APDA' },
    { value: 'custom', label: '自定义' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.text && formData.area;
      case 1:
        return formData.language && formData.tournament;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.text || !formData.area) {
      setError('请填写必填项');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newTopic = {
        text: formData.text.trim(),
        explanation: formData.explanation.trim(),
        area: formData.area,
        language: formData.language,
        tournament: formData.tournament,
        ratings: null,
        averageRating: 0,
      };
      
      await addTopic(newTopic);
      navigate('/topics');
    } catch (err) {
      console.error('Error adding topic:', err);
      setError('添加辩题失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['基本信息', '赛事设置'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
  return (
          <>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                辩题/议题 <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                rows={4}
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                placeholder="请输入辩题内容"
                error={activeStep === 0 && !formData.text}
                helperText={activeStep === 0 && !formData.text ? '此项为必填项' : ''}
              />
            </Card>

            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                题解
        </Typography>
            <TextField
              fullWidth
                multiline
                rows={4}
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                placeholder="请输入题解内容（选填）"
                helperText="可以添加对辩题的解释、背景信息或相关资料"
              />
            </Card>

            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                话题分类 <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <FormControl fullWidth error={activeStep === 0 && !formData.area}>
                <InputLabel>选择分类</InputLabel>
                <Select
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  label="选择分类"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
                {activeStep === 0 && !formData.area && (
                  <Typography color="error" variant="caption">此项为必填项</Typography>
                )}
              </FormControl>
            </Card>
          </>
        );

      case 1:
        return (
          <>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                语言类型 <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <FormControl fullWidth error={activeStep === 1 && !formData.language}>
                <InputLabel>选择语言</InputLabel>
                <Select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  label="选择语言"
                >
                  {languages.map((language) => (
                    <MenuItem key={language.value} value={language.value}>
                      {language.label}
                    </MenuItem>
                  ))}
                </Select>
                {activeStep === 1 && !formData.language && (
                  <Typography color="error" variant="caption">此项为必填项</Typography>
                )}
              </FormControl>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                赛事类型 <span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <FormControl fullWidth error={activeStep === 1 && !formData.tournament}>
                <InputLabel>选择赛事</InputLabel>
              <Select
                  value={formData.tournament}
                  onChange={(e) => handleInputChange('tournament', e.target.value)}
                  label="选择赛事"
                >
                  {tournaments.map((tournament) => (
                    <MenuItem key={tournament.value} value={tournament.value}>
                      {tournament.label}
                    </MenuItem>
                ))}
              </Select>
                {activeStep === 1 && !formData.tournament && (
                  <Typography color="error" variant="caption">此项为必填项</Typography>
                )}
            </FormControl>
            </Card>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          添加辩题
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            上一步
          </Button>
          <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/topics')}
              sx={{ mr: 1 }}
              >
              取消
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || !isStepValid(activeStep)}
              >
                {submitting ? '提交中...' : '提交'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                下一步
              </Button>
            )}
          </Box>
            </Box>
        </Paper>
    </Container>
  );
};

export default AddTopic; 