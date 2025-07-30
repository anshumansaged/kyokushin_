import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Avatar,
  Tooltip,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Group,
  AccessTime,
  AttachMoney,
  CheckCircle,
  Cancel,
  Star,
  EmojiEvents,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(33, 37, 41, 0.15)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #dc3545, #212529)',
  },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(220, 53, 69, 0.15)',
    borderColor: '#dc3545',
  },
  '&.selected': {
    borderColor: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.05)',
  },
}));

interface StatusChipProps {
  status: string;
}

const StatusChip = styled(Chip)<StatusChipProps>(({ status }) => ({
  fontWeight: 600,
  ...(status === 'registration-open' && {
    backgroundColor: '#d4edda',
    color: '#155724',
  }),
  ...(status === 'upcoming' && {
    backgroundColor: '#fff3cd',
    color: '#856404',
  }),
  ...(status === 'ongoing' && {
    backgroundColor: '#cce7ff',
    color: '#004085',
  }),
  ...(status === 'completed' && {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  }),
}));

interface Tournament {
  _id: string;
  name: string;
  description: string;
  date: string;
  endDate?: string;
  location: {
    venue: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
  };
  status: string;
  type: string;
  categories: Array<{
    name: string;
    ageGroup: { min: number; max: number };
    beltLevel: { min: string; max: string };
    weight: { min: number; max: number; unit: string };
    gender: string;
    maxParticipants?: number;
    participantCount?: number;
    spotsRemaining?: number;
    isFull?: boolean;
  }>;
  registration: {
    opens: string;
    closes: string;
    fee: {
      amount: number;
      currency: string;
      earlyBird?: {
        amount: number;
        deadline: string;
      };
    };
    requirements: string[];
  };
  participants: Array<{
    user: string;
    category: string;
    status: string;
    registeredAt: string;
  }>;
  stats: {
    totalRegistrations: number;
  };
}

const TournamentRegistration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string>('');

  useEffect(() => {
    fetchTournamentDetails();
    fetchUserProfile();
  }, [id]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const [tournamentResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/tournaments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/tournaments/${id}/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (tournamentResponse.ok && categoriesResponse.ok) {
        const tournamentData = await tournamentResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setTournament(tournamentData.data);
        setCategories(categoriesData.data);
      } else {
        setError('Failed to load tournament details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
        
        // Auto-suggest category based on user profile
        if (tournament) {
          suggestCategoryForUser(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const suggestCategoryForUser = (profile: any) => {
    if (!tournament || !categories) return;

    const suitable = categories.find(cat => {
      const ageMatch = !cat.ageGroup || 
        (profile.age >= cat.ageGroup.min && profile.age <= cat.ageGroup.max);
      const weightMatch = !cat.weight || 
        (profile.weight >= cat.weight.min && profile.weight <= cat.weight.max);
      const genderMatch = cat.gender === 'mixed' || cat.gender === profile.gender;
      
      return ageMatch && weightMatch && genderMatch && !cat.isFull;
    });

    if (suitable) {
      setSuggestedCategory(suitable.name);
      setSelectedCategory(suitable.name);
    }
  };

  const handleRegistration = async () => {
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    try {
      setRegistering(true);
      setError('');

      const response = await fetch(`/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ category: selectedCategory })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setRegistrationDialog(false);
        fetchTournamentDetails(); // Refresh data
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    const now = new Date();
    const opens = new Date(tournament.registration.opens);
    const closes = new Date(tournament.registration.closes);
    return now >= opens && now <= closes && tournament.status === 'registration-open';
  };

  const isUserRegistered = () => {
    return tournament?.participants.some(p => p.user === userProfile?._id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#dc3545' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#6c757d' }}>
          Loading tournament details...
        </Typography>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">Tournament not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/tournaments')}
          sx={{ mb: 2, color: '#dc3545' }}
        >
          ← Back to Tournaments
        </Button>
        
        <Typography variant="h3" sx={{ fontWeight: 600, color: '#212529', mb: 2 }}>
          {tournament.name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <StatusChip 
            label={tournament.status.replace('-', ' ').toUpperCase()} 
            status={tournament.status}
          />
          <Chip 
            icon={<EmojiEvents />} 
            label={tournament.type.toUpperCase()} 
            variant="outlined"
          />
          <Chip 
            icon={<Group />} 
            label={`${tournament.stats.totalRegistrations} Registered`} 
            variant="outlined"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Tournament Information */}
        <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
          <StyledPaper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#212529' }}>
              Tournament Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ color: '#dc3545', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(tournament.date)}
                    </Typography>
                    {tournament.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        to {formatDate(tournament.endDate)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ color: '#dc3545', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {tournament.location.venue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tournament.location.address.city}, {tournament.location.address.state}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ color: '#dc3545', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Period
                    </Typography>
                    <Typography variant="body2">
                      Opens: {formatDate(tournament.registration.opens)}
                    </Typography>
                    <Typography variant="body2">
                      Closes: {formatDate(tournament.registration.closes)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: '1 1 250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ color: '#dc3545', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Registration Fee
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ${tournament.registration.fee.amount} {tournament.registration.fee.currency}
                    </Typography>
                    {tournament.registration.fee.earlyBird && (
                      <Typography variant="body2" color="text.secondary">
                        Early Bird: ${tournament.registration.fee.earlyBird.amount}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {tournament.description && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {tournament.description}
                </Typography>
              </Box>
            )}

            {tournament.registration.requirements.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Requirements
                </Typography>
                <List dense>
                  {tournament.registration.requirements.map((req, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#dc3545', width: 24, height: 24 }}>
                          <CheckCircle sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </StyledPaper>

          {/* Categories */}
          <StyledPaper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#212529' }}>
                Competition Categories
              </Typography>
              <Tooltip title="Refresh Categories">
                <IconButton onClick={fetchTournamentDetails}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>

            {suggestedCategory && (
              <Alert 
                severity="info" 
                sx={{ mb: 3, backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#dc3545' }} />
                  <Typography>
                    Suggested category for you: <strong>{suggestedCategory}</strong>
                  </Typography>
                </Box>
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {categories.map((category, index) => (
                <Box key={index} sx={{ flex: '1 1 280px', maxWidth: '350px' }}>
                  <CategoryCard 
                    className={selectedCategory === category.name ? 'selected' : ''}
                    onClick={() => !category.isFull && setSelectedCategory(category.name)}
                  >
                    <CardHeader
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {category.name}
                          </Typography>
                          {category.name === suggestedCategory && (
                            <Star sx={{ color: '#ffc107', fontSize: 20 }} />
                          )}
                        </Box>
                      }
                      action={
                        category.isFull ? (
                          <Chip label="Full" color="error" size="small" />
                        ) : (
                          <Chip 
                            label={`${category.participantCount || 0}/${category.maxParticipants || '∞'}`} 
                            color="primary" 
                            size="small" 
                          />
                        )
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {category.ageGroup && (
                          <Typography variant="body2" color="text.secondary">
                            Age: {category.ageGroup.min}-{category.ageGroup.max} years
                          </Typography>
                        )}
                        {category.weight && (
                          <Typography variant="body2" color="text.secondary">
                            Weight: {category.weight.min}-{category.weight.max} {category.weight.unit}
                          </Typography>
                        )}
                        {category.beltLevel && (
                          <Typography variant="body2" color="text.secondary">
                            Belt: {category.beltLevel.min} - {category.beltLevel.max}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Gender: {category.gender}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CategoryCard>
                </Box>
              ))}
            </Box>
          </StyledPaper>
        </Box>

        {/* Registration Panel */}
        <Box sx={{ flex: '1 1 350px', minWidth: '320px' }}>
          <StyledPaper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Registration
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {isUserRegistered() ? (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 60, color: '#28a745', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#28a745', mb: 1 }}>
                  Already Registered!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You are registered for this tournament
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/tournaments/${id}/my-registration`)}
                  sx={{ borderColor: '#dc3545', color: '#dc3545' }}
                >
                  View My Registration
                </Button>
              </Box>
            ) : isRegistrationOpen() ? (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedCategory ? (
                    <>Selected: <strong>{selectedCategory}</strong></>
                  ) : (
                    'Please select a category above'
                  )}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedCategory}
                  onClick={() => setRegistrationDialog(true)}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                    },
                    mb: 2
                  }}
                >
                  Register Now
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Registration closes on {formatDate(tournament.registration.closes)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Cancel sx={{ fontSize: 60, color: '#6c757d', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6c757d', mb: 1 }}>
                  Registration Closed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tournament.status === 'registration-closed' 
                    ? 'Registration period has ended'
                    : 'Registration is not open yet'
                  }
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Quick Stats */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Tournament Stats
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Registered:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {tournament.stats.totalRegistrations}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Categories:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {categories.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Days Until Event:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {Math.ceil((new Date(tournament.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Box>
      </Box>

      {/* Registration Confirmation Dialog */}
      <Dialog
        open={registrationDialog}
        onClose={() => setRegistrationDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <EmojiEvents sx={{ fontSize: 40, color: '#dc3545', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Confirm Registration
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              You are about to register for <strong>{tournament.name}</strong> 
              in the <strong>{selectedCategory}</strong> category.
            </Typography>
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Registration Details:
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Tournament: {tournament.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Category: {selectedCategory}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Date: {formatDate(tournament.date)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Fee: ${tournament.registration.fee.amount} {tournament.registration.fee.currency}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Please ensure you meet all the category requirements before registering.
              Registration fees are non-refundable.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setRegistrationDialog(false)}
            disabled={registering}
            variant="outlined"
            sx={{ borderColor: '#6c757d', color: '#6c757d' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegistration}
            disabled={registering}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            {registering ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Registering...
              </>
            ) : (
              'Confirm Registration'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentRegistration;
