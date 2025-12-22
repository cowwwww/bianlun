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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createResource } from '../services/resourceService';
import { auth } from '../services/authService';

interface ResourceFormData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  topic: string;
  // File Info
  file: File | null;
  fileType: string;
  fileSize: number;
  fileName: string;
}

const AddResource: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    description: '',
    category: '',
    topic: '',
    file: null,
    fileType: '',
    fileSize: 0,
    fileName: '',
  });

  const steps = [
    { label: '基本信息', icon: <DescriptionIcon /> },
    { label: '文件上传', icon: <CloudUploadIcon /> },
    { label: '确认提交', icon: <CheckIcon /> },
  ];

  // 资源分类配置
  const categoryOptions = [
    { value: '', label: '全部分类', icon: '📋' },
    { value: 'transcript', label: '赛事转写', icon: '📝' },
    { value: 'resource-pack', label: '资料包', icon: '📦' },
    { value: 'first-debate', label: '一辩稿', icon: '1️⃣' },
    { value: 'second-debate', label: '二辩稿', icon: '2️⃣' },
    { value: 'third-debate', label: '三辩稿', icon: '3️⃣' },
    { value: 'fourth-debate', label: '四辩稿', icon: '4️⃣' },
    { value: 'experience-sharing', label: '经验分享/辩论课程', icon: '💡' },
    { value: 'other', label: '其他', icon: '📁' },
  ];

  const handleInputChange = (field: keyof ResourceFormData, value: string | boolean | File | null | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
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
    if (!formData.file || !formData.category || !formData.description) {
      setError('请填写所有必填字段并上传文件');
      return;
    }

    // Check if user is authenticated
    if (!auth.getCurrentUser()) {
      setError('请先登录再上传资源');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(formData.fileType)) {
      setError('请只上传 PDF、DOC、DOCX 或 TXT 文件');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (formData.fileSize > maxSize) {
      setError('文件大小必须小于 10MB');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await createResource({
        title: formData.title || formData.fileName,
        description: formData.description,
        category: formData.category,
        topic: formData.topic,
        file: formData.file,
      });
      navigate('/resources');
    } catch (err) {
      console.error('Error uploading file: ', err);
      setError('上传文件时出错，请重试');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.title && formData.description && formData.category && formData.topic;
      case 1:
        return !!formData.file;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderBasicInfo = () => {
  return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          资源基本信息
          </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            required
            label="资源标题"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="给您的资源起个吸引人的标题"
          />

          <FormControl required fullWidth>
            <InputLabel>资源类别</InputLabel>
                  <Select
              value={formData.category}
              label="资源类别"
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </MenuItem>
              ))}
                  </Select>
                </FormControl>

                <TextField
                  required
            label="主题"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="例如：辩题、比赛名称等"
                />

          <TextField
            required
            label="资源描述"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="详细描述资源内容和用途"
            multiline
            rows={4}
            sx={{ gridColumn: { md: 'span 2' } }}
          />
        </Box>
      </Box>
    );
  };

  const renderFileUpload = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          上传文件
        </Typography>

        <Box 
                  sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 3, 
            textAlign: 'center',
            mb: 3,
            backgroundColor: formData.file ? 'rgba(0, 200, 83, 0.04)' : 'transparent',
            borderColor: formData.file ? 'rgba(0, 200, 83, 0.5)' : '#ccc',
          }}
        >
                  <input
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            style={{ display: 'none' }}
            id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
          <label htmlFor="file-upload">
                <Button
                  variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
                >
              选择文件
                </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
            支持 PDF、DOC、DOCX、TXT 文件，大小不超过 10MB
          </Typography>
        </Box>

        {formData.file && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                已选择文件
              </Typography>
              <Typography variant="body1">{formData.fileName}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  类型: {formData.fileType.split('/')[1].toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  大小: {(formData.fileSize / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Stack>
            </Box>
          </Card>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          上传的文件将被公开分享，请确保您拥有文件的分享权限。
        </Alert>
      </Box>
    );
  };

  const renderConfirmation = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          确认资源信息
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  资源标题
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formData.title || formData.fileName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  资源类别
                  </Typography>
                <Typography variant="body1">
                  {categoryOptions.find(c => c.value === formData.category)?.icon} {' '}
                  {categoryOptions.find(c => c.value === formData.category)?.label}
                  </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  主题
                  </Typography>
                <Typography variant="body1">{formData.topic}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  资源描述
                </Typography>
                <Typography variant="body1">{formData.description}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  文件
                </Typography>
                <Typography variant="body1">{formData.fileName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  类型: {formData.fileType.split('/')[1].toUpperCase()} | 
                  大小: {(formData.fileSize / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            </Stack>
          </Box>
              </Card>

        <Alert severity="warning" sx={{ mb: 2 }}>
          提交后，此资源将在审核通过后发布。请确认上述信息无误。
        </Alert>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderFileUpload();
      case 2:
        return renderConfirmation();
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
              上传资源
                    </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              分享您的辩论资料，为社区做出贡献
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
              {loading ? '上传中...' : '提交资源'}
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

export default AddResource; 