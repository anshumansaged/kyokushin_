import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(33, 37, 41, 0.1)',
  borderBottom: '3px solid',
  borderImage: 'linear-gradient(90deg, #dc3545, #212529) 1',
}));

const Logo = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  color: '#212529',
  fontWeight: 300,
  fontSize: '1.5rem',
  textDecoration: 'none',
  position: 'relative',
  cursor: 'pointer',
  '&::after': {
    content: '"極真"',
    fontSize: '0.8rem',
    color: '#dc3545',
    marginLeft: '8px',
    opacity: 0.7,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#212529',
  marginLeft: theme.spacing(2),
  fontWeight: 500,
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#dc3545',
    },
  },
}));

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo
          variant="h6"
          onClick={() => navigate('/')}
        >
          Kyokushin Platform
        </Logo>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NavButton onClick={() => navigate('/')}>
            Home
          </NavButton>
          <NavButton onClick={() => navigate('/tournaments')}>
            Tournaments
          </NavButton>
          <NavButton onClick={() => navigate('/about')}>
            About
          </NavButton>
          <NavButton onClick={() => navigate('/dojos')}>
            Dojos
          </NavButton>
          <NavButton onClick={handleLogin}>
            Login
          </NavButton>
          <Button
            onClick={handleRegister}
            variant="contained"
            sx={{
              ml: 2,
              background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
              },
            }}
          >
            Join Dojo
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
