import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
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

const BackgroundContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f7f4 0%, #f5f4f1 100%)',
  backgroundImage: `
    radial-gradient(circle at 30% 20%, rgba(220, 53, 69, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(33, 37, 41, 0.06) 0%, transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23dc3545' fill-opacity='0.02' d='m0 0 4 4V0H0ZM0 4h4L0 0v4Z'/%3E%3C/svg%3E")
  `,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '"入門"',
    position: 'absolute',
    top: '20%',
    right: '15%',
    fontSize: '12rem',
    color: 'rgba(220, 53, 69, 0.03)',
    fontWeight: 100,
    transform: 'rotate(15deg)',
    zIndex: 0,
    userSelect: 'none',
    pointerEvents: 'none',
  },
}));

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setStatusMessage('');

      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Store token in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('welcomeMessage', result.message);
        
        // Show welcome message temporarily
        setStatusMessage(result.message);
        
        // Redirect to dashboard after showing welcome message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        if (result.status && result.status !== 'approved') {
          // Show appropriate status message based on role and status
          let statusMessage = result.message;
          if (result.status === 'pending') {
            if (result.user?.role === 'student') {
              statusMessage = 'Your account is pending approval. Please ask your instructor to approve your request.';
            } else if (result.user?.role === 'instructor') {
              statusMessage = 'Your account is pending approval. Please wait for your interview call with the Director.';
            }
          }
          setStatusMessage(statusMessage);
        } else {
          setError(result.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <BackgroundContainer>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <StyledPaper sx={{ p: 4, mt: 4, mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: '2rem',
              fontWeight: 300,
              color: '#212529',
              textAlign: 'center',
              mb: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '2px',
                background: '#dc3545',
              },
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#6c757d',
              mb: 4,
              mt: 3,
            }}
          >
            Continue your Kyokushin journey
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {statusMessage && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                '& .MuiAlert-icon': {
                  color: '#dc3545',
                },
              }}
            >
              {statusMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
            />

            {/* Admin login hint */}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: '#6c757d',
                fontStyle: 'italic',
                mb: 2,
                fontSize: '0.8rem',
              }}
            >
              Admin access: Use admin credentials for full system control
            </Typography>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
                },
                '&:disabled': {
                  background: '#e9ecef',
                },
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{
                    color: '#dc3545',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Join our dojo
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                sx={{
                  color: '#6c757d',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#dc3545',
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot your password?
              </Link>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </BackgroundContainer>
  );
};

export default Login;
