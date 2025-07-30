import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Badge,
  IconButton,
  Dialog,
  List,
  ListItem,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Tooltip
} from '@mui/material';
import {
  Person,
  Warning,
  Settings,
  Fullscreen,
  Stream
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface LivestreamOverlayProps {
  overlay?: boolean;
}

interface TimerDisplayProps {
  isOverlay?: boolean;
}

interface ScoreDisplayProps {
  corner?: 'red' | 'blue';
  isOverlay?: boolean;
}

interface EventTickerProps {
  isOverlay?: boolean;
}

const LivestreamOverlay = styled(Box)<LivestreamOverlayProps>(({ theme, overlay }) => ({
  position: overlay ? 'absolute' : 'relative',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: overlay ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 600,
  zIndex: overlay ? 1000 : 1,
  pointerEvents: overlay ? 'none' : 'auto',
  '& .overlay-element': {
    textShadow: overlay ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
    border: overlay ? '2px solid rgba(255,255,255,0.3)' : 'none',
    borderRadius: overlay ? '8px' : 0,
    backdropFilter: overlay ? 'blur(4px)' : 'none',
    backgroundColor: overlay ? 'rgba(0,0,0,0.6)' : 'white',
    color: overlay ? 'white' : 'inherit',
  }
}));

const TimerDisplay = styled(Box)<TimerDisplayProps>(({ theme, isOverlay }) => ({
  textAlign: 'center',
  padding: theme.spacing(isOverlay ? 2 : 4),
  background: isOverlay 
    ? 'linear-gradient(135deg, rgba(33, 37, 41, 0.9) 0%, rgba(52, 58, 64, 0.9) 100%)'
    : 'linear-gradient(135deg, #212529 0%, #343a40 100%)',
  borderRadius: theme.spacing(1),
  border: `3px solid ${isOverlay ? 'rgba(220, 53, 69, 0.8)' : '#dc3545'}`,
  margin: theme.spacing(1),
  backdropFilter: isOverlay ? 'blur(8px)' : 'none',
}));

const ScoreDisplay = styled(Box)<ScoreDisplayProps>(({ corner, isOverlay }) => ({
  padding: '16px',
  background: isOverlay
    ? `linear-gradient(135deg, rgba(${corner === 'red' ? '220, 53, 69' : '0, 123, 255'}, 0.9) 0%, rgba(${corner === 'red' ? '176, 42, 55' : '0, 86, 179'}, 0.9) 100%)`
    : `linear-gradient(135deg, ${corner === 'red' ? '#dc3545' : '#007bff'} 0%, ${corner === 'red' ? '#b02a37' : '#0056b3'} 100%)`,
  color: 'white',
  borderRadius: '8px',
  margin: '8px',
  textAlign: 'center',
  border: `2px solid ${corner === 'red' ? '#dc3545' : '#007bff'}`,
  backdropFilter: isOverlay ? 'blur(8px)' : 'none',
}));

const EventTicker = styled(Box)<EventTickerProps>(({ theme, isOverlay }) => ({
  position: isOverlay ? 'absolute' : 'relative',
  bottom: isOverlay ? '20px' : 'auto',
  left: isOverlay ? '20px' : 'auto',
  right: isOverlay ? '20px' : 'auto',
  background: isOverlay
    ? 'linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(52, 58, 64, 0.8) 50%, rgba(0, 0, 0, 0.8) 100%)'
    : 'linear-gradient(90deg, #000000 0%, #343a40 50%, #000000 100%)',
  color: 'white',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: '2px solid #dc3545',
  backdropFilter: isOverlay ? 'blur(8px)' : 'none',
  '& .ticker-content': {
    animation: 'scroll 30s linear infinite',
    whiteSpace: 'nowrap',
  },
  '@keyframes scroll': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(-100%)' },
  },
}));

const OverlaySettings = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  borderRadius: theme.spacing(2),
}));

interface BoutData {
  timer: {
    timeRemaining: number;
    status: string;
  };
  scoring: {
    red: {
      ippon: number;
      wazaari: number;
      points: number;
      warnings: number;
    };
    blue: {
      ippon: number;
      wazaari: number;
      points: number;
      warnings: number;
    };
  };
  participants: {
    red: {
      name: string;
      dojo: string;
      belt: string;
      country?: string;
    };
    blue: {
      name: string;
      dojo: string;
      belt: string;
      country?: string;
    };
  };
  events: Array<{
    time: number;
    type: string;
    participant: string;
    description: string;
    timestamp: Date;
  }>;
  tournament: {
    name: string;
    category: string;
    round: string;
  };
}

const LivestreamDisplay: React.FC = () => {
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState({
    showTimer: true,
    showScores: true,
    showParticipants: true,
    showTournamentInfo: true,
    showEventTicker: true,
    opacity: 0.9,
    scale: 1.0,
    position: 'bottom-right'
  });

  const [boutData, setBoutData] = useState<BoutData>({
    timer: {
      timeRemaining: 180,
      status: 'running'
    },
    scoring: {
      red: { ippon: 0, wazaari: 1, points: 2, warnings: 0 },
      blue: { ippon: 0, wazaari: 0, points: 1, warnings: 1 }
    },
    participants: {
      red: {
        name: 'Akira Yamamoto',
        dojo: 'Tokyo Karate Academy',
        belt: 'Black',
        country: 'JPN'
      },
      blue: {
        name: 'Marco Silva',
        dojo: 'Brazilian Karate Federation',
        belt: 'Black',
        country: 'BRA'
      }
    },
    events: [
      {
        time: 120,
        type: 'waza-ari',
        participant: 'red',
        description: 'WAZA-ARI - Mawashi Geri to Head',
        timestamp: new Date()
      },
      {
        time: 95,
        type: 'point',
        participant: 'red',
        description: 'POINT - Jodan Tsuki to Face',
        timestamp: new Date()
      },
      {
        time: 80,
        type: 'warning',
        participant: 'blue',
        description: 'WARNING - Excessive contact',
        timestamp: new Date()
      }
    ],
    tournament: {
      name: 'World Karate Championship 2024',
      category: 'Men Kumite -75kg',
      round: 'Quarter Final'
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBoutData(prev => ({
        ...prev,
        timer: {
          ...prev.timer,
          timeRemaining: Math.max(0, prev.timer.timeRemaining - 1)
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (boutData.timer.timeRemaining <= 30) return '#dc3545';
    if (boutData.timer.timeRemaining <= 60) return '#ffc107';
    return '#ffffff';
  };

  const getLatestEvents = () => {
    return boutData.events
      .slice(-3)
      .reverse()
      .map(event => event.description)
      .join(' • ');
  };

  const OverlayContent = () => (
    <LivestreamOverlay overlay={isOverlayMode}>
      {/* Tournament Info - Top Center */}
      {overlaySettings.showTournamentInfo && (
        <Box
          className="overlay-element"
          sx={{
            position: isOverlayMode ? 'absolute' : 'relative',
            top: isOverlayMode ? '20px' : 'auto',
            left: '50%',
            transform: isOverlayMode ? 'translateX(-50%)' : 'none',
            textAlign: 'center',
            p: 2,
            m: 1,
            minWidth: '400px'
          }}
        >
          <Typography
            variant={isOverlayMode ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {boutData.tournament.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {boutData.tournament.category} - {boutData.tournament.round}
          </Typography>
        </Box>
      )}

      {/* Timer - Top Right */}
      {overlaySettings.showTimer && (
        <TimerDisplay
          isOverlay={isOverlayMode}
          className="overlay-element"
          sx={{
            position: isOverlayMode ? 'absolute' : 'relative',
            top: isOverlayMode ? '20px' : 'auto',
            right: isOverlayMode ? '20px' : 'auto',
            minWidth: '200px'
          }}
        >
          <Typography
            variant={isOverlayMode ? 'h3' : 'h2'}
            sx={{
              fontSize: isOverlayMode ? '3rem' : '4rem',
              fontWeight: 700,
              color: getTimeColor(),
            }}
          >
            {formatTime(boutData.timer.timeRemaining)}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, textTransform: 'uppercase' }}>
            {boutData.timer.status}
          </Typography>
        </TimerDisplay>
      )}

      {/* Participants Info - Left Side */}
      {overlaySettings.showParticipants && (
        <Box
          className="overlay-element"
          sx={{
            position: isOverlayMode ? 'absolute' : 'relative',
            top: isOverlayMode ? '120px' : 'auto',
            left: isOverlayMode ? '20px' : 'auto',
            width: isOverlayMode ? '300px' : 'auto',
            p: 2,
            m: 1
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Participants
          </Typography>
          
          {/* Red Corner */}
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(220, 53, 69, 0.2)', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: '#dc3545', width: 32, height: 32 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {boutData.participants.red.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {boutData.participants.red.country} • {boutData.participants.red.belt} Belt
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {boutData.participants.red.dojo}
            </Typography>
          </Box>

          {/* Blue Corner */}
          <Box sx={{ p: 1.5, bgcolor: 'rgba(0, 123, 255, 0.2)', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: '#007bff', width: 32, height: 32 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {boutData.participants.blue.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {boutData.participants.blue.country} • {boutData.participants.blue.belt} Belt
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {boutData.participants.blue.dojo}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Scores - Right Side */}
      {overlaySettings.showScores && (
        <Box
          className="overlay-element"
          sx={{
            position: isOverlayMode ? 'absolute' : 'relative',
            top: isOverlayMode ? '120px' : 'auto',
            right: isOverlayMode ? '20px' : 'auto',
            width: isOverlayMode ? '280px' : 'auto',
            p: 2,
            m: 1
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
            Live Scores
          </Typography>
          
          {/* Red Score */}
          <ScoreDisplay corner="red" isOverlay={isOverlayMode}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              RED CORNER
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.red.ippon}
                </Typography>
                <Typography variant="caption">IPPON</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.red.wazaari}
                </Typography>
                <Typography variant="caption">WAZA-ARI</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.red.points}
                </Typography>
                <Typography variant="caption">POINTS</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Badge badgeContent={boutData.scoring.red.warnings} color="warning">
                  <Warning sx={{ fontSize: 24 }} />
                </Badge>
              </Box>
            </Box>
          </ScoreDisplay>

          {/* Blue Score */}
          <ScoreDisplay corner="blue" isOverlay={isOverlayMode}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              BLUE CORNER
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.blue.ippon}
                </Typography>
                <Typography variant="caption">IPPON</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.blue.wazaari}
                </Typography>
                <Typography variant="caption">WAZA-ARI</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {boutData.scoring.blue.points}
                </Typography>
                <Typography variant="caption">POINTS</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Badge badgeContent={boutData.scoring.blue.warnings} color="warning">
                  <Warning sx={{ fontSize: 24 }} />
                </Badge>
              </Box>
            </Box>
          </ScoreDisplay>
        </Box>
      )}

      {/* Event Ticker - Bottom */}
      {overlaySettings.showEventTicker && (
        <EventTicker isOverlay={isOverlayMode} className="overlay-element">
          <Box className="ticker-content">
            <Typography variant="body1" component="span" sx={{ fontWeight: 600 }}>
              Latest Events: {getLatestEvents() || 'Bout in progress...'}
            </Typography>
          </Box>
        </EventTicker>
      )}
    </LivestreamOverlay>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: isOverlayMode ? 'transparent' : '#f5f5f5' }}>
      {/* Control Panel */}
      {!isOverlayMode && (
        <Paper elevation={2} sx={{ p: 2, m: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Livestream Display
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isOverlayMode}
                    onChange={(e) => setIsOverlayMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Overlay Mode"
              />
              
              <Tooltip title="Settings">
                <IconButton onClick={() => setShowSettings(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Fullscreen">
                <IconButton>
                  <Fullscreen />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Stream Status">
                <IconButton color="success">
                  <Stream />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Main Display */}
      <OverlayContent />

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <OverlaySettings>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Overlay Settings
          </Typography>
          
          <List>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={overlaySettings.showTimer}
                    onChange={(e) => setOverlaySettings(prev => ({
                      ...prev,
                      showTimer: e.target.checked
                    }))}
                  />
                }
                label="Show Timer"
              />
            </ListItem>
            
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={overlaySettings.showScores}
                    onChange={(e) => setOverlaySettings(prev => ({
                      ...prev,
                      showScores: e.target.checked
                    }))}
                  />
                }
                label="Show Scores"
              />
            </ListItem>
            
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={overlaySettings.showParticipants}
                    onChange={(e) => setOverlaySettings(prev => ({
                      ...prev,
                      showParticipants: e.target.checked
                    }))}
                  />
                }
                label="Show Participants"
              />
            </ListItem>
            
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={overlaySettings.showTournamentInfo}
                    onChange={(e) => setOverlaySettings(prev => ({
                      ...prev,
                      showTournamentInfo: e.target.checked
                    }))}
                  />
                }
                label="Show Tournament Info"
              />
            </ListItem>
            
            <ListItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={overlaySettings.showEventTicker}
                    onChange={(e) => setOverlaySettings(prev => ({
                      ...prev,
                      showEventTicker: e.target.checked
                    }))}
                  />
                }
                label="Show Event Ticker"
              />
            </ListItem>
            
            <Divider sx={{ my: 2 }} />
            
            <ListItem>
              <Box sx={{ width: '100%' }}>
                <Typography gutterBottom>Opacity</Typography>
                <Slider
                  value={overlaySettings.opacity}
                  onChange={(_, value) => setOverlaySettings(prev => ({
                    ...prev,
                    opacity: value as number
                  }))}
                  min={0.3}
                  max={1.0}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>
            </ListItem>
            
            <ListItem>
              <Box sx={{ width: '100%' }}>
                <Typography gutterBottom>Scale</Typography>
                <Slider
                  value={overlaySettings.scale}
                  onChange={(_, value) => setOverlaySettings(prev => ({
                    ...prev,
                    scale: value as number
                  }))}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>
            </ListItem>
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={() => setShowSettings(false)}>
              Close
            </Button>
            <Button variant="contained" onClick={() => setShowSettings(false)}>
              Apply
            </Button>
          </Box>
        </OverlaySettings>
      </Dialog>
    </Box>
  );
};

export default LivestreamDisplay;
