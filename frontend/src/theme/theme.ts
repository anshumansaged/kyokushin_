import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#dc3545', // Crimson Red
      light: '#ff6b6b',
      dark: '#b02a37',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#212529', // Deep Black
      light: '#495057',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f7f4', // Washi paper color
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
    },
  },
  typography: {
    fontFamily: [
      'Segoe UI',
      'Noto Sans JP',
      'Yu Gothic',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
      color: '#212529',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2rem',
      color: '#212529',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.5rem',
      color: '#212529',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(33, 37, 41, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b02a37 0%, #8b1e2b 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            '&:hover fieldset': {
              borderColor: '#dc3545',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#dc3545',
              boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(33, 37, 41, 0.1), 0 0 0 1px rgba(220, 53, 69, 0.1)',
          position: 'relative',
          overflow: 'visible',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #dc3545, #212529)',
          },
        },
      },
    },
  },
});

export default theme;
