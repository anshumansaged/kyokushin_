import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  EmojiEvents,
  People,
  Schedule,
  Assessment,
  Settings,
  PlayArrow,
  SportsKabaddi,
  CheckCircle,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const DashboardCard = styled(Card)(({ theme }) => ({
  minHeight: '200px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(220, 53, 69, 0.15)',
  },
}));

interface StatusChipProps {
  status: string;
}

const StatusChip = styled(Chip)<StatusChipProps>(({ status }) => ({
  fontWeight: 600,
  color: 'white',
  backgroundColor: 
    status === 'completed' ? '#28a745' :
    status === 'ongoing' ? '#dc3545' :
    status === 'upcoming' ? '#007bff' :
    status === 'registration-open' ? '#ffc107' :
    '#6c757d',
}));

const QuickActionFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: '#dc3545',
  color: 'white',
  '&:hover': {
    backgroundColor: '#c82333',
  },
}));

interface Tournament {
  _id: string;
  name: string;
  date: string;
  endDate?: string;
  location: {
    venue: string;
    address: {
      city: string;
      state: string;
    };
  };
  status: string;
  type: string;
  categories: any[];
  participants: any[];
  registrationCount: number;
  stats: {
    totalRegistrations: number;
    totalRevenue: number;
    attendanceRate: number;
  };
}

interface Bout {
  _id: string;
  tournament: string;
  category: string;
  round: number;
  roundName: string;
  participants: {
    red: { name: string; dojo: string };
    blue: { name: string; dojo: string };
  };
  status: string;
  scheduledTime: string;
  court: string;
}

const TournamentDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeBouts, setActiveBouts] = useState<Bout[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    venue: '',
    city: '',
    state: '',
    type: 'tournament',
    description: ''
  });

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalParticipants: 0,
    liveBouts: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tournaments
      const tournamentsResponse = await fetch('/api/tournaments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const tournamentsData = await tournamentsResponse.json();
      
      if (tournamentsData.success && Array.isArray(tournamentsData.data)) {
        setTournaments(tournamentsData.data);
        
        // Calculate stats
        const stats = {
          totalTournaments: tournamentsData.data.length,
          activeTournaments: tournamentsData.data.filter((t: Tournament) => t.status === 'ongoing').length,
          totalParticipants: tournamentsData.data.reduce((acc: number, t: Tournament) => acc + t.registrationCount, 0),
          liveBouts: 0, // Will be updated when fetching bouts
          upcomingEvents: tournamentsData.data.filter((t: Tournament) => t.status === 'upcoming').length,
          completedEvents: tournamentsData.data.filter((t: Tournament) => t.status === 'completed').length
        };
        setDashboardStats(stats);
      } else {
        // Fallback to empty array if API response is not in expected format
        setTournaments([]);
        console.warn('Tournament data is not in expected format:', tournamentsData);
      }

      // Fetch active bouts
      const boutsResponse = await fetch('/api/bouts?status=in-progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const boutsData = await boutsResponse.json();
      
      if (boutsData.success) {
        setActiveBouts(boutsData.data);
        setDashboardStats(prev => ({ ...prev, liveBouts: boutsData.data.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async () => {
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newTournament,
          location: {
            venue: newTournament.venue,
            address: {
              city: newTournament.city,
              state: newTournament.state
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCreateDialog(false);
        setNewTournament({
          name: '',
          date: '',
          venue: '',
          city: '',
          state: '',
          type: 'tournament',
          description: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: '#28a745' }} />;
      case 'ongoing': return <PlayArrow sx={{ color: '#dc3545' }} />;
      case 'upcoming': return <Schedule sx={{ color: '#007bff' }} />;
      case 'registration-open': return <People sx={{ color: '#ffc107' }} />;
      default: return <Warning sx={{ color: '#6c757d' }} />;
    }
  };

  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#dc3545' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading tournament dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              🏆 Tournament Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Comprehensive tournament and bout management system
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Dashboard">
              <IconButton sx={{ color: 'white' }} onClick={fetchDashboardData}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setCreateDialog(true)}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
            >
              New Tournament
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dashboard Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#dc3545', color: 'white' }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.totalTournaments}
              </Typography>
              <Typography variant="body2">Total Tournaments</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#28a745', color: 'white' }}>
            <CardContent>
              <PlayArrow sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.activeTournaments}
              </Typography>
              <Typography variant="body2">Active Events</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#007bff', color: 'white' }}>
            <CardContent>
              <People sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.totalParticipants}
              </Typography>
              <Typography variant="body2">Participants</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#ffc107', color: 'white' }}>
            <CardContent>
              <SportsKabaddi sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.liveBouts}
              </Typography>
              <Typography variant="body2">Live Bouts</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#17a2b8', color: 'white' }}>
            <CardContent>
              <Schedule sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.upcomingEvents}
              </Typography>
              <Typography variant="body2">Upcoming</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
          <Card sx={{ textAlign: 'center', bgcolor: '#6c757d', color: 'white' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dashboardStats.completedEvents}
              </Typography>
              <Typography variant="body2">Completed</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Main Navigation Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#dc3545',
                fontWeight: 600,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#dc3545',
            },
          }}
        >
          <Tab label="All Tournaments" icon={<EmojiEvents />} iconPosition="start" />
          <Tab label="Live Bouts" icon={<SportsKabaddi />} iconPosition="start" />
          <Tab label="Registration" icon={<People />} iconPosition="start" />
          <Tab label="Brackets" icon={<Assessment />} iconPosition="start" />
          <Tab label="Results" icon={<CheckCircle />} iconPosition="start" />
          <Tab label="Settings" icon={<Settings />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {Array.isArray(tournaments) && tournaments.length > 0 ? tournaments.map((tournament) => (
            <Box key={tournament._id} sx={{ flex: '1 1 350px', minWidth: '320px', maxWidth: '400px' }}>
              <DashboardCard onClick={() => navigate(`/tournaments/${tournament._id}`)}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(tournament.status)}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {tournament.name}
                      </Typography>
                    </Box>
                  }
                  action={
                    <StatusChip 
                      label={tournament.status.replace('-', ' ').toUpperCase()} 
                      size="small"
                      status={tournament.status}
                    />
                  }
                />
                
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tournament.location.venue} • {tournament.location.address.city}, {tournament.location.address.state}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    📅 {new Date(tournament.date).toLocaleDateString()}
                    {tournament.endDate && ` - ${new Date(tournament.endDate).toLocaleDateString()}`}
                  </Typography>

                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#dc3545' }}>
                        {tournament.registrationCount || 0}
                      </Typography>
                      <Typography variant="caption">Participants</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#dc3545' }}>
                        {tournament.categories?.length || 0}
                      </Typography>
                      <Typography variant="caption">Categories</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </DashboardCard>
            </Box>
          )) : (
            <Box sx={{ 
              width: '100%', 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <EmojiEvents sx={{ fontSize: 60, color: '#6c757d' }} />
              <Typography variant="h6" color="text.secondary">
                No tournaments available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first tournament to get started
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Live Bouts
        </Typography>
        
        {activeBouts.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            No live bouts at the moment
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {activeBouts.map((bout) => (
              <Box key={bout._id} sx={{ flex: '1 1 450px', minWidth: '400px' }}>
                <Card elevation={2}>
                  <CardHeader
                    title={`${bout.category} - ${bout.roundName}`}
                    action={
                      <Chip label="LIVE" color="error" sx={{ fontWeight: 600 }} />
                    }
                  />
                  
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: '#dc3545', width: 32, height: 32 }}>R</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {bout.participants.red.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bout.participants.red.dojo}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>VS</Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {bout.participants.blue.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bout.participants.blue.dojo}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: '#007bff', width: 32, height: 32 }}>B</Avatar>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Court: {bout.court || 'TBA'}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/bouts/${bout._id}/timer`)}
                        sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
                      >
                        Manage Bout
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Tournament Registration
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tournaments/register')}
          sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
        >
          Open Registration Portal
        </Button>
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Tournament Brackets
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assessment />}
          onClick={() => navigate('/tournaments/brackets')}
          sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
        >
          Manage Brackets
        </Button>
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Tournament Results
        </Typography>
        <Button
          variant="contained"
          startIcon={<CheckCircle />}
          onClick={() => navigate('/tournaments/results')}
          sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
        >
          View Results
        </Button>
      </TabPanel>

      <TabPanel value={currentTab} index={5}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Tournament Settings
        </Typography>
        <Alert severity="info">
          Tournament configuration and settings will be available here.
        </Alert>
      </TabPanel>

      {/* Quick Action FAB */}
      <QuickActionFab onClick={() => setCreateDialog(true)}>
        <Add />
      </QuickActionFab>

      {/* Create Tournament Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Tournament</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Tournament Name"
              value={newTournament.name}
              onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="Date"
                type="date"
                value={newTournament.date}
                onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <FormControl sx={{ flex: '1 1 200px' }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTournament.type}
                  onChange={(e) => setNewTournament({ ...newTournament, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="tournament">Tournament</MenuItem>
                  <MenuItem value="seminar">Seminar</MenuItem>
                  <MenuItem value="grading">Grading</MenuItem>
                  <MenuItem value="camp">Training Camp</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="Venue"
              value={newTournament.venue}
              onChange={(e) => setNewTournament({ ...newTournament, venue: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="City"
                value={newTournament.city}
                onChange={(e) => setNewTournament({ ...newTournament, city: e.target.value })}
              />
              
              <TextField
                sx={{ flex: '1 1 200px' }}
                label="State"
                value={newTournament.state}
                onChange={(e) => setNewTournament({ ...newTournament, state: e.target.value })}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newTournament.description}
              onChange={(e) => setNewTournament({ ...newTournament, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTournament}
            variant="contained"
            disabled={!newTournament.name || !newTournament.date || !newTournament.venue}
            sx={{ bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
          >
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentDashboard;
