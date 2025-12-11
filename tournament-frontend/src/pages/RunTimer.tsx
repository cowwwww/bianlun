import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getTimerProjectById, type TimerProject } from '../services/timerService';

const RunTimer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<TimerProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in milliseconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  useEffect(() => {
    if (project && project.type === 'countdown' && project.duration) {
      setTime(project.duration * 1000);
    }
  }, [project]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (project?.type === 'countdown') {
            const newTime = prevTime - 10;
            if (newTime <= 0) {
              handleStop();
              return 0;
            }
            return newTime;
          } else {
            return prevTime + 10;
          }
        });
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, project]);

  const loadProject = async () => {
    if (!id) return;
    
    try {
      const data = await getTimerProjectById(id);
      setProject(data);
    } catch (error) {
      console.error('Error loading timer project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (project?.type === 'countdown' && project.duration) {
      setTime(project.duration * 1000);
    } else {
      setTime(0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0'),
    };
  };

  const timeDisplay = formatTime(time);
  const isTimeWarning = project?.type === 'countdown' && time < 30000 && time > 0;
  const isTimeUp = project?.type === 'countdown' && time === 0;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>加载中...</Typography>
        </Paper>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            计时器项目未找到
          </Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/projects')}
            sx={{ mt: 2 }}
          >
            返回列表
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: isFullscreen ? '100vh' : 'auto',
        bgcolor: isFullscreen ? '#000' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {!isFullscreen && (
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/projects')}
            sx={{ mb: 3 }}
          >
            返回列表
          </Button>
        )}

        <Paper
          sx={{
            p: isFullscreen ? 8 : 4,
            textAlign: 'center',
            bgcolor: isTimeUp ? '#f44336' : isTimeWarning ? '#ff9800' : 'background.paper',
            color: (isTimeWarning || isTimeUp) ? 'white' : 'text.primary',
            transition: 'all 0.3s ease',
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box>
              <Typography
                variant={isFullscreen ? 'h3' : 'h4'}
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                {project.name}
              </Typography>
              <Chip
                label={project.type === 'countdown' ? '倒计时' : '正计时'}
                color={project.type === 'countdown' ? 'primary' : 'success'}
                size={isFullscreen ? 'medium' : 'small'}
              />
            </Box>

            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: isFullscreen ? '8rem' : '4rem',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                my: 4,
              }}
            >
              {timeDisplay.hours}:{timeDisplay.minutes}:{timeDisplay.seconds}
              <Box
                component="span"
                sx={{
                  fontSize: isFullscreen ? '4rem' : '2rem',
                  opacity: 0.7,
                }}
              >
                .{timeDisplay.milliseconds}
              </Box>
            </Box>

            {isTimeUp && (
              <Typography variant={isFullscreen ? 'h3' : 'h5'} sx={{ fontWeight: 'bold' }}>
                时间到！
              </Typography>
            )}

            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={handlePlayPause}
                sx={{
                  bgcolor: isRunning ? 'warning.main' : 'primary.main',
                  color: 'white',
                  width: isFullscreen ? 80 : 64,
                  height: isFullscreen ? 80 : 64,
                  '&:hover': {
                    bgcolor: isRunning ? 'warning.dark' : 'primary.dark',
                  },
                }}
              >
                {isRunning ? (
                  <PauseIcon sx={{ fontSize: isFullscreen ? 48 : 32 }} />
                ) : (
                  <PlayIcon sx={{ fontSize: isFullscreen ? 48 : 32 }} />
                )}
              </IconButton>

              <IconButton
                onClick={handleStop}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  width: isFullscreen ? 80 : 64,
                  height: isFullscreen ? 80 : 64,
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <StopIcon sx={{ fontSize: isFullscreen ? 48 : 32 }} />
              </IconButton>

              <IconButton
                onClick={toggleFullscreen}
                sx={{
                  bgcolor: 'grey.700',
                  color: 'white',
                  width: isFullscreen ? 80 : 64,
                  height: isFullscreen ? 80 : 64,
                  '&:hover': {
                    bgcolor: 'grey.800',
                  },
                }}
              >
                {isFullscreen ? (
                  <FullscreenExitIcon sx={{ fontSize: isFullscreen ? 48 : 32 }} />
                ) : (
                  <FullscreenIcon sx={{ fontSize: isFullscreen ? 48 : 32 }} />
                )}
              </IconButton>
            </Stack>

            {!isFullscreen && project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {project.description}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default RunTimer;
