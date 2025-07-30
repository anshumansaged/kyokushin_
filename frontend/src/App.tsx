import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TournamentDashboard from './pages/Tournament/TournamentDashboard';
import TournamentRegistration from './pages/Tournament/TournamentRegistration';
import TournamentBrackets from './pages/Tournament/TournamentBrackets';
import LiveBoutTimer from './pages/Tournament/LiveBoutTimer';
import LivestreamDisplay from './pages/Tournament/LivestreamDisplay';
import TournamentResults from './pages/Tournament/TournamentResults';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Tournament Routes */}
            <Route path="/tournaments" element={<TournamentDashboard />} />
            <Route path="/tournaments/register" element={<TournamentRegistration />} />
            <Route path="/tournaments/:tournamentId" element={<TournamentDashboard />} />
            <Route path="/tournaments/:tournamentId/brackets" element={<TournamentBrackets />} />
            <Route path="/tournaments/:tournamentId/results" element={<TournamentResults />} />
            <Route path="/bouts/:boutId/timer" element={<LiveBoutTimer />} />
            <Route path="/tournaments/:tournamentId/livestream" element={<LivestreamDisplay />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
