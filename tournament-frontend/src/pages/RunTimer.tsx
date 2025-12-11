import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Collapse, IconButton, Card, Divider, keyframes, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Cropper from 'react-easy-crop';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Slider from '@mui/material/Slider';
import type { Area } from 'react-easy-crop';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import pb from '../services/pocketbase';

// Add keyframe animation
const pulseAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
`;

interface TimerStep {
  id: string;
  type?: string;
  label: string;
  duration: number; // duration in seconds
  isDualTimer?: boolean;
}

interface Project {
  id: string;
  projectName: string;
  backgroundImage?: string;
  backgroundColor: string;
  textColor: string;
  activeTimerColor?: string;
  isPublic: boolean;
  timerSteps: TimerStep[];
}

// Add colorPresets array after other constants
const colorPresets = [
  { bg: '#1976d2', text: '#ffffff', name: '经典蓝' },
  { bg: '#000000', text: '#ffffff', name: '纯黑' },
  { bg: '#ffffff', text: '#000000', name: '纯白' },
  { bg: '#f57c00', text: '#ffffff', name: '温暖橙' },
  { bg: '#2196f3', text: '#ffffff', name: '天空蓝' },
  { bg: '#ffa726', text: '#000000', name: '明亮黄' },
  { bg: '#0d47a1', text: '#ffffff', name: '深邃蓝' },
  { bg: '#ffb74d', text: '#000000', name: '金黄' },
];

// Helper to get cropped image as blob
async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous'; // Add this to handle cross-origin issues
    
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No 2d context available'));
          return;
        }
        
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        reject(error);
      }
    };
    
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    image.src = imageSrc;
  });
}

const RunTimer = () => {
  const { id } = useParams<{ id: string }>(); // Get project ID from URL
  const location = useLocation();
  const locationState = (location.state as { project?: Project; isTemp?: boolean } | null) || null;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for run-specific inputs
  const [debateRound, setDebateRound] = useState('');
  const [positiveTeam, setPositiveTeam] = useState('');
  const [negativeTeam, setNegativeTeam] = useState('');
  const [judge1, setJudge1] = useState('');
  const [judge2, setJudge2] = useState('');
  const [judge3, setJudge3] = useState('');
  const [positiveTeamLogo, setPositiveTeamLogo] = useState<string | null>(null);
  const [negativeTeamLogo, setNegativeTeamLogo] = useState<string | null>(null);

  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState('Select a project');

  // Dual Timer state (for 对辩)
  const [timeRemaining2, setTimeRemaining2] = useState(0);
  const [activeTimer, setActiveTimer] = useState(1); // 1 or 2

  // State for adding/subtracting time
  const [timeAdjustmentSeconds, setTimeAdjustmentSeconds] = useState<string>('10'); // Default to 10 seconds
  const intervalRef1 = useRef<number | null>(null);
  const intervalRef2 = useRef<number | null>(null);
  const warningPlayedRef = useRef(false);
  const finishedPlayedRef = useRef(false);
  const warningSoundRef = useRef<HTMLAudioElement | null>(null);
  const finishedSoundRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);
  const audioSourcePathRef = useRef<string | null>(null);
  const [soundMode, setSoundMode] = useState<'bell' | 'beep' | 'custom'>('bell');
  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(null);
  const audioCandidates = ['/end.wav', '/end (1).wav', '/end%20(1).wav'];
  const before1Ref = useRef<HTMLAudioElement | null>(null);
  const before2Ref = useRef<HTMLAudioElement | null>(null);
  const after1Ref = useRef<HTMLAudioElement | null>(null);
  const after2Ref = useRef<HTMLAudioElement | null>(null);

  const playBeep = (times = 1, freq = 880, duration = 0.25) => {
    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const startTime = ctx.currentTime;
      for (let i = 0; i < times; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t = startTime + i * (duration + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.0, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      }
    } catch (_) {
      // ignore fallback errors
    }
  };

  // State for showing/hiding run settings
  const [showRunSettings, setShowRunSettings] = useState(true);

  // Add appearance settings state
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [activeTimerColor, setActiveTimerColor] = useState('#1e88e5');

  // Add background image state
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);

  // Add state for cropping dialog and image
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Add fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Add state for logo cropping
  const [logoType, setLogoType] = useState<'positive' | 'negative' | null>(null);
  const [cropLogoDialogOpen, setCropLogoDialogOpen] = useState(false);
  const [selectedLogoImage, setSelectedLogoImage] = useState<File | null>(null);
  const [logoCrop, setLogoCrop] = useState({ x: 0, y: 0 });
  const [logoZoom, setLogoZoom] = useState(1);
  const [croppedLogoAreaPixels, setCroppedLogoAreaPixels] = useState<Area | null>(null);

  // Add state for timer completion notification
  const [showTimeUpMessage, setShowTimeUpMessage] = useState(false);

  // Fullscreen handlers
  const handleEnterFullscreen = () => {
    if (timerContainerRef.current) {
      if (timerContainerRef.current.requestFullscreen) {
        timerContainerRef.current.requestFullscreen();
      } else if ('webkitRequestFullscreen' in timerContainerRef.current) {
        (timerContainerRef.current as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };
  const handleExitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ('webkitExitFullscreen' in document) {
      (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };
  // Listen for fullscreen change to update state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Effect to fetch project data from PocketBase or use temp project from navigation state
  useEffect(() => {
    const fetchProject = async () => {
      // If a temp project is provided via navigation state, use it directly
      if (locationState?.project) {
        const tempProject = locationState.project;
        setProject(tempProject);
        setBackgroundColor(tempProject.backgroundColor);
        setTextColor(tempProject.textColor);
        if (tempProject.activeTimerColor) setActiveTimerColor(tempProject.activeTimerColor);
        if (tempProject.backgroundImage) setBackgroundImage(tempProject.backgroundImage);

        if (tempProject.timerSteps.length > 0) {
          const initialStep = tempProject.timerSteps[0];
          setCurrentStepLabel(initialStep.label);
          setTimeRemaining(initialStep.duration);
          if (initialStep.isDualTimer) {
            setTimeRemaining2(initialStep.duration);
            setActiveTimer(1);
          } else {
            setTimeRemaining2(0);
            setActiveTimer(0);
          }
        } else {
          setCurrentStepLabel('No steps defined');
          setTimeRemaining(0);
          setTimeRemaining2(0);
          setActiveTimer(0);
        }
        setLoading(false);
        return;
      }

      if (!id) {
        setError('No project ID provided');
        setLoading(false);
        return;
      }

      try {
        const record = await pb.collection('timers').getOne(id);

        const timerSteps = Array.isArray(record.timerSteps) ? record.timerSteps as TimerStep[] : [];
        const mapped: Project = {
          id: record.id,
          projectName: record.name || '未命名计时器',
          backgroundImage: record.backgroundImage || undefined,
          backgroundColor: record.backgroundColor || '#ffffff',
          textColor: record.textColor || '#000000',
          activeTimerColor: record.activeTimerColor || '#1e88e5',
          isPublic: !!record.isPublic,
          timerSteps,
        };

        setProject(mapped);
        setBackgroundColor(mapped.backgroundColor);
        setTextColor(mapped.textColor);
        if (mapped.activeTimerColor) setActiveTimerColor(mapped.activeTimerColor);
        if (mapped.backgroundImage) setBackgroundImage(mapped.backgroundImage);

        if (mapped.timerSteps.length > 0) {
          const initialStep = mapped.timerSteps[0];
          setCurrentStepLabel(initialStep.label);
          setTimeRemaining(initialStep.duration);
          if (initialStep.isDualTimer) {
            setTimeRemaining2(initialStep.duration);
            setActiveTimer(1);
          } else {
            setTimeRemaining2(0);
            setActiveTimer(0);
          }
        } else {
          setCurrentStepLabel('No steps defined');
          setTimeRemaining(0);
          setTimeRemaining2(0);
          setActiveTimer(0);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const resetAudioRefs = () => {
    warningSoundRef.current = null;
    finishedSoundRef.current = null;
    audioBlobUrlRef.current = null;
    audioSourcePathRef.current = null;
  };

  const handleCustomSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomSoundUrl(url);
    setSoundMode('custom');
    resetAudioRefs();
  };

  const handlePausePromptSound = () => {
    if (soundMode === 'beep') return;
    if (warningSoundRef.current) {
      warningSoundRef.current.pause();
    }
    if (finishedSoundRef.current) {
      finishedSoundRef.current.pause();
    }
  };

  const playTrack = (ref: React.MutableRefObject<HTMLAudioElement | null>, src: string) => {
    if (!ref.current) {
      ref.current = new Audio(src);
    }
    ref.current.currentTime = 0;
    ref.current.play().catch(() => playBeep(1));
  };

  const pauseTrack = (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (ref.current) {
      ref.current.pause();
    }
  };

  const loadAudio = async () => {
    if (soundMode === 'beep') return null;
    // custom sound
    if (soundMode === 'custom') {
      if (!customSoundUrl) throw new Error('no custom sound');
      if (audioBlobUrlRef.current !== customSoundUrl || !warningSoundRef.current || !finishedSoundRef.current) {
        resetAudioRefs();
        audioBlobUrlRef.current = customSoundUrl;
        audioSourcePathRef.current = 'custom-upload';
        warningSoundRef.current = new Audio(customSoundUrl);
        warningSoundRef.current.preload = 'auto';
        warningSoundRef.current.volume = 1;
        finishedSoundRef.current = new Audio(customSoundUrl);
        finishedSoundRef.current.preload = 'auto';
        finishedSoundRef.current.volume = 1;
      }
      return customSoundUrl;
    }

    // bell default: fetch from candidates
    if (audioBlobUrlRef.current && warningSoundRef.current && finishedSoundRef.current) {
      return audioBlobUrlRef.current;
    }
    let lastErr: unknown = null;
    for (const path of audioCandidates) {
      try {
        const res = await fetch(path);
        if (!res.ok) {
          lastErr = new Error(`fetch ${path} -> ${res.status}`);
          continue;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioBlobUrlRef.current = url;
        audioSourcePathRef.current = path;
        warningSoundRef.current = new Audio(url);
        warningSoundRef.current.preload = 'auto';
        warningSoundRef.current.volume = 1;
        warningSoundRef.current.muted = false;
        warningSoundRef.current.crossOrigin = 'anonymous';
        finishedSoundRef.current = new Audio(url);
        finishedSoundRef.current.preload = 'auto';
        finishedSoundRef.current.volume = 1;
        finishedSoundRef.current.muted = false;
        finishedSoundRef.current.crossOrigin = 'anonymous';
        console.info('Timer sound loaded from', path);
        return url;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('audio fetch failed');
  };

  useEffect(() => {
    warningPlayedRef.current = false;
    finishedPlayedRef.current = false;
    loadAudio().catch(() => {});
  }, [currentStepIndex, project]);

   // Timer effect (handles both timers)
  useEffect(() => {
    if (isActive && !isPaused) {
      const currentStep = project?.timerSteps[currentStepIndex];

      if (currentStep?.isDualTimer) {
        // Dual timer logic
        if (activeTimer === 1) {
            intervalRef1.current = window.setInterval(() => {
                setTimeRemaining((time) => Math.max(0, time - 1));
            }, 1000);
            if (intervalRef2.current) clearInterval(intervalRef2.current);
        } else if (activeTimer === 2) {
             intervalRef2.current = window.setInterval(() => {
                setTimeRemaining2((time) => Math.max(0, time - 1));
            }, 1000);
            if (intervalRef1.current) clearInterval(intervalRef1.current);
        }
      } else {
        // Single timer logic
         intervalRef1.current = window.setInterval(() => {
            setTimeRemaining((time) => Math.max(0, time - 1));
        }, 1000);
        if (intervalRef2.current) clearInterval(intervalRef2.current);
      }
    } else {
      // Pause or not active, clear all intervals
      if (intervalRef1.current) clearInterval(intervalRef1.current);
      if (intervalRef2.current) clearInterval(intervalRef2.current);
    }

    return () => {
      if (intervalRef1.current) clearInterval(intervalRef1.current);
      if (intervalRef2.current) clearInterval(intervalRef2.current);
    };
  }, [isActive, isPaused, activeTimer, currentStepIndex, project]); // Added dependencies

  // Effect to handle step completion (no auto-advance)
  useEffect(() => {
    if (!isActive || !project || project.timerSteps.length === 0) return;
    const currentStep = project.timerSteps[currentStepIndex];
    if (!currentStep) return;

    const stopTimers = () => {
      setIsActive(false);
      setIsPaused(false);
      if (intervalRef1.current) clearInterval(intervalRef1.current);
      if (intervalRef2.current) clearInterval(intervalRef2.current);
      setShowTimeUpMessage(true);
      setTimeout(() => setShowTimeUpMessage(false), 5000);
      setActiveTimer(0);
    };

    if (currentStep.isDualTimer) {
      if (timeRemaining <= 0 && timeRemaining2 <= 0) {
        stopTimers();
      }
    } else {
      if (timeRemaining <= 0) {
        stopTimers();
      }
    }
  }, [timeRemaining, timeRemaining2, isActive, currentStepIndex, project]);

  const playSound = (audio: HTMLAudioElement | null, times: number) => {
    if (!audio) return;
    if (soundMode === 'beep') {
      playBeep(times);
      return;
    }
    // ensure we start from beginning
    const playOnce = () => {
      try {
        audio.load();
      } catch (err) {
        void err;
      }
      audio.currentTime = 0;
      audio.play().catch(() => {
        playBeep(1);
      });
    };
    playOnce();
    if (times > 1) {
      setTimeout(playOnce, 350);
    }
  };

  const handleTestSound = async () => {
    try {
      const src = await loadAudio();
      playSound(warningSoundRef.current, 1);
      console.info('Playing test sound from', audioSourcePathRef.current || src || soundMode);
    } catch (_err) {
      playBeep(1);
      alert('音频加载失败，请确认 /public/end.wav 存在，或使用自定义上传；同时检查浏览器/系统静音。');
    }
  };

  // Warning and finish sounds
  useEffect(() => {
    if (!isActive || isPaused || !project) return;
    const currentStep = project.timerSteps[currentStepIndex];
    if (!currentStep) return;

    const times = currentStep.isDualTimer ? [timeRemaining, timeRemaining2] : [timeRemaining];
    const positives = times.filter((t) => t > 0);
    const minPositive = positives.length ? Math.min(...positives) : null;
    const allZero = times.every((t) => t <= 0);

    if (!warningPlayedRef.current && minPositive !== null && minPositive <= 30) {
      loadAudio()
        .then(() => {
          playSound(warningSoundRef.current, 1);
          warningPlayedRef.current = true;
        })
        .catch(() => {
          playBeep(1);
        });
    }

    if (!finishedPlayedRef.current && allZero) {
      loadAudio()
        .then(() => {
          playSound(finishedSoundRef.current, 2);
          finishedPlayedRef.current = true;
        })
        .catch(() => {
          playBeep(2);
        });
    }
  }, [timeRemaining, timeRemaining2, isActive, isPaused, currentStepIndex, project]);


  const handleStartPauseResume = () => {
    if (!isActive) {
        // Starting the timer from CURRENT step, not step 0
        if (project && project.timerSteps.length > 0) {
             setIsActive(true);
             setIsPaused(false);
             // Use current step instead of always going to 0
             const currentStep = project.timerSteps[currentStepIndex];
             setCurrentStepLabel(currentStep.label);
             // Only reset time if it's already at 0, otherwise continue from current time
             if (timeRemaining === 0) {
                 setTimeRemaining(currentStep.duration);
             }
             if (currentStep.isDualTimer) {
                 if (timeRemaining2 === 0) {
                     setTimeRemaining2(currentStep.duration);
                 }
                 if (activeTimer === 0) {
                     setActiveTimer(1); // Start with timer 1 active for dual
                 }
             } else {
                 setTimeRemaining2(0);
                 setActiveTimer(0);
             }
        }
    } else if (isPaused) {
        // Resuming the timer
        setIsPaused(false);
    } else {
        // Pausing the timer
        setIsPaused(true);
    }
  };

   const handleSwitchTimers = () => {
        const currentStep = project?.timerSteps[currentStepIndex];
        if (currentStep?.isDualTimer) {
             if (!isActive) {
                 // If timer is not active, start it and set to timer 2
                 setIsActive(true);
                 setIsPaused(false);
                 // Ensure timeRemaining and timeRemaining2 are set for the current step
                 setTimeRemaining(currentStep.duration);
                 setTimeRemaining2(currentStep.duration);
                 setActiveTimer(2);
             } else {
                 // If timer is active or paused, just switch the active timer
                 setActiveTimer(prev => (prev === 1 ? 2 : 1));
             }
        }
   };

  const handleResetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setTimeRemaining(project?.timerSteps[0]?.duration || 0);
    setCurrentStepLabel(project?.timerSteps[0]?.label || 'Select a project');
     setTimeRemaining2(project?.timerSteps[0]?.isDualTimer ? project?.timerSteps[0]?.duration || 0 : 0);
     setActiveTimer(project?.timerSteps[0]?.isDualTimer ? 1 : 0);

    if (intervalRef1.current) clearInterval(intervalRef1.current);
    if (intervalRef2.current) clearInterval(intervalRef2.current);
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0 && project) {
        const prevStepIndex = currentStepIndex - 1;
        const prevStep = project.timerSteps[prevStepIndex];
        setIsActive(false); // Stop timer
        setIsPaused(false); // Reset paused state
        setCurrentStepIndex(prevStepIndex);
        setTimeRemaining(prevStep.duration);
        setCurrentStepLabel(prevStep.label);
        if (prevStep.isDualTimer) {
            setTimeRemaining2(prevStep.duration);
            setActiveTimer(1); // Reset to timer 1 for the previous dual step
        } else {
            setTimeRemaining2(0);
            setActiveTimer(0);
        }
         if (intervalRef1.current) clearInterval(intervalRef1.current);
         if (intervalRef2.current) clearInterval(intervalRef2.current);
    }
  };

  const handleNextStep = () => {
    if (project && currentStepIndex < project.timerSteps.length - 1) {
        const nextStepIndex = currentStepIndex + 1;
        const nextStep = project.timerSteps[nextStepIndex];
         setIsActive(false); // Stop timer
         setIsPaused(false); // Reset paused state
        setCurrentStepIndex(nextStepIndex);
        setTimeRemaining(nextStep.duration);
        setCurrentStepLabel(nextStep.label);
         if (nextStep.isDualTimer) {
             setTimeRemaining2(nextStep.duration);
             setActiveTimer(1); // Reset to timer 1 for the next dual step
         } else {
             setTimeRemaining2(0);
             setActiveTimer(0);
         }
         if (intervalRef1.current) clearInterval(intervalRef1.current);
         if (intervalRef2.current) clearInterval(intervalRef2.current);
    }
  };

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent shortcuts from interfering with input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'a':
        case 'A':
          handleStartPauseResume();
          break;
        case 's':
        case 'S':
          handleSwitchTimers();
          break;
        case 'd':
        case 'D':
          handleResetTimer();
          break;
        case 'ArrowLeft':
          handlePreviousStep();
          break;
        case 'ArrowRight':
          handleNextStep();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleStartPauseResume, handleSwitchTimers, handleResetTimer, handlePreviousStep, handleNextStep]); // Depend on handler functions

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

   const handleTeamLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, team: 'positive' | 'negative') => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            event.target.value = ''; // Reset file input
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('图片文件大小不能超过5MB');
            event.target.value = ''; // Reset file input
            return;
        }

        setSelectedLogoImage(file);
        setLogoType(team);
        setCropLogoDialogOpen(true);
        
        // Reset the file input value to allow selecting the same file again
        event.target.value = '';
   };

   const handleAddTime = () => {
        const seconds = parseInt(timeAdjustmentSeconds, 10);
        if (!isNaN(seconds) && seconds > 0) {
            const currentStep = project?.timerSteps[currentStepIndex];
            if (currentStep?.isDualTimer) {
                if (activeTimer === 1) {
                    setTimeRemaining(prev => prev + seconds);
                } else if (activeTimer === 2) {
                    setTimeRemaining2(prev => prev + seconds);
                }
            } else {
                setTimeRemaining(prev => prev + seconds);
            }
             console.log(`Added ${seconds} seconds to timer`); // Log time addition
        } else if (!isNaN(seconds) && seconds <= 0) {
             alert('Please enter a positive number of seconds.');
        } else {
             alert('Please enter a valid number of seconds.');
        }
   };

   const handleSubtractTime = () => {
        const seconds = parseInt(timeAdjustmentSeconds, 10);
        if (!isNaN(seconds) && seconds > 0) {
            const currentStep = project?.timerSteps[currentStepIndex];
            if (currentStep?.isDualTimer) {
                if (activeTimer === 1) {
                    setTimeRemaining(prev => Math.max(0, prev - seconds)); // Ensure time doesn't go below zero
                } else if (activeTimer === 2) {
                    setTimeRemaining2(prev => Math.max(0, prev - seconds)); // Ensure time doesn't go below zero
                }
            } else {
                setTimeRemaining(prev => Math.max(0, prev - seconds)); // Ensure time doesn't go below zero
            }
             console.log(`Subtracted ${seconds} seconds from timer`); // Log time subtraction
        } else if (!isNaN(seconds) && seconds <= 0) {
             alert('Please enter a positive number of seconds to subtract.');
        } else {
             alert('Please enter a valid number of seconds.');
        }
   };


   const toggleRunSettings = () => {
        setShowRunSettings(prev => !prev);
   };

  // Add updateProject function before the return statement
  const updateProject = async (updates: Partial<Project>) => {
    if (!project || !project.id) return;
    // If this is a temp (one-time) project, do not persist
    if (locationState?.isTemp) {
      setProject(prev => prev ? { ...prev, ...updates } : null);
      return;
    }
    try {
      await pb.collection('timers').update(project.id, updates);
      setProject(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('更新失败，请重试');
    }
  };

  // Determine the background and text color for the timer display
  const isDualTimerStep = project?.timerSteps[currentStepIndex]?.isDualTimer;

  // Add background image upload handler
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setCropDialogOpen(true);
    }
  };

  // Add background image remove handler
  const handleRemoveBackgroundImage = async () => {
    try {
      setBackgroundImage(undefined);
      if (project) {
        await updateProject({ backgroundImage: undefined });
      }
    } catch (error) {
      console.error('Error removing background image:', error);
      alert('移除背景图片失败，请重试');
    }
  };

  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return;
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = async () => {
      const croppedBlob = await getCroppedImg(reader.result as string, croppedAreaPixels);
      const localUrl = URL.createObjectURL(croppedBlob);
      setBackgroundImage(localUrl);
      setCropDialogOpen(false);
      setSelectedImage(null);
      // Do NOT upload to Firebase or call updateProject
    };
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setSelectedImage(null);
  };

  // --- TTS Segments State ---
  const [segments, setSegments] = useState<{ label: string; text: string; audioUrl?: string }[]>([]);
  const [segmentLabel, setSegmentLabel] = useState('');
  const [segmentText, setSegmentText] = useState('');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);

  // Start recording for a segment
  const startRecording = async (idx: number) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('当前浏览器不支持音频录制');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      setRecordingIdx(idx);
      const localChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) localChunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(localChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setSegments((prev) => prev.map((seg, i) => i === idx ? { ...seg, audioUrl: url } : seg));
        setIsRecording(false);
        setRecordingIdx(null);
        setMediaRecorder(null);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      alert('无法访问麦克风');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  // Play audio for a segment
  const playAudio = (audioUrl?: string) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Add a new segment
  const handleAddSegment = () => {
    if (segmentLabel.trim() && segmentText.trim()) {
      setSegments([...segments, { label: segmentLabel, text: segmentText }]);
      setSegmentLabel('');
      setSegmentText('');
    }
  };

  // Remove a segment
  const removeSegment = (idx: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
    // If currently recording this segment, stop
    if (isRecording && recordingIdx === idx && mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const onLogoCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedLogoAreaPixels(croppedAreaPixels);
  };

  const handleLogoCropSave = async () => {
    if (!selectedLogoImage || !croppedLogoAreaPixels || !logoType) {
      alert('缺少必要的图片信息，请重新选择图片');
      return;
    }

    try {
      // Create object URL for the selected image
      const imageUrl = URL.createObjectURL(selectedLogoImage);
      
      // Get cropped image blob
      const croppedImageBlob = await getCroppedImg(imageUrl, croppedLogoAreaPixels);
      
      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);
      
      // Create local URL for display (no Firebase upload)
      const localLogoUrl = URL.createObjectURL(croppedImageBlob);
      
      // Update state with the local logo URL
      if (logoType === 'positive') {
        setPositiveTeamLogo(localLogoUrl);
      } else {
        setNegativeTeamLogo(localLogoUrl);
      }
      
      // Close dialog and reset state
      setCropLogoDialogOpen(false);
      setSelectedLogoImage(null);
      setLogoType(null);
      setCroppedLogoAreaPixels(null);
      setLogoCrop({ x: 0, y: 0 });
      setLogoZoom(1);
      
    } catch (error) {
      console.error(`Error processing ${logoType} team logo:`, error);
      
      // Provide more specific error messages
      let errorMessage = '处理队徽失败';
      if (error instanceof Error) {
        if (error.message.includes('No 2d context')) {
          errorMessage = '浏览器不支持图片处理功能';
        } else if (error.message.includes('Failed to load image')) {
          errorMessage = '图片加载失败，请选择其他图片';
        } else if (error.message.includes('Canvas toBlob failed')) {
          errorMessage = '图片处理失败，请重试';
        } else {
          errorMessage = `处理失败: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleLogoCropCancel = () => {
    setCropLogoDialogOpen(false);
    setSelectedLogoImage(null);
    setLogoType(null);
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3, color: 'red' }}>Error: {error}</Box>;
  }

  if (!project) {
      return <Box sx={{ p: 3 }}>Project not found or loaded.</Box>;
  }

  return (
    <Box
      ref={timerContainerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Fullscreen Button (top right) */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        {isFullscreen ? (
          <IconButton onClick={handleExitFullscreen} color="inherit">
            <FullscreenExitIcon />
          </IconButton>
        ) : (
          <IconButton onClick={handleEnterFullscreen} color="inherit">
            <FullscreenIcon />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          bgcolor: backgroundColor,
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.3s, color 0.3s',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Information Display Area (Top) */}
        <Box
          sx={{
            p: 2,
            pt: 5,
            pb: 3,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="h3">
            {project?.projectName}
            {debateRound ? ` | ${debateRound}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {positiveTeamLogo && (
                <img 
                  src={positiveTeamLogo} 
                  alt="Positive Team Logo" 
                  style={{ 
                    width: 60, 
                    height: 60, 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    marginBottom: '8px'
                  }} 
                />
              )}
              <Typography variant="h5"> {positiveTeam}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {negativeTeamLogo && (
                <img 
                  src={negativeTeamLogo} 
                  alt="Negative Team Logo" 
                  style={{ 
                    width: 60, 
                    height: 60, 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    marginBottom: '8px'
                  }} 
                />
              )}
              <Typography variant="h5">{negativeTeam}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
            <Typography variant="h5">评委 1: {judge1}</Typography>
            <Typography variant="h5">评委 2: {judge2}</Typography>
            <Typography variant="h5">评委 3: {judge3}</Typography>
          </Box>
        </Box>

        {/* Timer Display Area (Middle) */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Time's Up Message Overlay */}
          {showTimeUpMessage && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(255, 0, 0, 0.9)',
                color: 'white',
                padding: '30px 60px',
                borderRadius: '20px',
                fontSize: '4rem',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                animation: `${pulseAnimation} 1s ease-in-out infinite`,
              }}
            >
              时间到！
            </Box>
          )}
          
          {isDualTimerStep ? (
            // Dual Timer Display
            <Box sx={{ display: 'flex', gap: 8 }}>
              <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" sx={{ mt: 2 }}>
                  正方
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '8rem',
                    lineHeight: 1,
                    fontWeight: 'bold',
                    color: activeTimer === 1 ? activeTimerColor : textColor 
                  }}
                >
                  {formatTime(timeRemaining)}
                </Typography>

              </Box>
              <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" sx={{ mt: 2 }}>
                  反方
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '8rem',
                    lineHeight: 1,
                    fontWeight: 'bold',
                    color: activeTimer === 2 ? activeTimerColor : textColor 
                  }}
                >
                  {formatTime(timeRemaining2)}
                </Typography>

              </Box>
            </Box>
          ) : (
            // Single Timer Display
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2.25rem', md: '3rem' },
                }}
              >
                {currentStepLabel}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: '10rem',
                  lineHeight: 1,
                  fontWeight: 'bold'
                }}
              >
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Timer Controls (Bottom) */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {project && project.timerSteps.length > 0 && (
            <Button 
              variant="outlined" 
              onClick={handlePreviousStep} 
              startIcon={<SkipPreviousIcon />} 
              disabled={currentStepIndex === 0}
              sx={{ 
                color: textColor, 
                borderColor: textColor,
                '&:hover': {
                  borderColor: textColor,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)',
                  borderColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              上一步
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleStartPauseResume} 
            disabled={!project || project.timerSteps.length === 0}
            sx={{ 
              bgcolor: activeTimerColor,
              '&:hover': {
                bgcolor: activeTimerColor,
                filter: 'brightness(1.1)'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {!isActive ? (
              <>
                <PlayArrowIcon sx={{ mr: 1 }} /> 开始
              </>
            ) : isPaused ? (
              <>
                <PlayArrowIcon sx={{ mr: 1 }} /> 继续
              </>
            ) : (
              <>
                <PauseIcon sx={{ mr: 1 }} /> 暂停
              </>
            )}
          </Button>
          {isDualTimerStep && (
            <Button 
              variant="outlined" 
              onClick={handleSwitchTimers} 
              startIcon={<SwapHorizIcon />}
              sx={{ 
                color: textColor, 
                borderColor: textColor,
                '&:hover': {
                  borderColor: textColor,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              切换计时方
            </Button>
          )}
          <Button 
            variant="outlined" 
            onClick={handleResetTimer} 
            startIcon={<StopIcon />}
            sx={{ 
              color: textColor, 
              borderColor: textColor,
              '&:hover': {
                borderColor: textColor,
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            重置
          </Button>
          {project && project.timerSteps.length > 0 && (
            <Button 
              variant="outlined" 
              onClick={handleNextStep} 
              startIcon={<SkipNextIcon />} 
              disabled={currentStepIndex === (project.timerSteps.length - 1)}
              sx={{ 
                color: textColor, 
                borderColor: textColor,
                '&:hover': {
                  borderColor: textColor,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)',
                  borderColor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              下一步
            </Button>
          )}
          {/* TTS Segment Buttons: inline after '下一步' button */}
          <Box sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            ml: 2,
            gap: 0.5,
            minWidth: 0,
            maxWidth: '40vw',
          }}>
            {segments.map((seg, idx) => (
              <Button
                key={idx}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.2,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  lineHeight: 1.1,
                  height: 'auto',
                  maxHeight: 36,
                  maxWidth: 64,
                  whiteSpace: 'normal',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  textTransform: 'none',
                  color: textColor,
                  borderColor: activeTimerColor,
                  bgcolor: backgroundColor,
                  '&:hover': { bgcolor: activeTimerColor, color: backgroundColor, borderColor: activeTimerColor },
                  display: 'inline-block',
                }}
                onClick={() => seg.audioUrl ? playAudio(seg.audioUrl) : undefined}
                disabled={!seg.audioUrl}
              >
                {seg.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Settings Panel */}
      <Paper sx={{ 
        p: 2, 
        bgcolor: backgroundColor,
        color: textColor,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" gutterBottom>计时器设置</Typography>
          <IconButton 
            onClick={toggleRunSettings} 
            size="small"
            sx={{ 
              color: textColor,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {showRunSettings ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

        <Collapse in={showRunSettings}>
          <Card sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: backgroundColor,
            color: textColor,
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                <TextField
                    label="轮次/赛事名称"
                    value={debateRound}
                    onChange={(e) => setDebateRound(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
                <TextField
                    label="正方/控方：队名"
                    value={positiveTeam}
                    onChange={(e) => setPositiveTeam(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
                <TextField
                    label="反方/控方：队名"
                    value={negativeTeam}
                    onChange={(e) => setNegativeTeam(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
                <TextField
                    label="评委 1"
                    value={judge1}
                    onChange={(e) => setJudge1(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
                <TextField
                    label="评委 2"
                    value={judge2}
                    onChange={(e) => setJudge2(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
                <TextField
                    label="评委 3"
                    value={judge3}
                    onChange={(e) => setJudge3(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: textColor,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: textColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: textColor,
                      },
                    }}
                />
            </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                自定义背景
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    背景图片
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ color: textColor, borderColor: textColor }}
                    >
                      上传背景图片
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    {backgroundImage && (
                      <Button
                        variant="outlined"
                        onClick={handleRemoveBackgroundImage}
                        sx={{ color: textColor, borderColor: textColor }}
                      >
                        移除背景图片
                      </Button>
                    )}
                  </Box>
                  {backgroundImage && (
                    <Box sx={{ mt: 2, maxWidth: 200 }}>
                      <img
                        src={backgroundImage}
                        alt="Background preview"
                        style={{ width: '100%', height: 'auto', borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button 
                  variant="contained" 
                  component="label"
                  sx={{
                    bgcolor: activeTimerColor,
                    '&:hover': {
                      bgcolor: activeTimerColor,
                      filter: 'brightness(1.1)'
                    }
                  }}
                >
                    上传正方队徽
                    <input type="file" hidden onChange={(e) => handleTeamLogoUpload(e, 'positive')} accept="image/*" />
                </Button>
                <Button 
                  variant="contained" 
                  component="label"
                  sx={{
                    bgcolor: activeTimerColor,
                    '&:hover': {
                      bgcolor: activeTimerColor,
                      filter: 'brightness(1.1)'
                    }
                  }}
                >
                    上传反方队徽
                    <input type="file" hidden onChange={(e) => handleTeamLogoUpload(e, 'negative')} accept="image/*" />
                </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="调整秒数"
                type="number"
                value={timeAdjustmentSeconds}
                onChange={(e) => setTimeAdjustmentSeconds(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  width: 100,
                  '& .MuiOutlinedInput-root': {
                    color: textColor,
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: textColor,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: textColor,
                  },
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddTime} 
                size="small"
                sx={{
                  bgcolor: activeTimerColor,
                  '&:hover': {
                    bgcolor: activeTimerColor,
                    filter: 'brightness(1.1)'
                  }
                }}
              >
                增加时间
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleSubtractTime} 
                size="small"
                sx={{
                  color: textColor,
                  borderColor: textColor,
                  '&:hover': {
                    borderColor: textColor,
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                减少时间
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap', mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTestSound}
              >
                测试提示音
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handlePausePromptSound}
              >
                暂停提示音
              </Button>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sound-mode-label">提示音</InputLabel>
                <Select
                  labelId="sound-mode-label"
                  value={soundMode}
                  label="提示音"
                  onChange={(e) => {
                    setSoundMode(e.target.value as 'bell' | 'beep' | 'custom');
                    resetAudioRefs();
                  }}
                >
                  <MenuItem value="bell">铃声（bell）</MenuItem>
                  <MenuItem value="beep">蜂鸣（beep）</MenuItem>
                  <MenuItem value="custom" disabled={!customSoundUrl}>
                    自定义{customSoundUrl ? '' : '（先上传）'}
                  </MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" component="label" size="small">
                上传自定义提示音
                <input type="file" accept="audio/*" hidden onChange={handleCustomSoundUpload} />
              </Button>
              {customSoundUrl && (
                <Typography variant="caption" sx={{ color: textColor }}>
                  已上传
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
              <Typography variant="body2" sx={{ color: textColor }}>赛前音乐/赛后音乐：</Typography>
              <Button variant="outlined" size="small" onClick={() => playTrack(before1Ref, encodeURI('/sounds/before1.MP4'))}>赛前音乐1 播放</Button>
              <Button variant="outlined" size="small" onClick={() => pauseTrack(before1Ref)}>暂停</Button>
              <Button variant="outlined" size="small" onClick={() => playTrack(before2Ref, encodeURI('/sounds/before2.wav'))}>赛前音乐2 播放</Button>
              <Button variant="outlined" size="small" onClick={() => pauseTrack(before2Ref)}>暂停</Button>
              <Button variant="outlined" size="small" onClick={() => playTrack(after1Ref, encodeURI('/sounds/after1.wav'))}>赛后音乐1 播放</Button>
              <Button variant="outlined" size="small" onClick={() => pauseTrack(after1Ref)}>暂停</Button>
              <Button variant="outlined" size="small" onClick={() => playTrack(after2Ref, encodeURI('/sounds/after2.MP4'))}>赛后音乐2 播放</Button>
              <Button variant="outlined" size="small" onClick={() => pauseTrack(after2Ref)}>暂停</Button>
            </Box>

            {/* Add Appearance Settings */}
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: textColor }}>背景颜色预设</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colorPresets.map((preset) => (
                  <Box
                    key={preset.name}
                    onClick={() => {
                      setBackgroundColor(preset.bg);
                      setTextColor(preset.text);
                    }}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: preset.bg,
                      border: backgroundColor === preset.bg ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: backgroundColor === preset.bg ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none',
                      '&:hover': {
                        border: '2px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {backgroundColor === preset.bg && (
                      <Typography variant="body2" sx={{ color: preset.text }}>
                        ✓
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" sx={{ color: textColor }}>自定义颜色</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: textColor }}>背景颜色</Typography>
                    <TextField
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      sx={{ 
                        width: 150,
                        '& .MuiOutlinedInput-root': {
                          height: 40,
                          padding: 0.5,
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 1,
                          '& input': {
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            padding: 0
                          }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: textColor }}>文字颜色</Typography>
                    <TextField
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      sx={{ 
                        width: 150,
                        '& .MuiOutlinedInput-root': {
                          height: 40,
                          padding: 0.5,
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 1,
                          '& input': {
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            padding: 0
                          }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: textColor }}>当前计时方高亮颜色</Typography>
                    <TextField
                      type="color"
                      value={activeTimerColor}
                      onChange={(e) => setActiveTimerColor(e.target.value)}
                      sx={{ 
                        width: 150,
                        '& .MuiOutlinedInput-root': {
                          height: 40,
                          padding: 0.5,
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 1,
                          '& input': {
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            padding: 0
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: textColor }}>预览:</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  p: 2, 
                  bgcolor: backgroundColor,
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ color: textColor }}>普通文字</Typography>
                  <Typography sx={{ color: activeTimerColor }}>当前计时方</Typography>
                </Box>
              </Box>
            </Box>

            {/* TTS Segments Section (add only, playback moved to floating panel) */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>语音片段</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="按钮名称（如：介绍）"
                  value={segmentLabel}
                  onChange={e => setSegmentLabel(e.target.value)}
                  sx={{ width: 120 }}
                />
                <TextField
                  size="small"
                  label="备注/内容（可选）"
                  value={segmentText}
                  onChange={e => setSegmentText(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button variant="contained" onClick={handleAddSegment}>保存</Button>
              </Box>
              {/* Recording controls for each segment */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {segments.map((seg, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ minWidth: 60, fontSize: '0.9rem' }}>{seg.label}</Typography>
                    {isRecording && recordingIdx === idx ? (
                      <Button size="small" color="error" variant="contained" onClick={stopRecording}>停止录音</Button>
                    ) : (
                      <Button size="small" variant="outlined" onClick={() => startRecording(idx)} disabled={isRecording}>录音</Button>
                    )}
                    {seg.audioUrl ? (
                      <Button size="small" variant="contained" onClick={() => playAudio(seg.audioUrl)}>试听</Button>
                    ) : (
                      <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>未录音</Typography>
                    )}
                    <Button size="small" color="error" variant="outlined" onClick={() => removeSegment(idx)}>删除</Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Collapse>
      </Paper>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onClose={handleCropCancel} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: 'relative', height: 400, bgcolor: '#222' }}>
          {selectedImage && (
            <Cropper
              image={URL.createObjectURL(selectedImage)}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, p: 2 }}>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
            sx={{ width: '100%' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCropCancel}>取消</Button>
            <Button variant="contained" onClick={handleCropSave}>保存裁剪</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Logo Crop Dialog */}
      <Dialog open={cropLogoDialogOpen} onClose={handleLogoCropCancel} maxWidth="md" fullWidth>
        <DialogContent sx={{ position: 'relative', height: 400, bgcolor: '#222' }}>
          {selectedLogoImage && (
            <Cropper
              image={URL.createObjectURL(selectedLogoImage)}
              crop={logoCrop}
              zoom={logoZoom}
              aspect={1}
              onCropChange={setLogoCrop}
              onZoomChange={setLogoZoom}
              onCropComplete={onLogoCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, p: 2 }}>
          <Slider
            value={logoZoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setLogoZoom(value as number)}
            sx={{ width: '100%' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleLogoCropCancel}>取消</Button>
            <Button variant="contained" onClick={handleLogoCropSave}>保存裁剪</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RunTimer; 