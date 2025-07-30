import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  EmojiEvents,
  Star,
  Refresh,
  Download,
  Search,
  FilterList
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';

// Removed unused ResultCard styled component

const PodiumContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  borderRadius: theme.spacing(2),
  position: 'relative',
  '&::before': {
    content: '"🏆"',
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '3rem',
  },
}));

interface PodiumStepProps {
  placement: number;
}

const PodiumStep = styled(Box)<PodiumStepProps>(({ placement }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderRadius: '12px 12px 0 0',
  minWidth: '120px',
  height: placement === 1 ? '180px' : placement === 2 ? '140px' : '100px',
  background: placement === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
              placement === 2 ? 'linear-gradient(135deg, #c0c0c0 0%, #d4d4d4 100%)' :
              'linear-gradient(135deg, #cd7f32 0%, #daa520 100%)',
  color: '#212529',
  justifyContent: 'flex-end',
  position: 'relative',
  '&::before': {
    content: `"${placement}"`,
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.7)',
  },
}));

// Removed unused StatsCard styled component

interface Tournament {
  _id: string;
  name: string;
  date: string;
  location: {
    venue: string;
    address: {
      city: string;
      state: string;
    };
  };
  status: string;
  categories: Array<{
    name: string;
    ageGroup: { min: number; max: number };
    beltLevel: { min: string; max: string };
    weight: { min: number; max: number };
    gender: string;
  }>;
}

interface Result {
  category: string;
  participants: Array<{
    user: {
      _id: string;
      profile: {
        firstName: string;
        lastName: string;
        dojo: string;
        belt: string;
      };
    };
    position: number;
    points: number;
    matches: {
      won: number;
      lost: number;
      draw: number;
    };
    techniques: Array<{
      name: string;
      count: number;
    }>;
  }>;
}

const TournamentResults: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [certificateDialog, setCertificateDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [exportDialog, setExportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position');

  useEffect(() => {
    fetchTournamentResults();
  }, [tournamentId]);

  const fetchTournamentResults = async () => {
    try {
      setLoading(true);
      
      // Fetch tournament details
      const tournamentResponse = await fetch(`/api/tournaments/${tournamentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const tournamentData = await tournamentResponse.json();
      
      if (tournamentData.success) {
        setTournament(tournamentData.data);
      }

      // Fetch results
      const resultsResponse = await fetch(`/api/tournaments/${tournamentId}/results`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const resultsData = await resultsResponse.json();
      
      if (resultsData.success) {
        setResults(resultsData.data);
      }
    } catch (error) {
      console.error('Error fetching tournament results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament?.name || 'tournament'}-results.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/export/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament?.name || 'tournament'}-results.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const generateCertificate = (participant: any) => {
    setSelectedParticipant(participant);
    setCertificateDialog(true);
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <EmojiEvents sx={{ color: '#ffd700', fontSize: '2rem' }} />;
      case 2: return <Star sx={{ color: '#c0c0c0', fontSize: '2rem' }} />;
      case 3: return <Star sx={{ color: '#cd7f32', fontSize: '2rem' }} />;
      default: return <Star sx={{ color: '#6c757d', fontSize: '1.5rem' }} />;
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return '1st Place - Champion';
      case 2: return '2nd Place - Runner-up';
      case 3: return '3rd Place - Bronze Medal';
      default: return `${position}th Place`;
    }
  };

  const filteredResults = results.filter(result => 
    selectedCategory === 'all' || result.category === selectedCategory
  );

  const getPodiumData = () => {
    const allParticipants = filteredResults.flatMap(result => 
      result.participants.filter(p => p.position <= 3)
    );
    
    return {
      first: allParticipants.find(p => p.position === 1),
      second: allParticipants.find(p => p.position === 2),
      third: allParticipants.find(p => p.position === 3)
    };
  };

  const getTournamentStats = () => {
    const totalParticipants = results.reduce((acc, result) => acc + result.participants.length, 0);
    const totalMatches = results.reduce((acc, result) => 
      acc + result.participants.reduce((matchAcc, p) => 
        matchAcc + p.matches.won + p.matches.lost + p.matches.draw, 0
      ), 0) / 2; // Divide by 2 since each match involves 2 participants
    
    const totalCategories = results.length;
    const avgParticipantsPerCategory = totalCategories > 0 ? Math.round(totalParticipants / totalCategories) : 0;

    return { totalParticipants, totalMatches, totalCategories, avgParticipantsPerCategory };
  };

  const stats = getTournamentStats();
  const podiumData = getPodiumData();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#dc3545' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading tournament results...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
              {tournament?.name || 'Tournament Results'}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {tournament?.location.venue} • {new Date(tournament?.date || '').toLocaleDateString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Results">
              <IconButton sx={{ color: 'white' }} onClick={fetchTournamentResults}>
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => setExportDialog(true)}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Tournament Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalParticipants}</Typography>
            <Typography variant="body2">Participants</Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalCategories}</Typography>
            <Typography variant="body2">Categories</Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalMatches}</Typography>
            <Typography variant="body2">Total Matches</Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.avgParticipantsPerCategory}</Typography>
            <Typography variant="body2">Avg per Category</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Winners Podium */}
      {(podiumData.first || podiumData.second || podiumData.third) && (
        <Paper elevation={3} sx={{ mb: 4, p: 0, overflow: 'hidden' }}>
          <Typography variant="h5" sx={{ p: 3, pb: 0, textAlign: 'center', fontWeight: 600 }}>
            🏆 Champions Podium
          </Typography>
          
          <PodiumContainer>
            {/* 2nd Place */}
            {podiumData.second && (
              <PodiumStep placement={2}>
                <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: '#dc3545' }}>
                  {podiumData.second.user.profile.firstName[0]}{podiumData.second.user.profile.lastName[0]}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {podiumData.second.user.profile.firstName} {podiumData.second.user.profile.lastName}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
                  {podiumData.second.user.profile.dojo}
                </Typography>
              </PodiumStep>
            )}

            {/* 1st Place */}
            {podiumData.first && (
              <PodiumStep placement={1}>
                <Avatar sx={{ width: 80, height: 80, mb: 1, bgcolor: '#dc3545' }}>
                  {podiumData.first.user.profile.firstName[0]}{podiumData.first.user.profile.lastName[0]}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {podiumData.first.user.profile.firstName} {podiumData.first.user.profile.lastName}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
                  {podiumData.first.user.profile.dojo}
                </Typography>
                <Chip label="CHAMPION" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.9)', color: '#212529', fontWeight: 600 }} />
              </PodiumStep>
            )}

            {/* 3rd Place */}
            {podiumData.third && (
              <PodiumStep placement={3}>
                <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: '#dc3545' }}>
                  {podiumData.third.user.profile.firstName[0]}{podiumData.third.user.profile.lastName[0]}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {podiumData.third.user.profile.firstName} {podiumData.third.user.profile.lastName}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.8 }}>
                  {podiumData.third.user.profile.dojo}
                </Typography>
              </PodiumStep>
            )}
          </PodiumContainer>
        </Paper>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '2 1 300px' }}>
            <TextField
              fullWidth
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#6c757d' }} />
              }}
            />
          </Box>
          
          <Box sx={{ flex: '1 1 200px' }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {results.map((result) => (
                  <MenuItem key={result.category} value={result.category}>
                    {result.category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flex: '1 1 200px' }}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="position">Position</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="dojo">Dojo</MenuItem>
                <MenuItem value="points">Points</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '0 1 150px' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ height: '56px' }}
            >
              Filter
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Results by Category */}
      {filteredResults.map((result, index) => (
        <Accordion key={result.category} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <EmojiEvents sx={{ color: '#dc3545' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {result.category}
              </Typography>
              <Chip 
                label={`${result.participants.length} participants`} 
                size="small" 
                color="primary"
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Participant</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dojo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Belt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Matches</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Points</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.participants
                    .filter(participant => 
                      searchTerm === '' || 
                      `${participant.user.profile.firstName} ${participant.user.profile.lastName}`
                        .toLowerCase().includes(searchTerm.toLowerCase()) ||
                      participant.user.profile.dojo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'position': return a.position - b.position;
                        case 'name': return `${a.user.profile.firstName} ${a.user.profile.lastName}`
                          .localeCompare(`${b.user.profile.firstName} ${b.user.profile.lastName}`);
                        case 'dojo': return a.user.profile.dojo.localeCompare(b.user.profile.dojo);
                        case 'points': return b.points - a.points;
                        default: return a.position - b.position;
                      }
                    })
                    .map((participant) => (
                      <TableRow key={participant.user._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getPositionIcon(participant.position)}
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {participant.position}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#dc3545' }}>
                              {participant.user.profile.firstName[0]}{participant.user.profile.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {participant.user.profile.firstName} {participant.user.profile.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {participant.user._id.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {participant.user.profile.dojo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={participant.user.profile.belt} 
                            size="small"
                            sx={{
                              bgcolor: participant.user.profile.belt === 'Black' ? '#212529' : '#6c757d',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {participant.matches.won}W / {participant.matches.lost}L
                            </Typography>
                            {participant.matches.draw > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {participant.matches.draw}D
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc3545' }}>
                            {participant.points}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Generate Certificate">
                              <IconButton 
                                size="small" 
                                onClick={() => generateCertificate(participant)}
                                sx={{ color: '#dc3545' }}
                              >
                                <Star />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                sx={{ color: '#6c757d' }}
                              >
                                <Star />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Tournament Results</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Choose your preferred export format:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Star />}
                onClick={handleExportExcel}
                sx={{ 
                  py: 2,
                  borderColor: '#28a745',
                  color: '#28a745',
                  '&:hover': { borderColor: '#218838', color: '#218838' }
                }}
              >
                Excel Format
              </Button>
            </Box>
            
            <Box sx={{ flex: '1 1 200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Star />}
                onClick={handleExportPDF}
                sx={{ 
                  py: 2,
                  borderColor: '#dc3545',
                  color: '#dc3545',
                  '&:hover': { borderColor: '#c82333', color: '#c82333' }
                }}
              >
                PDF Format
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certificateDialog} onClose={() => setCertificateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Certificate</DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Paper elevation={3} sx={{ p: 4, border: '2px solid #dc3545' }}>
                <Typography variant="h4" sx={{ mb: 2, color: '#dc3545', fontWeight: 600 }}>
                  Certificate of Achievement
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 1 }}>
                  This is to certify that
                </Typography>
                
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: '#212529' }}>
                  {selectedParticipant.user.profile.firstName} {selectedParticipant.user.profile.lastName}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 1 }}>
                  has achieved
                </Typography>
                
                <Typography variant="h4" sx={{ mb: 2, color: '#dc3545', fontWeight: 600 }}>
                  {getPositionText(selectedParticipant.position)}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 3 }}>
                  in the {tournament?.name}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Box>
                    <Typography variant="body2">Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(tournament?.date || '').toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2">Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {tournament?.location.venue}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />} sx={{ bgcolor: '#dc3545' }}>
            Download Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentResults;
