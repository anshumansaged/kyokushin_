import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';
// Removed Grid import - using Box with flexbox instead
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f7f4 0%, #f5f4f1 100%)',
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(220, 53, 69, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(33, 37, 41, 0.06) 0%, transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23dc3545' fill-opacity='0.02' d='m0 0 4 4V0H0ZM0 4h4L0 0v4Z'/%3E%3C/svg%3E")
  `,
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '"道"',
    position: 'absolute',
    top: '20%',
    right: '15%',
    fontSize: '20rem',
    color: 'rgba(220, 53, 69, 0.03)',
    fontWeight: 100,
    transform: 'rotate(15deg)',
    zIndex: 0,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '"拳"',
    position: 'absolute',
    bottom: '10%',
    left: '10%',
    fontSize: '15rem',
    color: 'rgba(33, 37, 41, 0.03)',
    fontWeight: 100,
    transform: 'rotate(-15deg)',
    zIndex: 0,
    userSelect: 'none',
    pointerEvents: 'none',
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(33, 37, 41, 0.1), 0 0 0 1px rgba(220, 53, 69, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(33, 37, 41, 0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #dc3545, #212529)',
  },
}));

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <HeroContent>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 300,
                color: '#212529',
                mb: 2,
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
              Kyokushin Karate
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
                color: '#495057',
                mb: 4,
                mt: 4,
              }}
            >
              International Organization Platform
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                color: '#6c757d',
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
                lineHeight: 1.7,
              }}
            >
              Connect with dojos worldwide, manage your martial arts journey, and join the global Kyokushin community. 
              Experience the way of the ultimate truth.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Your Journey
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderColor: '#dc3545',
                  color: '#dc3545',
                  '&:hover': {
                    borderColor: '#b02a37',
                    color: '#b02a37',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 300,
            color: '#212529',
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
          Platform Features
        </Typography>

        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4, 
            mt: 4,
            justifyContent: 'center'
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' }, maxWidth: '400px' }}>
            <FeatureCard>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: '#212529',
                    mb: 2,
                  }}
                >
                  Dojo Management
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6c757d',
                    lineHeight: 1.6,
                  }}
                >
                  Create and manage dojos, track student progress, and organize training schedules 
                  with our comprehensive management system.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' }, maxWidth: '400px' }}>
            <FeatureCard>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: '#212529',
                    mb: 2,
                  }}
                >
                  Global Community
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6c757d',
                    lineHeight: 1.6,
                  }}
                >
                  Connect with Kyokushin practitioners worldwide, share experiences, and learn from 
                  masters across different countries and cultures.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' }, maxWidth: '400px' }}>
            <FeatureCard>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: '#212529',
                    mb: 2,
                  }}
                >
                  Tournament System
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6c757d',
                    lineHeight: 1.6,
                  }}
                >
                  Organize and participate in tournaments, track rankings, and celebrate achievements 
                  in the traditional Kyokushin fighting spirit.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
