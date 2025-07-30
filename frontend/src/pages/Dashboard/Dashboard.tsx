import React from 'react';
import { Container, Typography, Box, Card, CardContent, Alert } from '@mui/material';
// Removed Grid import - using Box with flexbox instead
import { styled } from '@mui/material/styles';

const DashboardContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f7f4 0%, #f5f4f1 100%)',
  backgroundImage: `
    radial-gradient(circle at 15% 25%, rgba(220, 53, 69, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 85% 75%, rgba(33, 37, 41, 0.05) 0%, transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23dc3545' fill-opacity='0.02' d='m0 0 4 4V0H0ZM0 4h4L0 0v4Z'/%3E%3C/svg%3E")
  `,
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(33, 37, 41, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #dc3545, #212529)',
  },
}));

const Dashboard: React.FC = () => {
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  const welcomeMessage = localStorage.getItem('welcomeMessage');
  
  const user = userData ? JSON.parse(userData) : {
    profile: {
      firstName: 'User',
      lastName: 'Name',
    },
    role: 'student',
    status: 'approved',
  };

  // Clear welcome message after displaying
  React.useEffect(() => {
    if (welcomeMessage) {
      setTimeout(() => {
        localStorage.removeItem('welcomeMessage');
      }, 5000);
    }
  }, [welcomeMessage]);

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 300,
            color: '#212529',
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-16px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '3px',
              background: 'linear-gradient(90deg, #dc3545, #212529)',
            },
          }}
        >
          Dashboard
        </Typography>

        {/* Display welcome message if available */}
        {welcomeMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              fontSize: '1.1rem',
              fontWeight: 500,
              textAlign: 'center',
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: '#dc3545',
              },
            }}
          >
            {welcomeMessage}
          </Alert>
        )}

        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 4 
          }}
        >
          <Box>
            <WelcomeCard>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: '#212529',
                    mb: 2,
                  }}
                >
                  {user.role === 'admin' && user.profile.firstName === 'Sihan' && user.profile.lastName === 'Vasant Singh'
                    ? `Welcome back, Sihan! 🙏`
                    : user.role === 'admin'
                    ? `Welcome back, ${user.profile.firstName}! (Admin)`
                    : `Welcome back, ${user.profile.firstName}!`}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6c757d',
                    lineHeight: 1.6,
                  }}
                >
                  Your role: <strong style={{ 
                    color: user.role === 'admin' ? '#dc3545' : '#dc3545',
                    fontSize: user.role === 'admin' ? '1.1em' : '1em'
                  }}>
                    {user.role === 'admin' ? 'Admin 👑' : user.role}
                  </strong>
                  <br />
                  Status: <strong style={{ color: '#28a745' }}>{user.status}</strong>
                  {user.role === 'admin' && (
                    <>
                      <br />
                      <em style={{ color: '#dc3545', fontSize: '0.9em' }}>
                        Full system access granted
                      </em>
                    </>
                  )}
                </Typography>
              </CardContent>
            </WelcomeCard>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3,
              '& > *': { flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }
            }}
          >
            <Box>
              <WelcomeCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 500,
                      color: '#212529',
                      mb: 2,
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#6c757d',
                      lineHeight: 1.6,
                    }}
                  >
                    • View training schedule
                    <br />
                    • Update profile
                    <br />
                    • Contact instructor
                    <br />
                    • Join tournaments
                  </Typography>
                </CardContent>
              </WelcomeCard>
            </Box>

            <Box>
              <WelcomeCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 500,
                      color: '#212529',
                      mb: 2,
                    }}
                  >
                    Recent Activity
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#6c757d',
                      lineHeight: 1.6,
                    }}
                  >
                    No recent activity to display.
                    <br />
                    Start your Kyokushin journey!
                  </Typography>
                </CardContent>
              </WelcomeCard>
            </Box>
          </Box>
        </Box>
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
