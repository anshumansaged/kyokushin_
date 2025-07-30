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
  CardActions,
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
  AdminPanelSettings,
  PhotoCamera,
  VideoLibrary,
  InsertDriveFile,
  Security,
  Backup,
  CloudUpload,
  CalendarToday,
  SupervisorAccount,
  Business,
  Map,
  ImportExport,
  NotificationsActive,
  BarChart,
  DonutLarge,
  Timeline,
  Psychology,
  DeleteSweep,
  SelectAll,
  GetApp,
  Publish,
  Archive,
  Restore,
  SystemUpdate,
  Build,
  Storage,
  NetworkCheck,
  Speed,
  Memory,
  DeviceHub,
  DataUsage,
  MonitorHeart,
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
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [showDojoDialog, setShowDojoDialog] = useState(false);
  const [showMediaUploadDialog, setShowMediaUploadDialog] = useState(false);
  const [showSystemSettingsDialog, setShowSystemSettingsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDojo, setSelectedDojo] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'mp4'],
  });
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
  const [dojoForm, setDojoForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    phoneNumber: '',
    email: '',
    instructorId: '',
    capacity: 0,
    facilities: [] as string[],
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

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setShowUserDetailsDialog(true);
  };

  const handleCloseUserDetails = () => {
    setShowUserDetailsDialog(false);
    setSelectedUser(null);
  };

  const handleCreateDojo = async () => {
    if (!dojoForm.name || !dojoForm.address || !dojoForm.city || !dojoForm.state) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill in all required fields', 
        severity: 'error' 
      });
      return;
    }

    // Mock dojo creation - replace with actual API call
    console.log('Creating dojo:', dojoForm);
    
    setShowDojoDialog(false);
    setDojoForm({
      name: '',
      address: '',
      city: '',
      state: '',
      phoneNumber: '',
      email: '',
      instructorId: '',
      capacity: 0,
      facilities: [],
    });
    setSnackbar({ 
      open: true, 
      message: 'Dojo created successfully!', 
      severity: 'success' 
    });
  };

  const handleMediaUpload = async (files: FileList) => {
    // Mock media upload - replace with actual API call
    console.log('Uploading media files:', files);
    
    setShowMediaUploadDialog(false);
    setSnackbar({ 
      open: true, 
      message: `${files.length} file(s) uploaded successfully!`, 
      severity: 'success' 
    });
  };

  const handleBulkUserAction = async (action: 'approve' | 'reject') => {
    if (selectedUsers.length === 0) {
      setSnackbar({ 
        open: true, 
        message: 'Please select users first', 
        severity: 'error' 
      });
      return;
    }

    // Mock bulk action - replace with actual API call
    console.log(`Bulk ${action} for users:`, selectedUsers);
    
    setSelectedUsers([]);
    setSnackbar({ 
      open: true, 
      message: `${selectedUsers.length} user(s) ${action}d successfully!`, 
      severity: 'success' 
    });
  };

  const handleSystemSettingsUpdate = async (settings: any) => {
    // Mock settings update - replace with actual API call
    console.log('Updating system settings:', settings);
    
    setSystemSettings(prev => ({ ...prev, ...settings }));
    setSnackbar({ 
      open: true, 
      message: 'System settings updated successfully!', 
      severity: 'success' 
    });
  };

  const handleExportData = async (dataType: string) => {
    // Mock data export - replace with actual API call
    console.log('Exporting data:', dataType);
    
    setSnackbar({ 
      open: true, 
      message: `${dataType} data exported successfully!`, 
      severity: 'success' 
    });
  };

  const handleSystemBackup = async () => {
    // Mock system backup - replace with actual API call
    console.log('Creating system backup...');
    
    setSnackbar({ 
      open: true, 
      message: 'System backup created successfully!', 
      severity: 'success' 
    });
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
            <Tab 
              icon={<Business />} 
              label="Dojo Management" 
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
              icon={<PhotoLibrary />} 
              label="Media Gallery" 
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
              icon={<CalendarToday />} 
              label="Event Calendar" 
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
              icon={<Settings />} 
              label="System Settings" 
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
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    InputProps={{
                      startAdornment: <Search sx={{ color: '#6c757d', mr: 1 }} />
                    }}
                    sx={{ minWidth: 200 }}
                  />
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
                      onClick={() => handleExportData('users')}
                      sx={{ 
                        bgcolor: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.2)' }
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.2)' }
                      }}
                    >
                      <Refresh />
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
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Select All">
                        <IconButton 
                          onClick={() => {
                            if (selectedUsers.length === pendingUsers.length) {
                              setSelectedUsers([]);
                            } else {
                              setSelectedUsers(pendingUsers.map((user: any) => user._id));
                            }
                          }}
                        >
                          <SelectAll />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Users">
                        <IconButton onClick={() => handleExportData('users')}>
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ 
                    bgcolor: 'rgba(255, 193, 7, 0.05)',
                    borderBottom: '1px solid rgba(255, 193, 7, 0.1)'
                  }}
                />

                {/* Bulk Actions Bar */}
                {selectedUsers.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: 'rgba(220, 53, 69, 0.05)', borderBottom: '1px solid rgba(220, 53, 69, 0.1)' }}>
                    <Alert 
                      severity="info" 
                      sx={{ mb: 0 }}
                      action={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            color="success"
                            variant="contained"
                            onClick={() => handleBulkUserAction('approve')}
                          >
                            Approve Selected ({selectedUsers.length})
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            variant="contained"
                            onClick={() => handleBulkUserAction('reject')}
                          >
                            Reject Selected ({selectedUsers.length})
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => setSelectedUsers([])}
                          >
                            Clear
                          </Button>
                        </Box>
                      }
                    >
                      {selectedUsers.length} user(s) selected for bulk actions
                    </Alert>
                  </Box>
                )}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(prev => [...prev, user._id]);
                                  } else {
                                    setSelectedUsers(prev => prev.filter(id => id !== user._id));
                                  }
                                }}
                                style={{ 
                                  width: '18px', 
                                  height: '18px',
                                  accentColor: '#dc3545',
                                  cursor: 'pointer'
                                }}
                              />
                            </Box>
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
                                    onClick={() => handleViewUserDetails(user)}
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

              {/* User Roles & Permissions Section */}
              <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden', mt: 4 }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SupervisorAccount sx={{ color: '#dc3545' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        User Roles & Permissions
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        size="small"
                      >
                        Add User
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ImportExport />}
                        size="small"
                        onClick={() => handleExportData('roles')}
                      >
                        Export Roles
                      </Button>
                    </Box>
                  }
                  sx={{ 
                    bgcolor: 'rgba(220, 53, 69, 0.05)',
                    borderBottom: '1px solid rgba(220, 53, 69, 0.1)'
                  }}
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Active</TableCell>
                        <TableCell>Permissions</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Sample user data with roles */}
                      {[
                        { 
                          name: 'Anshuman Singh', 
                          email: 'anshuman@kyokushin.com', 
                          role: 'Super Admin', 
                          status: 'Active', 
                          lastActive: '5 mins ago',
                          permissions: ['All Access']
                        },
                        { 
                          name: 'Sensei Tanaka', 
                          email: 'tanaka@kyokushin.com', 
                          role: 'Instructor', 
                          status: 'Active', 
                          lastActive: '2 hours ago',
                          permissions: ['Manage Students', 'Create Events', 'View Reports']
                        },
                        { 
                          name: 'John Smith', 
                          email: 'john@kyokushin.com', 
                          role: 'Student', 
                          status: 'Active', 
                          lastActive: '1 day ago',
                          permissions: ['View Profile', 'Register Events']
                        },
                        { 
                          name: 'Admin User', 
                          email: 'admin@kyokushin.com', 
                          role: 'Admin', 
                          status: 'Inactive', 
                          lastActive: '5 days ago',
                          permissions: ['User Management', 'System Settings']
                        },
                      ].map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#dc3545' }}>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role} 
                              size="small" 
                              color={
                                user.role === 'Super Admin' ? 'error' :
                                user.role === 'Admin' ? 'warning' :
                                user.role === 'Instructor' ? 'primary' : 'success'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status} 
                              size="small" 
                              color={user.status === 'Active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {user.lastActive}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {user.permissions.slice(0, 2).map((permission, idx) => (
                                <Chip key={idx} label={permission} size="small" variant="outlined" />
                              ))}
                              {user.permissions.length > 2 && (
                                <Chip 
                                  label={`+${user.permissions.length - 2} more`} 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#6c757d' }}>
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              sx={{ color: user.status === 'Active' ? '#ffc107' : '#28a745' }}
                            >
                              {user.status === 'Active' ? <Cancel /> : <CheckCircle />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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

          {/* Dojo Management Tab */}
          <TabPanel value={currentTab} index={4}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                    <Business sx={{ color: '#dc3545' }} />
                    Dojo Management Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage dojos, locations, and instructor assignments across the organization
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowDojoDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                    },
                  }}
                >
                  Add New Dojo
                </Button>
              </Box>

              {/* Dojo Statistics Cards */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Business sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      24
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Dojos
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SupervisorAccount sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      18
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Certified Instructors
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Map sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      States Covered
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Group sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      1,247
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Box>

              {/* Dojo List */}
              <ProfessionalCard>
                <CardHeader 
                  title="Dojo Directory"
                  subheader="Manage dojo locations and instructor assignments"
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Export Data">
                        <IconButton>
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Import Data">
                        <IconButton>
                          <Publish />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dojo Name</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Instructor</TableCell>
                        <TableCell>Students</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Sample dojo data */}
                      {[
                        { name: 'Tokyo Central Dojo', location: 'Mumbai, Maharashtra', instructor: 'Sensei Tanaka', students: 85, status: 'Active' },
                        { name: 'Kyokushin Delhi', location: 'Delhi, Delhi', instructor: 'Sensei Kumar', students: 62, status: 'Active' },
                        { name: 'Bangalore Fighting Spirit', location: 'Bangalore, Karnataka', instructor: 'Sensei Raj', students: 47, status: 'Active' },
                      ].map((dojo, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#dc3545' }}>
                                <Business />
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                {dojo.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{dojo.location}</TableCell>
                          <TableCell>{dojo.instructor}</TableCell>
                          <TableCell>
                            <Chip label={dojo.students} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={dojo.status} 
                              size="small" 
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#6c757d' }}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <Map />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ProfessionalCard>
            </Box>
          </TabPanel>

          {/* Media Gallery Tab */}
          <TabPanel value={currentTab} index={5}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                    <PhotoLibrary sx={{ color: '#dc3545' }} />
                    Media Gallery Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage photos, videos, and documents for tournaments, events, and training
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    onClick={() => setShowMediaUploadDialog(true)}
                  >
                    Upload Photos
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<VideoLibrary />}
                    onClick={() => setShowMediaUploadDialog(true)}
                  >
                    Upload Videos
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setShowMediaUploadDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                      },
                    }}
                  >
                    Upload Media
                  </Button>
                </Box>
              </Box>

              {/* Media Statistics */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PhotoCamera sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      2,847
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Photos
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <VideoLibrary sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      156
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Videos
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <InsertDriveFile sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      89
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Documents
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Storage sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      45.2 GB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Storage Used
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Box>

              {/* Media Filter and Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Filter Media</InputLabel>
                    <Select
                      value={mediaFilter}
                      onChange={(e) => setMediaFilter(e.target.value)}
                      label="Filter Media"
                    >
                      <MenuItem value="all">All Media</MenuItem>
                      <MenuItem value="photos">Photos</MenuItem>
                      <MenuItem value="videos">Videos</MenuItem>
                      <MenuItem value="documents">Documents</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    placeholder="Search media..."
                    InputProps={{
                      startAdornment: <Search sx={{ color: '#6c757d', mr: 1 }} />
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Bulk Actions">
                    <IconButton>
                      <SelectAll />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Archive Selected">
                    <IconButton>
                      <Archive />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Selected">
                    <IconButton sx={{ color: '#dc3545' }}>
                      <DeleteSweep />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Media Gallery Grid */}
              <ProfessionalCard>
                <CardContent>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {/* Sample media items */}
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Card key={index} sx={{ position: 'relative', '&:hover': { transform: 'scale(1.02)' } }}>
                        <Box
                          sx={{
                            height: 150,
                            background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          {index % 3 === 0 ? <PhotoCamera sx={{ fontSize: '3rem' }} /> : 
                           index % 3 === 1 ? <VideoLibrary sx={{ fontSize: '3rem' }} /> : 
                           <InsertDriveFile sx={{ fontSize: '3rem' }} />}
                        </Box>
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" noWrap>
                            {index % 3 === 0 ? 'Tournament_2024_' : 
                             index % 3 === 1 ? 'Training_Video_' : 
                             'Certificate_'}
                            {index + 1}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {index % 3 === 0 ? '2.4 MB' : 
                               index % 3 === 1 ? '45.2 MB' : 
                               '156 KB'}
                            </Typography>
                            <IconButton size="small">
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </ProfessionalCard>
            </Box>
          </TabPanel>

          {/* Event Calendar Tab */}
          <TabPanel value={currentTab} index={6}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                    <CalendarToday sx={{ color: '#dc3545' }} />
                    Event Calendar Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage and schedule tournaments, seminars, gradings, and training events
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Schedule />}
                  >
                    Schedule Event
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                      },
                    }}
                  >
                    Create Event
                  </Button>
                </Box>
              </Box>

              {/* Calendar Overview */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EmojiEvents sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming Events
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Schedule sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Week
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Group sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      847
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Registrations
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Analytics sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Box>

              {/* Event List */}
              <ProfessionalCard>
                <CardHeader 
                  title="Upcoming Events"
                  subheader="Manage and monitor scheduled events"
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Registrations</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Sample event data */}
                      {[
                        { name: 'National Championship 2024', type: 'Tournament', date: '2024-08-15', location: 'Mumbai, Maharashtra', registrations: 245, status: 'Open' },
                        { name: 'Black Belt Grading', type: 'Grading', date: '2024-07-20', location: 'Delhi, Delhi', registrations: 18, status: 'Closed' },
                        { name: 'Summer Training Camp', type: 'Camp', date: '2024-09-01', location: 'Bangalore, Karnataka', registrations: 67, status: 'Open' },
                      ].map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {event.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={event.type} 
                              size="small" 
                              color={event.type === 'Tournament' ? 'primary' : event.type === 'Grading' ? 'secondary' : 'info'}
                            />
                          </TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>
                            <Badge badgeContent={event.registrations} color="primary" max={999}>
                              <Group />
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={event.status} 
                              size="small" 
                              color={event.status === 'Open' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#6c757d' }}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" sx={{ color: '#dc3545' }}>
                              <CalendarToday />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ProfessionalCard>
            </Box>
          </TabPanel>

          {/* System Settings Tab */}
          <TabPanel value={currentTab} index={7}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
                    <Settings sx={{ color: '#dc3545' }} />
                    System Settings Hub
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Configure platform settings, security, and system preferences
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Backup />}
                  >
                    Backup Data
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SystemUpdate />}
                    sx={{
                      background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                      },
                    }}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Box>

              {/* System Health Metrics */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MonitorHeart sx={{ fontSize: '3rem', color: '#28a745', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      99.8%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Uptime
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Speed sx={{ fontSize: '3rem', color: '#dc3545', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      245ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Memory sx={{ fontSize: '3rem', color: '#ffc107', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      67%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                  </CardContent>
                </StatsCard>

                <StatsCard sx={{ flex: '1 1 200px' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <NetworkCheck sx={{ fontSize: '3rem', color: '#28a745', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212529' }}>
                      Online
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Network Status
                    </Typography>
                  </CardContent>
                </StatsCard>
              </Box>

              {/* Settings Categories */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {/* General Settings */}
                <ProfessionalCard sx={{ flex: '1 1 400px' }}>
                  <CardHeader 
                    title="General Settings"
                    avatar={<Settings sx={{ color: '#dc3545' }} />}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Maintenance Mode</Typography>
                        <Chip 
                          label={systemSettings.maintenanceMode ? 'ON' : 'OFF'} 
                          color={systemSettings.maintenanceMode ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>User Registration</Typography>
                        <Chip 
                          label={systemSettings.registrationEnabled ? 'ENABLED' : 'DISABLED'} 
                          color={systemSettings.registrationEnabled ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Email Notifications</Typography>
                        <Chip 
                          label={systemSettings.emailNotifications ? 'ON' : 'OFF'} 
                          color={systemSettings.emailNotifications ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>SMS Notifications</Typography>
                        <Chip 
                          label={systemSettings.smsNotifications ? 'ON' : 'OFF'} 
                          color={systemSettings.smsNotifications ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Edit />}>
                      Configure
                    </Button>
                  </CardActions>
                </ProfessionalCard>

                {/* Security Settings */}
                <ProfessionalCard sx={{ flex: '1 1 400px' }}>
                  <CardHeader 
                    title="Security & Backup"
                    avatar={<Security sx={{ color: '#dc3545' }} />}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Backup Frequency</Typography>
                        <Chip 
                          label={systemSettings.backupFrequency.toUpperCase()} 
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Max File Size</Typography>
                        <Chip 
                          label={`${systemSettings.maxFileSize} MB`} 
                          color="info"
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Allowed File Types:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {systemSettings.allowedFileTypes.map((type, index) => (
                            <Chip key={index} label={type.toUpperCase()} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Security />}>
                      Security Settings
                    </Button>
                    <Button size="small" startIcon={<Backup />}>
                      Backup Now
                    </Button>
                  </CardActions>
                </ProfessionalCard>

                {/* System Tools */}
                <ProfessionalCard sx={{ flex: '1 1 400px' }}>
                  <CardHeader 
                    title="System Tools"
                    avatar={<Build sx={{ color: '#dc3545' }} />}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Button 
                        variant="outlined" 
                        startIcon={<DataUsage />}
                        fullWidth
                      >
                        Database Cleanup
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<ImportExport />}
                        fullWidth
                      >
                        Export/Import Data
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<DeviceHub />}
                        fullWidth
                      >
                        API Management
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<Analytics />}
                        fullWidth
                      >
                        System Logs
                      </Button>
                    </Stack>
                  </CardContent>
                </ProfessionalCard>
              </Box>
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

      {/* User Details Dialog */}
      <Dialog 
        open={showUserDetailsDialog} 
        onClose={handleCloseUserDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
          <Person sx={{ fontSize: 40, color: '#dc3545', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            User Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 250px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#212529' }}>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedUser.profile?.phoneNumber || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Role:</Typography>
                      <Chip 
                        label={selectedUser.role?.toUpperCase()} 
                        color={selectedUser.role === 'instructor' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ flex: '1 1 250px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#212529' }}>
                    Status & Registration
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip 
                        label={selectedUser.status?.toUpperCase()} 
                        color={selectedUser.status === 'approved' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Registered:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {selectedUser.profile?.state && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Location:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedUser.profile.city}, {selectedUser.profile.state}
                        </Typography>
                      </Box>
                    )}
                    {selectedUser.profile?.assignedInstructor && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Assigned Instructor:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedUser.profile.assignedInstructor}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              
              {selectedUser.role === 'instructor' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(220, 53, 69, 0.05)', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#212529' }}>
                    Instructor Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This user has registered as an instructor and requires approval to access instructor features.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseUserDetails}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dojo Creation Dialog */}
      <Dialog 
        open={showDojoDialog} 
        onClose={() => setShowDojoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business />
            Create New Dojo
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              fullWidth
              label="Dojo Name"
              variant="outlined"
              value={dojoForm.name}
              onChange={(e) => setDojoForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Address"
              variant="outlined"
              multiline
              rows={2}
              value={dojoForm.address}
              onChange={(e) => setDojoForm(prev => ({ ...prev, address: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              sx={{ flex: '1 1 200px', mb: 2 }}
              label="City"
              variant="outlined"
              value={dojoForm.city}
              onChange={(e) => setDojoForm(prev => ({ ...prev, city: e.target.value }))}
            />
            <TextField
              sx={{ flex: '1 1 200px', mb: 2 }}
              label="State"
              variant="outlined"
              value={dojoForm.state}
              onChange={(e) => setDojoForm(prev => ({ ...prev, state: e.target.value }))}
            />
            <TextField
              sx={{ flex: '1 1 200px', mb: 2 }}
              label="Phone Number"
              variant="outlined"
              value={dojoForm.phoneNumber}
              onChange={(e) => setDojoForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
            <TextField
              sx={{ flex: '1 1 200px', mb: 2 }}
              label="Email"
              variant="outlined"
              type="email"
              value={dojoForm.email}
              onChange={(e) => setDojoForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              sx={{ flex: '1 1 200px', mb: 2 }}
              label="Capacity"
              variant="outlined"
              type="number"
              value={dojoForm.capacity}
              onChange={(e) => setDojoForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDojoDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateDojo}
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Create Dojo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Upload Dialog */}
      <Dialog 
        open={showMediaUploadDialog} 
        onClose={() => setShowMediaUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload />
            Upload Media Files
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUpload sx={{ fontSize: '4rem', color: '#dc3545', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Drop files here or click to browse
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ mr: 1, mb: 1 }}
            >
              Upload Photos
              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    handleMediaUpload(e.target.files);
                  }
                }}
              />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<VideoLibrary />}
              sx={{ mr: 1, mb: 1 }}
            >
              Upload Videos
              <input
                type="file"
                multiple
                accept="video/*"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    handleMediaUpload(e.target.files);
                  }
                }}
              />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<InsertDriveFile />}
              sx={{ mb: 1 }}
            >
              Upload Documents
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                hidden
                onChange={(e) => {
                  if (e.target.files) {
                    handleMediaUpload(e.target.files);
                  }
                }}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Maximum file size: {systemSettings.maxFileSize} MB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Allowed types: {systemSettings.allowedFileTypes.join(', ')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowMediaUploadDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* System Settings Dialog */}
      <Dialog 
        open={showSystemSettingsDialog} 
        onClose={() => setShowSystemSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e9ecef' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            System Configuration
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings />
                General Settings
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Maintenance Mode</Typography>
                  <Button
                    size="small"
                    variant={systemSettings.maintenanceMode ? 'contained' : 'outlined'}
                    color={systemSettings.maintenanceMode ? 'error' : 'success'}
                    onClick={() => handleSystemSettingsUpdate({ maintenanceMode: !systemSettings.maintenanceMode })}
                  >
                    {systemSettings.maintenanceMode ? 'ON' : 'OFF'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>User Registration</Typography>
                  <Button
                    size="small"
                    variant={systemSettings.registrationEnabled ? 'contained' : 'outlined'}
                    color={systemSettings.registrationEnabled ? 'success' : 'error'}
                    onClick={() => handleSystemSettingsUpdate({ registrationEnabled: !systemSettings.registrationEnabled })}
                  >
                    {systemSettings.registrationEnabled ? 'ENABLED' : 'DISABLED'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActive />
                Notification Settings
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>Email Notifications</Typography>
                  <Button
                    size="small"
                    variant={systemSettings.emailNotifications ? 'contained' : 'outlined'}
                    color={systemSettings.emailNotifications ? 'success' : 'inherit'}
                    onClick={() => handleSystemSettingsUpdate({ emailNotifications: !systemSettings.emailNotifications })}
                  >
                    {systemSettings.emailNotifications ? 'ON' : 'OFF'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>SMS Notifications</Typography>
                  <Button
                    size="small"
                    variant={systemSettings.smsNotifications ? 'contained' : 'outlined'}
                    color={systemSettings.smsNotifications ? 'success' : 'inherit'}
                    onClick={() => handleSystemSettingsUpdate({ smsNotifications: !systemSettings.smsNotifications })}
                  >
                    {systemSettings.smsNotifications ? 'ON' : 'OFF'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security />
                Security & Backup
              </Typography>
              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => handleSystemSettingsUpdate({ backupFrequency: e.target.value })}
                    label="Backup Frequency"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Max File Size (MB)"
                  type="number"
                  value={systemSettings.maxFileSize}
                  onChange={(e) => handleSystemSettingsUpdate({ maxFileSize: parseInt(e.target.value) || 10 })}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Backup />}
                    onClick={handleSystemBackup}
                    size="small"
                  >
                    Backup Now
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImportExport />}
                    onClick={() => handleExportData('system')}
                    size="small"
                  >
                    Export Data
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowSystemSettingsDialog(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowSystemSettingsDialog(false)}
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Save Changes
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
