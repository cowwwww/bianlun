import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  // Chip,
  IconButton,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTimerProjects, type TimerProject } from '../services/timerService';

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<TimerProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getTimerProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading timer projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // const formatDuration = (seconds: number) => {
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const secs = seconds % 60;
  //   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  // };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            计时器中心
          </Typography>
          <Typography variant="body1" color="text.secondary">
            管理您的所有计时器项目
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-project')}
          size="large"
        >
          创建新计时器
        </Button>
      </Box>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>加载中...</Typography>
        </Paper>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TimerIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            还没有计时器项目
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            创建您的第一个计时器项目，开始管理您的时间
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-project')}
          >
            创建计时器
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  border: '1px solid #eef2f5',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimerIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {project.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description || '暂无描述'}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-start', px: 2, pb: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/run-timer/${project.id}`)}
                    title="运行计时器"
                  >
                    <PlayIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProjectList;
