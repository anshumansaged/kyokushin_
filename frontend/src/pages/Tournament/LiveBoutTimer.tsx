import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Fab,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Add,
  Warning,
  Person,
  Refresh,
  Save,
  Fullscreen
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
// import { useParams } from 'react-router-dom';

const TimerDisplay = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #212529 0%, #343a40 100%)',
  color: '#ffffff',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  border: '4px solid #dc3545',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(220, 53, 69, 0.1) 50%, transparent 70%)',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

interface ScoreCardProps {
  corner: 'red' | 'blue';
}

const ScoreCard = styled(Card)<ScoreCardProps>(({ corner }) => ({
  minHeight: '300px',
  border: `3px solid ${corner === 'red' ? '#dc3545' : '#007bff'}`,
  backgroundColor: corner === 'red' ? 'rgba(220, 53, 69, 0.05)' : 'rgba(0, 123, 255, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${corner === 'red' ? 'rgba(220, 53, 69, 0.3)' : 'rgba(0, 123, 255, 0.3)'}`,
  },
}));

interface ScoreButtonProps {
  scoreType?: string;
  corner: 'red' | 'blue';
}

const ScoreButton = styled(Button)<ScoreButtonProps>(({ scoreType, corner }) => ({
  minWidth: '100px',
  minHeight: '60px',
  margin: '4px',
  fontSize: '1.2rem',
  fontWeight: 600,
  border: `2px solid ${corner === 'red' ? '#dc3545' : '#007bff'}`,
  color: corner === 'red' ? '#dc3545' : '#007bff',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: corner === 'red' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 123, 255, 0.1)',
    transform: 'scale(1.05)',
  },
  ...(scoreType === 'ippon' && {
    background: `linear-gradient(135deg, ${corner === 'red' ? '#dc3545' : '#007bff'} 0%, ${corner === 'red' ? '#b02a37' : '#0056b3'} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${corner === 'red' ? '#b02a37' : '#0056b3'} 0%, ${corner === 'red' ? '#8b1e2b' : '#004085'} 100%)`,
    },
  }),
}));

const EventLog = styled(Paper)(({ theme }) => ({
  height: '400px',
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#dc3545',
    borderRadius: '4px',
  },
}));

interface BoutState {
  timer: {
    timeRemaining: number;
    status: 'not-started' | 'running' | 'paused' | 'extension' | 'finished';
    startTime?: Date;
    extensions: Array<{
      duration: number;
      reason: string;
      startTime: Date;
      endTime?: Date;
    }>;
  };
  scoring: {
    red: {
      ippon: number;
      wazaari: number;
      points: number;
      warnings: number;
      penalties: number;
    };
    blue: {
      ippon: number;
      wazaari: number;
      points: number;
      warnings: number;
      penalties: number;
    };
  };
  events: Array<{
    time: number;
    type: string;
    participant: string;
    technique?: string;
    target?: string;
    description: string;
    timestamp: Date;
  }>;
  participants: {
    red: {
      name: string;
      dojo: string;
      belt: string;
      weight: number;
    };
    blue: {
      name: string;
      dojo: string;
      belt: string;
      weight: number;
    };
  };
}

const LiveBoutTimer: React.FC = () => {
  // const { boutId } = useParams<{ boutId: string }>();
  
  const [bout, setBout] = useState<BoutState>({
    timer: {
      timeRemaining: 180, // 3 minutes
      status: 'not-started',
      extensions: []
    },
    scoring: {
      red: { ippon: 0, wazaari: 0, points: 0, warnings: 0, penalties: 0 },
      blue: { ippon: 0, wazaari: 0, points: 0, warnings: 0, penalties: 0 }
    },
    events: [],
    participants: {
      red: { name: 'Fighter Red', dojo: 'Red Dojo', belt: 'Black', weight: 75 },
      blue: { name: 'Fighter Blue', dojo: 'Blue Dojo', belt: 'Black', weight: 73 }
    }
  });

  const [scoreDialog, setScoreDialog] = useState(false);
  const [penaltyDialog, setPenaltyDialog] = useState(false);
  const [endBoutDialog, setEndBoutDialog] = useState(false);
  const [selectedCorner, setSelectedCorner] = useState<'red' | 'blue'>('red');
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [winner, setWinner] = useState<'red' | 'blue' | ''>('');
  const [winMethod, setWinMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer effect
  useEffect(() => {
    if (bout.timer.status === 'running') {
      timerRef.current = setInterval(() => {
        setBout(prev => ({
          ...prev,
          timer: {
            ...prev.timer,
            timeRemaining: Math.max(0, prev.timer.timeRemaining - 1)
          }
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [bout.timer.status]);

  // Auto-end bout when time runs out
  useEffect(() => {
    if (bout.timer.timeRemaining === 0 && bout.timer.status === 'running') {
      setBout(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          status: 'finished'
        }
      }));
      playTimeUpSound();
    }
  }, [bout.timer.timeRemaining, bout.timer.status]);

  const playTimeUpSound = () => {
    // Play sound when time is up
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const startBout = () => {
    setBout(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        status: 'running',
        startTime: new Date()
      },
      events: [
        ...prev.events,
        {
          time: 0,
          type: 'start',
          participant: 'none',
          description: 'Bout started',
          timestamp: new Date()
        }
      ]
    }));
  };

  const pauseBout = () => {
    setBout(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        status: 'paused'
      },
      events: [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: 'pause',
          participant: 'none',
          description: 'Bout paused',
          timestamp: new Date()
        }
      ]
    }));
  };

  const resumeBout = () => {
    setBout(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        status: 'running'
      },
      events: [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: 'resume',
          participant: 'none',
          description: 'Bout resumed',
          timestamp: new Date()
        }
      ]
    }));
  };

  const getElapsedTime = () => {
    return bout.timer.startTime ? 
      Math.floor((new Date().getTime() - bout.timer.startTime.getTime()) / 1000) : 0;
  };

  const scorePoint = (corner: 'red' | 'blue', type: 'ippon' | 'waza-ari' | 'point') => {
    setBout(prev => {
      const newScoring = { ...prev.scoring };
      const scoreType = type === 'waza-ari' ? 'wazaari' : type === 'point' ? 'points' : type;
      newScoring[corner][scoreType]++;

      const newEvents = [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: type,
          participant: corner,
          technique: selectedTechnique,
          target: selectedTarget,
          description: `${type.toUpperCase()} - ${selectedTechnique} to ${selectedTarget}`,
          timestamp: new Date()
        }
      ];

      // Check for automatic win
      const autoWin = newScoring[corner].ippon >= 1 || newScoring[corner].wazaari >= 2;
      
      return {
        ...prev,
        scoring: newScoring,
        events: newEvents,
        timer: autoWin ? { ...prev.timer, status: 'finished' } : prev.timer
      };
    });

    setScoreDialog(false);
    setSelectedTechnique('');
    setSelectedTarget('');
  };

  const addPenalty = (corner: 'red' | 'blue', type: 'warning' | 'penalty') => {
    setBout(prev => {
      const newScoring = { ...prev.scoring };
      newScoring[corner][type === 'warning' ? 'warnings' : 'penalties']++;

      const newEvents = [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: type,
          participant: corner,
          description: `${type.toUpperCase()} - ${penaltyReason}`,
          timestamp: new Date()
        }
      ];

      // Check for disqualification
      const dq = newScoring[corner].warnings >= 3 || newScoring[corner].penalties >= 3;

      return {
        ...prev,
        scoring: newScoring,
        events: newEvents,
        timer: dq ? { ...prev.timer, status: 'finished' } : prev.timer
      };
    });

    setPenaltyDialog(false);
    setPenaltyReason('');
  };

  const addExtension = (duration: number, reason: string) => {
    setBout(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        timeRemaining: prev.timer.timeRemaining + duration,
        extensions: [
          ...prev.timer.extensions,
          {
            duration,
            reason,
            startTime: new Date()
          }
        ]
      },
      events: [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: 'extension',
          participant: 'none',
          description: `${duration}s extension - ${reason}`,
          timestamp: new Date()
        }
      ]
    }));
  };

  const endBout = () => {
    setBout(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        status: 'finished'
      },
      events: [
        ...prev.events,
        {
          time: getElapsedTime(),
          type: 'end',
          participant: winner,
          description: `Bout ended - Winner: ${winner} by ${winMethod}`,
          timestamp: new Date()
        }
      ]
    }));

    setEndBoutDialog(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (bout.timer.timeRemaining <= 30) return '#dc3545';
    if (bout.timer.timeRemaining <= 60) return '#ffc107';
    return '#ffffff';
  };

  const techniques = [
    'Seiza Tsuki', 'Jodan Tsuki', 'Chudan Tsuki', 'Gedan Tsuki',
    'Mae Geri', 'Yoko Geri', 'Ushiro Geri', 'Mawashi Geri',
    'Hiza Geri', 'Kakato Geri', 'Empi Uchi', 'Shuto Uchi'
  ];

  const targets = [
    'Head', 'Face', 'Chest', 'Solar Plexus', 'Ribs', 'Stomach', 
    'Leg', 'Thigh', 'Shin', 'Foot'
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Audio element for time up sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/time-up.mp3" type="audio/mpeg" />
      </audio>

      {/* Header Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Live Bout Control
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Fullscreen">
              <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                <Fullscreen />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh">
              <IconButton>
                <Refresh />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<Save />}
              sx={{ borderColor: '#dc3545', color: '#dc3545' }}
            >
              Save Bout
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Timer Section */}
        <Box>
          <TimerDisplay>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '4rem', md: '6rem' }, 
                fontWeight: 700,
                color: getTimeColor(),
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                position: 'relative',
                zIndex: 1
              }}
            >
              {formatTime(bout.timer.timeRemaining)}
            </Typography>
            
            <Typography variant="h5" sx={{ mt: 2, opacity: 0.8, position: 'relative', zIndex: 1 }}>
              {bout.timer.status.toUpperCase().replace('-', ' ')}
            </Typography>

            {bout.timer.extensions.length > 0 && (
              <Box sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
                <Chip 
                  label={`${bout.timer.extensions.length} Extension(s)`} 
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}

            {/* Timer Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, position: 'relative', zIndex: 1 }}>
              {bout.timer.status === 'not-started' && (
                <Fab
                  color="primary"
                  onClick={startBout}
                  sx={{ 
                    bgcolor: '#28a745',
                    '&:hover': { bgcolor: '#218838' }
                  }}
                >
                  <PlayArrow />
                </Fab>
              )}
              
              {bout.timer.status === 'running' && (
                <Fab
                  color="primary"
                  onClick={pauseBout}
                  sx={{ 
                    bgcolor: '#ffc107',
                    '&:hover': { bgcolor: '#e0a800' }
                  }}
                >
                  <Pause />
                </Fab>
              )}
              
              {bout.timer.status === 'paused' && (
                <Fab
                  color="primary"
                  onClick={resumeBout}
                  sx={{ 
                    bgcolor: '#28a745',
                    '&:hover': { bgcolor: '#218838' }
                  }}
                >
                  <PlayArrow />
                </Fab>
              )}

              {(bout.timer.status === 'running' || bout.timer.status === 'paused') && (
                <>
                  <Fab
                    onClick={() => addExtension(60, 'Official timeout')}
                    sx={{ 
                      bgcolor: '#17a2b8',
                      color: 'white',
                      '&:hover': { bgcolor: '#138496' }
                    }}
                  >
                    <Add />
                  </Fab>
                  
                  <Fab
                    onClick={() => setEndBoutDialog(true)}
                    sx={{ 
                      bgcolor: '#dc3545',
                      color: 'white',
                      '&:hover': { bgcolor: '#c82333' }
                    }}
                  >
                    <Stop />
                  </Fab>
                </>
              )}
            </Box>
          </TimerDisplay>
        </Box>

        {/* Scoring Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px' }}>
            <ScoreCard corner="red">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#dc3545', width: 60, height: 60 }}>
                      <Person sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#dc3545' }}>
                        {bout.participants.red.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bout.participants.red.dojo} • {bout.participants.red.belt} Belt • {bout.participants.red.weight}kg
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
            />
            
            <CardContent>
              {/* Score Display */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, textAlign: 'center' }}>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc3545' }}>
                    {bout.scoring.red.ippon}
                  </Typography>
                  <Typography variant="body2">IPPON</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc3545' }}>
                    {bout.scoring.red.wazaari}
                  </Typography>
                  <Typography variant="body2">WAZA-ARI</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc3545' }}>
                    {bout.scoring.red.points}
                  </Typography>
                  <Typography variant="body2">POINTS</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Box>
                    <Badge badgeContent={bout.scoring.red.warnings} color="warning">
                      <Warning sx={{ fontSize: 30, color: '#ffc107' }} />
                    </Badge>
                    <Typography variant="body2" sx={{ mt: 1 }}>WARNINGS</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Scoring Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <ScoreButton
                  corner="red"
                  scoreType="ippon"
                  onClick={() => {
                    setSelectedCorner('red');
                    setScoreDialog(true);
                  }}
                >
                  IPPON
                </ScoreButton>
                
                <ScoreButton
                  corner="red"
                  onClick={() => scorePoint('red', 'waza-ari')}
                >
                  WAZA-ARI
                </ScoreButton>
                
                <ScoreButton
                  corner="red"
                  onClick={() => scorePoint('red', 'point')}
                >
                  POINT
                </ScoreButton>
                
                <ScoreButton
                  corner="red"
                  onClick={() => {
                    setSelectedCorner('red');
                    setPenaltyDialog(true);
                  }}
                >
                  PENALTY
                </ScoreButton>
              </Box>
            </CardContent>
          </ScoreCard>
        </Box>

        <Box sx={{ flex: '1 1 400px' }}>
          <ScoreCard corner="blue">
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#007bff', width: 60, height: 60 }}>
                    <Person sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#007bff' }}>
                      {bout.participants.blue.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {bout.participants.blue.dojo} • {bout.participants.blue.belt} Belt • {bout.participants.blue.weight}kg
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{ backgroundColor: 'rgba(0, 123, 255, 0.1)' }}
            />
            
            <CardContent>
              {/* Score Display */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, textAlign: 'center' }}>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#007bff' }}>
                    {bout.scoring.blue.ippon}
                  </Typography>
                  <Typography variant="body2">IPPON</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#007bff' }}>
                    {bout.scoring.blue.wazaari}
                  </Typography>
                  <Typography variant="body2">WAZA-ARI</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#007bff' }}>
                    {bout.scoring.blue.points}
                  </Typography>
                  <Typography variant="body2">POINTS</Typography>
                </Box>
                <Box sx={{ flex: '1 1 80px', minWidth: '80px' }}>
                  <Box>
                    <Badge badgeContent={bout.scoring.blue.warnings} color="warning">
                      <Warning sx={{ fontSize: 30, color: '#ffc107' }} />
                    </Badge>
                    <Typography variant="body2" sx={{ mt: 1 }}>WARNINGS</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Scoring Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <ScoreButton
                  corner="blue"
                  scoreType="ippon"
                  onClick={() => {
                    setSelectedCorner('blue');
                    setScoreDialog(true);
                  }}
                >
                  IPPON
                </ScoreButton>
                
                <ScoreButton
                  corner="blue"
                  onClick={() => scorePoint('blue', 'waza-ari')}
                >
                  WAZA-ARI
                </ScoreButton>
                
                <ScoreButton
                  corner="blue"
                  onClick={() => scorePoint('blue', 'point')}
                >
                  POINT
                </ScoreButton>
                
                <ScoreButton
                  corner="blue"
                  onClick={() => {
                    setSelectedCorner('blue');
                    setPenaltyDialog(true);
                  }}
                >
                  PENALTY
                </ScoreButton>
              </Box>
            </CardContent>
          </ScoreCard>
        </Box>
        </Box>

        {/* Event Log */}
        <Box>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Bout Events
            </Typography>
            
            <EventLog>
              {bout.events.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No events yet. Start the bout to begin logging.
                </Typography>
              ) : (
                <List dense>
                  {bout.events.slice().reverse().map((event, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {event.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(event.time)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {event.timestamp.toLocaleTimeString()}
                              {event.participant !== 'none' && ` • ${event.participant.toUpperCase()} corner`}
                              {event.technique && ` • ${event.technique}`}
                              {event.target && ` to ${event.target}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < bout.events.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </EventLog>
          </Paper>
        </Box>
      </Box>

      {/* Score Dialog */}
      <Dialog open={scoreDialog} onClose={() => setScoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Score IPPON - {selectedCorner.toUpperCase()} Corner
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Technique</InputLabel>
              <Select
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                label="Technique"
              >
                {techniques.map((tech) => (
                  <MenuItem key={tech} value={tech}>{tech}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Target</InputLabel>
              <Select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                label="Target"
              >
                {targets.map((target) => (
                  <MenuItem key={target} value={target}>{target}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => scorePoint(selectedCorner, 'ippon')}
            variant="contained"
            disabled={!selectedTechnique || !selectedTarget}
            sx={{
              bgcolor: selectedCorner === 'red' ? '#dc3545' : '#007bff',
              '&:hover': {
                bgcolor: selectedCorner === 'red' ? '#c82333' : '#0056b3',
              }
            }}
          >
            Score IPPON
          </Button>
        </DialogActions>
      </Dialog>

      {/* Penalty Dialog */}
      <Dialog open={penaltyDialog} onClose={() => setPenaltyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Penalty - {selectedCorner.toUpperCase()} Corner
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            value={penaltyReason}
            onChange={(e) => setPenaltyReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="e.g., Excessive contact, Unsportsmanlike conduct"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPenaltyDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => addPenalty(selectedCorner, 'warning')}
            color="warning"
            disabled={!penaltyReason}
          >
            Warning
          </Button>
          <Button 
            onClick={() => addPenalty(selectedCorner, 'penalty')}
            color="error"
            disabled={!penaltyReason}
          >
            Penalty
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Bout Dialog */}
      <Dialog open={endBoutDialog} onClose={() => setEndBoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>End Bout</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Winner</InputLabel>
              <Select
                value={winner}
                onChange={(e) => setWinner(e.target.value as 'red' | 'blue')}
                label="Winner"
              >
                <MenuItem value="red">Red Corner - {bout.participants.red.name}</MenuItem>
                <MenuItem value="blue">Blue Corner - {bout.participants.blue.name}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={winMethod}
                onChange={(e) => setWinMethod(e.target.value)}
                label="Method"
              >
                <MenuItem value="ippon">Ippon</MenuItem>
                <MenuItem value="waza-ari">Waza-ari</MenuItem>
                <MenuItem value="decision">Decision</MenuItem>
                <MenuItem value="disqualification">Disqualification</MenuItem>
                <MenuItem value="injury">Injury</MenuItem>
                <MenuItem value="walkover">Walkover</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={3}
              placeholder="Additional notes about the bout result"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndBoutDialog(false)}>Cancel</Button>
          <Button 
            onClick={endBout}
            variant="contained"
            color="error"
            disabled={!winner || !winMethod}
          >
            End Bout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveBoutTimer;
