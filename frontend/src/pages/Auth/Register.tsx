import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
// Removed Grid import - using Box with flexbox instead
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
    radial-gradient(circle at 20% 30%, rgba(220, 53, 69, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(33, 37, 41, 0.06) 0%, transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23dc3545' fill-opacity='0.02' d='m0 0 4 4V0H0ZM0 4h4L0 0v4Z'/%3E%3C/svg%3E")
  `,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '"登録"',
    position: 'absolute',
    top: '15%',
    right: '10%',
    fontSize: '12rem',
    color: 'rgba(220, 53, 69, 0.03)',
    fontWeight: 100,
    transform: 'rotate(15deg)',
    zIndex: 0,
    userSelect: 'none',
    pointerEvents: 'none',
  },
}));

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state?: string;
  city?: string;
  instructor?: string;
}

interface RegistrationData {
  email: string;
  password: string;
  role: 'student' | 'instructor';
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    assignedInstructor?: string;
    state?: string;
    city?: string;
  };
}

// Mock data for states, cities, and instructors
const statesData: Record<string, string[]> = {
  'California': ['Los Angeles', 'San Francisco', 'San Diego'],
  'New York': ['New York City', 'Buffalo', 'Rochester'],
  'Texas': ['Houston', 'Dallas', 'Austin'],
  'Florida': ['Miami', 'Tampa', 'Orlando'],
};

const instructorsData: Record<string, string[]> = {
  'Los Angeles': ['Sensei Yamamoto', 'Sensei Rodriguez', 'Sensei Johnson'],
  'San Francisco': ['Sensei Chen', 'Sensei Williams', 'Sensei Davis'],
  'New York City': ['Sensei Tanaka', 'Sensei Brown', 'Sensei Miller'],
  'Houston': ['Sensei Suzuki', 'Sensei Garcia', 'Sensei Wilson'],
  'Miami': ['Sensei Nakamura', 'Sensei Martinez', 'Sensei Anderson'],
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<string[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const watchRole = watch('role');
  const password = watch('password');

  // Handle state change
  useEffect(() => {
    if (selectedState) {
      setAvailableCities(statesData[selectedState] || []);
      setSelectedCity('');
      setAvailableInstructors([]);
    }
  }, [selectedState]);

  // Handle city change
  useEffect(() => {
    if (selectedCity) {
      setAvailableInstructors(instructorsData[selectedCity] || []);
    }
  }, [selectedCity]);

  const onSubmit = async (data: RegisterFormData) => {
    console.log('🚀 Form submitted');
    try {
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      console.log('✅ Password validation passed');

      // Prepare registration data
      const registrationData: RegistrationData = {
        email: data.email,
        password: data.password,
        role: data.role,
        profile: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
      };

      // Add instructor assignment for students
      if (data.role === 'student') {
        if (data.instructor === 'choose-any') {
          registrationData.profile.assignedInstructor = 'admin-approval';
        } else if (data.instructor) {
          registrationData.profile.assignedInstructor = data.instructor;
          registrationData.profile.state = selectedState;
          registrationData.profile.city = selectedCity;
        }
      }

      console.log('📝 Registration data prepared:', registrationData);

      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('🌐 API response status:', response.status);
      const result = await response.json();
      console.log('📊 API response data:', result);

      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccessDialog(true);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/login');
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
            Join Our Dojo
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
            Begin your Kyokushin journey with us
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Debug info */}
            {Object.keys(errors).length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Form validation errors: {Object.keys(errors).join(', ')}
              </Alert>
            )}
            
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 2,
                '& > *': { flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }
              }}
            >
              <Box>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('firstName', { required: 'First name is required' })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Box>
            </Box>

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
              label="Phone Number"
              {...register('phoneNumber')}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                {...register('role', { required: 'Please select a role' })}
                error={!!errors.role}
                label="Role"
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
              </Select>
            </FormControl>

            {/* Student-specific instructor selection */}
            {watchRole === 'student' && (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    label="State"
                  >
                    <MenuItem value="">Select State</MenuItem>
                    {Object.keys(statesData).map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedState && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>City</InputLabel>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      label="City"
                    >
                      <MenuItem value="">Select City</MenuItem>
                      {availableCities.map((city) => (
                        <MenuItem key={city} value={city}>{city}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedCity && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Instructor</InputLabel>
                    <Select
                      {...register('instructor')}
                      label="Instructor"
                    >
                      <MenuItem value="">Select Instructor</MenuItem>
                      <MenuItem value="choose-any" sx={{ fontStyle: 'italic', color: '#dc3545' }}>
                        Choose Any (Admin will assign)
                      </MenuItem>
                      {availableInstructors.map((instructor) => (
                        <MenuItem key={instructor} value={instructor}>{instructor}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}

            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 3 }}
            />

            {watchRole && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  '& .MuiAlert-icon': {
                    color: '#dc3545',
                  },
                }}
              >
                {watchRole === 'student'
                  ? 'After registration, ask your instructor to approve your request.'
                  : 'After registration, wait for your interview call with the Director.'}
              </Alert>
            )}

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
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </Button>

            {/* Debug button - Remove in production */}
            <Button
              onClick={() => {
                console.log('🔍 Debug - Form state available');
                console.log('🔍 Debug - Form errors:', Object.keys(errors));
                console.log('🔍 Debug - isSubmitting:', isSubmitting);
                console.log('🔍 Debug - selectedState:', selectedState);
                console.log('🔍 Debug - selectedCity:', selectedCity);
              }}
              variant="outlined"
              fullWidth
              sx={{ mt: 1, opacity: 0.7 }}
            >
              🔍 Debug Form (Check Console)
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#dc3545',
                    textTransform: 'none',
                    fontWeight: 500,
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(33, 37, 41, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#212529',
            fontWeight: 500,
            borderBottom: '3px solid',
            borderImage: 'linear-gradient(90deg, #dc3545, #212529) 1',
            pb: 2,
          }}
        >
          Registration Successful!
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#495057' }}>
            {successMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleDialogClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Continue to Login
          </Button>
        </DialogActions>
      </Dialog>
    </BackgroundContainer>
  );
};

export default Register;
