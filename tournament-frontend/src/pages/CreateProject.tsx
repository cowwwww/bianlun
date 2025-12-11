import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTimerProject } from '../services/timerService';
import { auth } from '../services/authService';

const CreateProject = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'countdown' | 'stopwatch'>('stopwatch');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('请输入计时器名称');
      return;
    }

    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      setError('请先登录');
      return;
    }

    try {
      setLoading(true);
      
      const duration = type === 'countdown' 
        ? parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
        : 0;

      if (type === 'countdown' && duration <= 0) {
        setError('倒计时时长必须大于0');
        return;
      }

      await createTimerProject({
        name: name.trim(),
        description: description.trim(),
        type,
        duration,
        createdBy: currentUser.id,
      });

      navigate('/projects');
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 3 }}
      >
        返回列表
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          创建计时器项目
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="计时器名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="例如：演讲练习计时器"
            />

            <TextField
              label="描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="简要描述这个计时器的用途"
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">计时器类型</FormLabel>
              <RadioGroup
                value={type}
                onChange={(e) => setType(e.target.value as 'countdown' | 'stopwatch')}
              >
                <FormControlLabel
                  value="stopwatch"
                  control={<Radio />}
                  label="正计时 - 从0开始向上计时"
                />
                <FormControlLabel
                  value="countdown"
                  control={<Radio />}
                  label="倒计时 - 从设定时间向下计时"
                />
              </RadioGroup>
            </FormControl>

            {type === 'countdown' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  设置倒计时时长
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="小时"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    inputProps={{ min: 0, max: 23 }}
                    sx={{ width: '100px' }}
                  />
                  <TextField
                    label="分钟"
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    inputProps={{ min: 0, max: 59 }}
                    sx={{ width: '100px' }}
                  />
                  <TextField
                    label="秒"
                    type="number"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    inputProps={{ min: 0, max: 59 }}
                    sx={{ width: '100px' }}
                  />
                </Stack>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/projects')}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? '创建中...' : '创建计时器'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProject;
