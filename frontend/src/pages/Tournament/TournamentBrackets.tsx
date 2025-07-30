import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  EmojiEvents,
  PlayArrow,
  CheckCircle,
  Refresh,
  Download,
  Share,
  Sports
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';

interface MatchCardProps {
  status?: string;
}

interface ParticipantRowProps {
  isWinner?: boolean;
  isLoser?: boolean;
}

const BracketContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  borderRadius: theme.spacing(2),
  minHeight: '400px',
}));

const MatchCard = styled(Card)<MatchCardProps>(({ theme, status }) => ({
  minWidth: '200px',
  margin: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  position: 'relative',
  ...(status === 'completed' && {
    borderColor: '#28a745',
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
  }),
  ...(status === 'in-progress' && {
    borderColor: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    animation: 'pulse 2s infinite',
  }),
  ...(status === 'pending' && {
    borderColor: '#ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(0, 123, 255, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(0, 123, 255, 0)',
    },
  },
}));

const ParticipantRow = styled(Box)<ParticipantRowProps>(({ isWinner, isLoser }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderRadius: '8px',
  margin: '4px 0',
  transition: 'all 0.2s ease',
  ...(isWinner && {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    border: '1px solid #28a745',
    fontWeight: 600,
  }),
  ...(isLoser && {
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    color: '#6c757d',
  }),
}));

const RoundColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '250px',
  padding: theme.spacing(1),
}));

interface Bracket {
  _id: string;
  tournament: string;
  category: string;
  type: string;
  status: string;
  participants: Array<{
    user: {
      _id: string;
      profile: {
        firstName: string;
        lastName: string;
        dojo?: string;
      };
    };
    seed: number;
    name: string;
    dojo: string;
    belt: string;
    weight: number;
    eliminated: boolean;
    position?: number;
  }>;
  matches: Array<{
    matchId: number;
    round: number;
    roundName: string;
    participant1?: string;
    participant2?: string;
    winner?: string;
    loser?: string;
    status: string;
    scheduledTime?: string;
    result?: {
      type: string;
      score: any;
      duration: number;
    };
    isBye: boolean;
  }>;
  rounds: Array<{
    roundNumber: number;
    name: string;
    matches: number[];
    completed: boolean;
  }>;
  finalResults: {
    first?: string;
    second?: string;
    third?: string[];
    participantCount: number;
    completedAt?: string;
  };
}

const TournamentBrackets: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [selectedBracket, setSelectedBracket] = useState<Bracket | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchDialog, setMatchDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  useEffect(() => {
    if (selectedCategory && brackets.length > 0) {
      const bracket = brackets.find(b => b.category === selectedCategory);
      setSelectedBracket(bracket || null);
    }
  }, [selectedCategory, brackets]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentResponse, bracketsResponse] = await Promise.all([
        fetch(`/api/tournaments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/tournaments/${id}/brackets`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData.data);
      }

      if (bracketsResponse.ok) {
        const bracketsData = await bracketsResponse.json();
        setBrackets(bracketsData.data);
        
        if (bracketsData.data.length > 0) {
          setSelectedCategory(bracketsData.data[0].category);
        }
      } else {
        setError('No brackets found for this tournament');
      }
    } catch (err) {
      setError('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantName = (participantId: string) => {
    if (!selectedBracket || !participantId) return 'TBD';
    
    const participant = selectedBracket.participants.find(p => 
      p.user._id === participantId
    );
    
    return participant ? participant.name : 'TBD';
  };

  const getParticipantDojo = (participantId: string) => {
    if (!selectedBracket || !participantId) return '';
    
    const participant = selectedBracket.participants.find(p => 
      p.user._id === participantId
    );
    
    return participant?.dojo || '';
  };

  const handleMatchClick = (match: any) => {
    setSelectedMatch(match);
    setMatchDialog(true);
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const renderBracketRounds = () => {
    if (!selectedBracket || !selectedBracket.rounds) return null;

    const rounds = selectedBracket.rounds.sort((a, b) => a.roundNumber - b.roundNumber);

    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {rounds.map((round) => (
          <RoundColumn key={round.roundNumber}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
                {round.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Round {round.roundNumber}
              </Typography>
              {round.completed && (
                <Chip
                  label="Completed"
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {round.matches.map((matchId) => {
              const match = selectedBracket.matches.find(m => m.matchId === matchId);
              if (!match) return null;

              return (
                <MatchCard
                  key={match.matchId}
                  status={match.status}
                  onClick={() => handleMatchClick(match)}
                  sx={{ mb: 2 }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Match {match.matchId}
                      </Typography>
                      <Chip
                        label={match.status}
                        size="small"
                        sx={{
                          backgroundColor: getMatchStatusColor(match.status),
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    {match.isBye ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          BYE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getParticipantName(match.participant1 || '')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          advances automatically
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <ParticipantRow
                          isWinner={match.winner === match.participant1}
                          isLoser={match.status === 'completed' && match.winner !== match.participant1}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getParticipantName(match.participant1 || '')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getParticipantDojo(match.participant1 || '')}
                            </Typography>
                          </Box>
                          {match.winner === match.participant1 && (
                            <CheckCircle sx={{ color: '#28a745', fontSize: 20 }} />
                          )}
                        </ParticipantRow>

                        <Divider sx={{ my: 1 }} />

                        <ParticipantRow
                          isWinner={match.winner === match.participant2}
                          isLoser={match.status === 'completed' && match.winner !== match.participant2}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {getParticipantName(match.participant2 || '')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getParticipantDojo(match.participant2 || '')}
                            </Typography>
                          </Box>
                          {match.winner === match.participant2 && (
                            <CheckCircle sx={{ color: '#28a745', fontSize: 20 }} />
                          )}
                        </ParticipantRow>
                      </>
                    )}

                    {match.result && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Result: {match.result.type}
                        </Typography>
                        {match.result.duration && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Duration: {Math.floor(match.result.duration / 60)}:{(match.result.duration % 60).toString().padStart(2, '0')}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {match.scheduledTime && (
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(match.scheduledTime).toLocaleDateString()} at{' '}
                          {new Date(match.scheduledTime).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </MatchCard>
              );
            })}
          </RoundColumn>
        ))}
      </Box>
    );
  };

  const renderFinalResults = () => {
    if (!selectedBracket?.finalResults || selectedBracket.status !== 'completed') {
      return null;
    }

    const { finalResults } = selectedBracket;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center', color: '#212529' }}>
          🏆 Final Results - {selectedBracket.category}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {finalResults.first && (
            <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
              <Card sx={{ textAlign: 'center', border: '3px solid #ffd700' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#ffd700', width: 60, height: 60 }}>
                      <Typography variant="h4">🥇</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
                      1st Place
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {getParticipantName(finalResults.first)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getParticipantDojo(finalResults.first)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {finalResults.second && (
            <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
              <Card sx={{ textAlign: 'center', border: '3px solid #c0c0c0' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#c0c0c0', width: 60, height: 60 }}>
                      <Typography variant="h4">🥈</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
                      2nd Place
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {getParticipantName(finalResults.second)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getParticipantDojo(finalResults.second)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {finalResults.third && finalResults.third.length > 0 && (
            <Box sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
              <Card sx={{ textAlign: 'center', border: '3px solid #cd7f32' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: '#cd7f32', width: 60, height: 60 }}>
                      <Typography variant="h4">🥉</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
                      3rd Place
                    </Typography>
                  </Box>
                  {finalResults.third.map((thirdPlace, index) => (
                    <Box key={index} sx={{ mb: index < finalResults.third!.length - 1 ? 1 : 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {getParticipantName(thirdPlace)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getParticipantDojo(thirdPlace)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Tournament completed on {new Date(finalResults.completedAt!).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total participants: {finalResults.participantCount}
          </Typography>
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#dc3545' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#6c757d' }}>
          Loading tournament brackets...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#212529', mb: 2 }}>
          Tournament Brackets
        </Typography>
        {tournament && (
          <Typography variant="h5" sx={{ color: '#6c757d', mb: 3 }}>
            {tournament.name}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Select Category"
            >
              {brackets.map((bracket) => (
                <MenuItem key={bracket._id} value={bracket.category}>
                  {bracket.category}
                  <Chip 
                    label={bracket.status} 
                    size="small" 
                    sx={{ ml: 1 }}
                    color={bracket.status === 'completed' ? 'success' : 'default'}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Refresh Brackets">
            <IconButton onClick={fetchTournamentData} sx={{ color: '#dc3545' }}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Bracket">
            <IconButton sx={{ color: '#dc3545' }}>
              <Download />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share Bracket">
            <IconButton sx={{ color: '#dc3545' }}>
              <Share />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {selectedBracket ? (
        <>
          {/* Bracket Progress */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedBracket.category} - {selectedBracket.type.replace('-', ' ').toUpperCase()}
              </Typography>
              <Chip
                label={selectedBracket.status.toUpperCase()}
                color={selectedBracket.status === 'completed' ? 'success' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#dc3545' }}>
                  {selectedBracket.participants.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participants
                </Typography>
              </Box>
              
              <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#dc3545' }}>
                  {selectedBracket.matches.filter(m => m.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Matches
                </Typography>
              </Box>
              
              <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#dc3545' }}>
                  {selectedBracket.rounds?.filter(r => r.completed).length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Rounds
                </Typography>
              </Box>
              
              <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#dc3545' }}>
                  {Math.round((selectedBracket.matches.filter(m => m.status === 'completed').length / selectedBracket.matches.length) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={(selectedBracket.matches.filter(m => m.status === 'completed').length / selectedBracket.matches.length) * 100}
              sx={{
                mt: 2,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#dc3545',
                }
              }}
            />
          </Paper>

          {/* Final Results */}
          {renderFinalResults()}

          {/* Bracket Visualization */}
          <Paper elevation={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Bracket Structure
              </Typography>
              
              <BracketContainer>
                {renderBracketRounds()}
              </BracketContainer>
            </Box>
          </Paper>
        </>
      ) : (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 60, color: '#6c757d', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6c757d', mb: 1 }}>
            No brackets available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Brackets will be generated once registration closes
          </Typography>
        </Paper>
      )}

      {/* Match Details Dialog */}
      <Dialog
        open={matchDialog}
        onClose={() => setMatchDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Sports sx={{ fontSize: 40, color: '#dc3545', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Match Details
          </Typography>
        </DialogTitle>
        
        {selectedMatch && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flex: '1 1 250px' }}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Red Corner
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#dc3545' }}>
                    {getParticipantName(selectedMatch.participant1 || '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getParticipantDojo(selectedMatch.participant1 || '')}
                  </Typography>
                  {selectedMatch.winner === selectedMatch.participant1 && (
                    <Chip label="WINNER" color="success" sx={{ mt: 1 }} />
                  )}
                </Paper>
              </Box>
              
              <Box sx={{ flex: '1 1 250px' }}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Blue Corner
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#007bff' }}>
                    {getParticipantName(selectedMatch.participant2 || '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getParticipantDojo(selectedMatch.participant2 || '')}
                  </Typography>
                  {selectedMatch.winner === selectedMatch.participant2 && (
                    <Chip label="WINNER" color="success" sx={{ mt: 1 }} />
                  )}
                </Paper>
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Match Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 150px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Round:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedMatch.roundName}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedMatch.status.toUpperCase()}
                  </Typography>
                </Box>
                {selectedMatch.scheduledTime && (
                  <>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="body2" color="text.secondary">
                        Scheduled:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedMatch.scheduledTime).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="body2" color="text.secondary">
                        Time:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedMatch.scheduledTime).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </>
                )}
                {selectedMatch.result && (
                  <>
                    <Box sx={{ flex: '1 1 150px' }}>
                      <Typography variant="body2" color="text.secondary">
                        Result:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedMatch.result.type}
                      </Typography>
                    </Box>
                    {selectedMatch.result.duration && (
                      <Box sx={{ flex: '1 1 150px' }}>
                        <Typography variant="body2" color="text.secondary">
                          Duration:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {Math.floor(selectedMatch.result.duration / 60)}:{(selectedMatch.result.duration % 60).toString().padStart(2, '0')}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </DialogContent>
        )}
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setMatchDialog(false)}>
            Close
          </Button>
          {selectedMatch?.status !== 'completed' && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              sx={{
                background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                },
              }}
            >
              Start Match
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentBrackets;
