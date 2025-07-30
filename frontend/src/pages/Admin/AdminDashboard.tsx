import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  CardActions,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  School,
  LocationOn,
  EmojiEvents,
  Announcement,
  PhotoLibrary,
  Add,
  Edit,
  Visibility,
  PendingActions,
  TrendingUp,
  Group,
  Assessment,
  Notifications,
  Settings,
  MoreVert,
  FilterList,
  Search,
  Download,
  Refresh,
  Dashboard as DashboardIcon,
  Schedule,
  Analytics,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  useAdminStats, 
  usePendingUsers, 
  useAnnouncements, 
  useTournaments,
  User,
  Announcement as AnnouncementType,
  Tournament 
} from '../../hooks/useAdminData';

const AdminContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(220, 53, 69, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(220, 53, 69, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #dc3545, #ff6b7a)',
  },
}));

const ProfessionalCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e9ecef',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
  color: 'white',
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  borderRadius: '0 0 24px 24px',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(50px, -50px)',
  },
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  border: '1px solid #e9ecef',
}));

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, rgba(220, 53, 69, 0.02) 100%)',
  border: '1px solid rgba(220, 53, 69, 0.1)',
}));

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    city: '',
    state: '',
    registrationOpens: '',
    registrationCloses: ''
  });

  // Use the custom hooks
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { users: pendingUsers, loading: usersLoading, approveUser } = usePendingUsers();
  const { announcements, loading: announcementsLoading, createAnnouncement } = useAnnouncements();
  const { tournaments, loading: tournamentsLoading, createTournament } = useTournaments();

  const handleApproveUser = async (userId: string, action: 'approve' | 'reject') => {
    const result = await approveUser(userId, action);
    if (result.success) {
      setSnackbar({ 
        open: true, 
        message: `User ${action}d successfully!`, 
        severity: 'success' 
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: result.error || `Failed to ${action} user`, 
        severity: 'error' 
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields', 
        severity: 'error' 
      });
      return;
    }

    const result = await createAnnouncement(announcementForm);
    if (result.success) {
      setShowAnnouncementDialog(false);
      setAnnouncementForm({ title: '', content: '', priority: 'medium' });
      setSnackbar({ 
        open: true, 
        message: 'Announcement created successfully!', 
        severity: 'success' 
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: result.error || 'Failed to create announcement', 
        severity: 'error' 
      });
    }
  };

  const handleCreateTournament = async () => {
    if (!tournamentForm.name || !tournamentForm.date || !tournamentForm.venue) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields', 
        severity: 'error' 
      });
      return;
    }

    const tournamentData = {
      name: tournamentForm.name,
      description: tournamentForm.description,
      date: tournamentForm.date,
      location: {
        venue: tournamentForm.venue,
        address: {
          city: tournamentForm.city,
          state: tournamentForm.state
        }
      },
      registration: {
        opens: tournamentForm.registrationOpens,
        closes: tournamentForm.registrationCloses
      }
    };

    const result = await createTournament(tournamentData);
    if (result.success) {
      setShowTournamentDialog(false);
      setTournamentForm({
        name: '',
        description: '',
        date: '',
        venue: '',
        city: '',
        state: '',
        registrationOpens: '',
        registrationCloses: ''
      });
      setSnackbar({ 
        open: true, 
        message: 'Tournament created successfully!', 
        severity: 'success' 
      });
    } else {
      setSnackbar({ 
        open: true, 
        message: result.error || 'Failed to create tournament', 
        severity: 'error' 
      });
    }
  };

// Enhanced TabPanel component with professional styling
const TabPanel = ({ children, value, index, ...other }: any) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admin-tabpanel-${index}`}
    aria-labelledby={`admin-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ 
        p: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        minHeight: '500px'
      }}>
        {children}
      </Box>
    )}
  </div>
);

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(220, 53, 69, 0.1)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(220, 53, 69, 0.15)',
    borderColor: 'rgba(220, 53, 69, 0.2)',
  },
}));  if (statsLoading || usersLoading || announcementsLoading || tournamentsLoading) {
    return (
      <AdminContainer>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Box sx={{ width: '300px' }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#dc3545' }}>
                Loading Admin Dashboard...
              </Typography>
              <LinearProgress 
                sx={{
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#dc3545',
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </AdminContainer>
    );
  }

  if (statsError) {
    return (
      <AdminContainer>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 4 }}>
            Error loading dashboard: {statsError}
          </Alert>
        </Container>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <Container maxWidth="xl">
        {/* Professional Header */}
        <HeaderSection>
          <Container maxWidth="xl">
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Analytics sx={{ fontSize: '2.5rem' }} />
                  <Box>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '1.8rem', md: '2.4rem' },
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      Admin Dashboard
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                      Kyokushin Karate Management System
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      sx={{ 
                        color: 'white', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export Report">
                    <IconButton 
                      sx={{ 
                        color: 'white', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: '600px' }}>
                Monitor system performance, manage users, and oversee organizational activities with comprehensive analytics and controls.
              </Typography>
            </Box>
          </Container>
        </HeaderSection>

        {/* Enhanced Stats Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#212529' }}>
            System Overview
          </Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { 
                xs: 'repeat(1, 1fr)', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)', 
                lg: 'repeat(5, 1fr)' 
              },
              gap: 3,
            }}
          >
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Person sx={{ fontSize: '3rem', color: '#dc3545' }} />
                  <Badge 
                    badgeContent={stats?.overview.totalStudents || 0} 
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }
                    }}
                  />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
                  {stats?.overview.totalStudents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Students
                </Typography>
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(40, 167, 69, 0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#28a745', fontWeight: 600 }}>
                    <TrendingUp sx={{ fontSize: '1rem', mr: 0.5 }} />
                    +12% this month
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
            
            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <School sx={{ fontSize: '3rem', color: '#dc3545' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
                  {stats?.overview.totalInstructors || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Certified Instructors
                </Typography>
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(220, 53, 69, 0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#dc3545', fontWeight: 600 }}>
                    <Group sx={{ fontSize: '1rem', mr: 0.5 }} />
                    Professional Level
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Badge badgeContent={stats?.overview.pendingApprovals || 0} color="error">
                    <PendingActions sx={{ fontSize: '3rem', color: '#ffc107' }} />
                  </Badge>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
                  {stats?.overview.pendingApprovals || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Pending Approvals
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {(stats?.overview.pendingApprovals || 0) > 0 ? (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="warning"
                      onClick={() => setCurrentTab(0)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Review Now
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#28a745', fontWeight: 600 }}>
                      ✓ All Clear
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <LocationOn sx={{ fontSize: '3rem', color: '#dc3545' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
                  {stats?.overview.activeCamps || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Active Camps
                </Typography>
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(23, 162, 184, 0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#17a2b8', fontWeight: 600 }}>
                    <Schedule sx={{ fontSize: '1rem', mr: 0.5 }} />
                    Ongoing Programs
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <EmojiEvents sx={{ fontSize: '3rem', color: '#ffc107' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#212529', mb: 1 }}>
                  {stats?.overview.upcomingTournaments || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Upcoming Events
                </Typography>
                <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: '#ffc107', fontWeight: 600 }}>
                    <EmojiEvents sx={{ fontSize: '1rem', mr: 0.5 }} />
                    Championship Ready
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Box>
        </Box>

        {/* Professional Navigation Tabs */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(220, 53, 69, 0.1)',
            mb: 0
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{
              backgroundColor: 'transparent',
              minHeight: '64px',
              '& .MuiTab-root': {
                minWidth: { xs: '120px', md: '180px' },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: '#6c757d',
                py: 2.5,
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#dc3545',
                  fontWeight: 600,
                  backgroundColor: 'rgba(220, 53, 69, 0.05)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(220, 53, 69, 0.03)',
                  color: '#dc3545',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#dc3545',
                height: 4,
                borderRadius: '2px 2px 0 0',
              },
            }}
          >
            <Tab 
              icon={<Group />} 
              label="User Management" 
              iconPosition="start"
              sx={{ 
                '& .MuiTab-iconWrapper': { 
                  mb: 0, 
                  mr: 1,
                  '& svg': { fontSize: '1.2rem' }
                } 
              }}
            />
            <Tab 
              icon={<Assessment />} 
              label="System Analytics" 
              iconPosition="start"
              sx={{ 
                '& .MuiTab-iconWrapper': { 
                  mb: 0, 
                  mr: 1,
                  '& svg': { fontSize: '1.2rem' }
                } 
              }}
            />
            <Tab 
              icon={<Notifications />} 
              label="Content Hub" 
              iconPosition="start"
              sx={{ 
                '& .MuiTab-iconWrapper': { 
                  mb: 0, 
                  mr: 1,
                  '& svg': { fontSize: '1.2rem' }
                } 
              }}
            />
            <Tab 
              icon={<EmojiEvents />} 
              label="Tournaments" 
              iconPosition="start"
              sx={{ 
                '& .MuiTab-iconWrapper': { 
                  mb: 0, 
                  mr: 1,
                  '& svg': { fontSize: '1.2rem' }
                } 
              }}
            />
          </Tabs>

          {/* Enhanced User Management Tab */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#212529',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1
                    }}
                  >
                    <Group sx={{ color: '#dc3545' }} />
                    User Management Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Review and manage user registration requests with comprehensive approval workflow
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Filter Users">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.2)' }
                      }}
                    >
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export User List">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.2)' }
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Quick Stats Cards */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 4
                }}
              >
                <MetricBox>
                  <PendingActions sx={{ fontSize: '2.5rem', color: '#ffc107', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#212529' }}>
                    {pendingUsers?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </MetricBox>
                
                <MetricBox>
                  <Person sx={{ fontSize: '2.5rem', color: '#28a745', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#212529' }}>
                    {stats?.overview.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Students
                  </Typography>
                </MetricBox>
                
                <MetricBox>
                  <School sx={{ fontSize: '2.5rem', color: '#dc3545', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#212529' }}>
                    {stats?.overview.totalInstructors || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instructors
                  </Typography>
                </MetricBox>
                
                <MetricBox>
                  <CheckCircle sx={{ fontSize: '2.5rem', color: '#17a2b8', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#212529' }}>
                    {(stats?.overview.totalStudents || 0) + (stats?.overview.totalInstructors || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Active
                  </Typography>
                </MetricBox>
              </Box>

              {/* Pending Users Section */}
              <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PendingActions sx={{ color: '#ffc107' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pending User Approvals
                      </Typography>
                      <Chip 
                        label={pendingUsers?.length || 0} 
                        size="small" 
                        color="warning"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  }
                  sx={{ 
                    bgcolor: 'rgba(255, 193, 7, 0.05)',
                    borderBottom: '1px solid rgba(255, 193, 7, 0.1)'
                  }}
                />
                <CardContent sx={{ p: 0 }}>
                  {pendingUsers && pendingUsers.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {pendingUsers.map((user: any, index: number) => (
                        <React.Fragment key={user._id}>
                          <ListItem 
                            sx={{ 
                              py: 2.5,
                              px: 3,
                              '&:hover': { 
                                bgcolor: 'rgba(220, 53, 69, 0.02)' 
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: user.role === 'instructor' ? '#dc3545' : '#28a745',
                                  width: 56,
                                  height: 56,
                                  fontSize: '1.5rem'
                                }}
                              >
                                {user.role === 'instructor' ? <School /> : <Person />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {user.profile?.firstName} {user.profile?.lastName}
                                  </Typography>
                                  <Chip 
                                    label={user.role.toUpperCase()} 
                                    size="small"
                                    color={user.role === 'instructor' ? 'error' : 'success'}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" color="text.secondary">
                                    📧 {user.email}
                                  </Typography>
                                  {user.profile?.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                      📱 {user.profile.phone}
                                    </Typography>
                                  )}
                                  {user.profile?.state && (
                                    <Typography variant="body2" color="text.secondary">
                                      📍 {user.profile.city}, {user.profile.state}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Registered: {new Date(user.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Stack>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Approve User">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleApproveUser(user._id, 'approve')}
                                    sx={{
                                      bgcolor: 'rgba(40, 167, 69, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(40, 167, 69, 0.2)' }
                                    }}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject User">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleApproveUser(user._id, 'reject')}
                                    sx={{
                                      bgcolor: 'rgba(220, 53, 69, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.2)' }
                                    }}
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Details">
                                  <IconButton
                                    color="info"
                                    sx={{
                                      bgcolor: 'rgba(23, 162, 184, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(23, 162, 184, 0.2)' }
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < pendingUsers.length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CheckCircle sx={{ fontSize: '4rem', color: '#28a745', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        All Caught Up! 🎉
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No pending user approvals at this time
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, color: '#212529', fontWeight: 500 }}>
                Detailed Statistics
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 3,
                  '& > *': { flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }
                }}
              >
                <Box>
                  <Card sx={{ borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#212529' }}>
                        State-wise Distribution
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {stats?.breakdown.stateWise.slice(0, 4).map((stateData) => (
                          <Box key={stateData._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{stateData._id}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {stateData.count} students
                            </Typography>
                          </Box>
                        )) || (
                          <Typography variant="body2" color="text.secondary">
                            No state data available
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card sx={{ borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#212529' }}>
                        Monthly Registrations
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {stats?.breakdown.monthlyTrends.slice(-3).map((monthData) => (
                          <Box key={`${monthData._id.year}-${monthData._id.month}`} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {new Date(monthData._id.year, monthData._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {monthData.students + monthData.instructors} total
                            </Typography>
                          </Box>
                        )) || (
                          <Typography variant="body2" color="text.secondary">
                            Registration trends will be displayed here as data becomes available.
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Content Management Tab */}
          <TabPanel value={currentTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#212529', fontWeight: 500 }}>
                  Content Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowAnnouncementDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                    },
                  }}
                >
                  New Announcement
                </Button>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 3,
                  '& > *': { flex: { xs: '1 1 100%', md: '1 1 calc(66% - 12px)' } },
                  '& > *:last-child': { flex: { xs: '1 1 100%', md: '1 1 calc(34% - 12px)' } }
                }}
              >
                <Box>
                  <Card sx={{ borderRadius: '8px' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#212529' }}>
                        Recent Announcements
                      </Typography>
                      {announcements.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No announcements yet. Create your first announcement!
                        </Typography>
                      ) : (
                        announcements.slice(0, 3).map((announcement) => (
                          <Box key={announcement._id} sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {announcement.title}
                              </Typography>
                              <Chip 
                                label={announcement.priority} 
                                size="small" 
                                color={announcement.priority === 'high' ? 'error' : 'default'}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1, color: '#6c757d' }}>
                              {announcement.content.substring(0, 100)}...
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              By {announcement.author.profile.firstName} {announcement.author.profile.lastName} • {new Date(announcement.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card sx={{ borderRadius: '8px', mb: 2 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PhotoLibrary sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>Gallery Management</Typography>
                      <Button variant="outlined" startIcon={<Add />} fullWidth>
                        Upload Photos
                      </Button>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: '8px' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Announcement sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>Quick Actions</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button variant="outlined" size="small">Send Newsletter</Button>
                        <Button variant="outlined" size="small">Update Website</Button>
                        <Button variant="outlined" size="small">Manage Users</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Events & Tournaments Tab */}
          <TabPanel value={currentTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ color: '#212529', fontWeight: 500 }}>
                  Events & Tournaments
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowTournamentDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                    },
                  }}
                >
                  New Tournament
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: '8px' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f8f7f4' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tournament Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Registrations</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tournaments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No tournaments yet. Create your first tournament!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tournaments.map((tournament) => (
                        <TableRow key={tournament._id}>
                          <TableCell sx={{ fontWeight: 500 }}>{tournament.name}</TableCell>
                          <TableCell>{new Date(tournament.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {tournament.location.venue}
                            {tournament.location.address.city && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#6c757d' }}>
                                {tournament.location.address.city}, {tournament.location.address.state}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{tournament.stats?.totalRegistrations || 0}</TableCell>
                          <TableCell>
                            <Chip 
                              label={tournament.status} 
                              color={tournament.status === 'upcoming' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#6c757d' }}>
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        </Paper>
      </Container>

      {/* Announcement Dialog */}
      <Dialog 
        open={showAnnouncementDialog} 
        onClose={() => setShowAnnouncementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef' }}>
          Create New Announcement
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={announcementForm.title}
            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            variant="outlined"
            multiline
            rows={4}
            value={announcementForm.content}
            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={announcementForm.priority}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAnnouncementDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateAnnouncement}
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tournament Dialog */}
      <Dialog 
        open={showTournamentDialog} 
        onClose={() => setShowTournamentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef' }}>
          Create New Tournament
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              '& > *': { flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }
            }}
          >
            <Box>
              <TextField
                fullWidth
                label="Tournament Name"
                variant="outlined"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Date"
                type="date"
                variant="outlined"
                value={tournamentForm.date}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Venue"
                variant="outlined"
                value={tournamentForm.venue}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, venue: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="City"
                variant="outlined"
                value={tournamentForm.city}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, city: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="State"
                variant="outlined"
                value={tournamentForm.state}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, state: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Registration Opens"
                type="date"
                variant="outlined"
                value={tournamentForm.registrationOpens}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, registrationOpens: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Registration Closes"
                type="date"
                variant="outlined"
                value={tournamentForm.registrationCloses}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, registrationCloses: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowTournamentDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateTournament}
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminContainer>
  );
};

export default AdminDashboard;
