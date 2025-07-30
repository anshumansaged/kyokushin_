// Tournament utility functions and constants

// Tournament categories and weight classes
export const WEIGHT_CLASSES = {
  male: {
    junior: [
      { name: 'Boys 10-11 Years', ageMin: 10, ageMax: 11, weights: ['-25kg', '-30kg', '+30kg'] },
      { name: 'Boys 12-13 Years', ageMin: 12, ageMax: 13, weights: ['-35kg', '-40kg', '-45kg', '+45kg'] },
      { name: 'Boys 14-15 Years', ageMin: 14, ageMax: 15, weights: ['-45kg', '-50kg', '-55kg', '+55kg'] },
      { name: 'Boys 16-17 Years', ageMin: 16, ageMax: 17, weights: ['-55kg', '-60kg', '-65kg', '+65kg'] }
    ],
    senior: [
      { name: 'Men 18-35 Years', ageMin: 18, ageMax: 35, weights: ['-60kg', '-65kg', '-70kg', '-75kg', '-80kg', '-85kg', '+85kg'] },
      { name: 'Men 36+ Years', ageMin: 36, ageMax: 99, weights: ['-70kg', '-80kg', '+80kg'] }
    ]
  },
  female: {
    junior: [
      { name: 'Girls 10-11 Years', ageMin: 10, ageMax: 11, weights: ['-25kg', '-30kg', '+30kg'] },
      { name: 'Girls 12-13 Years', ageMin: 12, ageMax: 13, weights: ['-35kg', '-40kg', '+40kg'] },
      { name: 'Girls 14-15 Years', ageMin: 14, ageMax: 15, weights: ['-40kg', '-45kg', '-50kg', '+50kg'] },
      { name: 'Girls 16-17 Years', ageMin: 16, ageMax: 17, weights: ['-50kg', '-55kg', '+55kg'] }
    ],
    senior: [
      { name: 'Women 18-35 Years', ageMin: 18, ageMax: 35, weights: ['-50kg', '-55kg', '-60kg', '-65kg', '+65kg'] },
      { name: 'Women 36+ Years', ageMin: 36, ageMax: 99, weights: ['-55kg', '-65kg', '+65kg'] }
    ]
  }
};

// Belt levels
export const BELT_LEVELS = [
  { value: 'white', label: 'White Belt', order: 1 },
  { value: 'yellow', label: 'Yellow Belt', order: 2 },
  { value: 'orange', label: 'Orange Belt', order: 3 },
  { value: 'green', label: 'Green Belt', order: 4 },
  { value: 'blue', label: 'Blue Belt', order: 5 },
  { value: 'brown', label: 'Brown Belt', order: 6 },
  { value: 'black', label: 'Black Belt', order: 7 }
];

// Tournament scoring types
export const SCORING_SYSTEMS = {
  traditional: {
    name: 'Traditional Kyokushin',
    ippon: 10,
    wazaari: 5,
    point: 1,
    description: 'Full contact with knockdown scoring'
  },
  point: {
    name: 'Point Scoring',
    ippon: 3,
    wazaari: 2,
    point: 1,
    description: 'Light contact point-based scoring'
  },
  flag: {
    name: 'Flag System',
    ippon: 1,
    wazaari: 0,
    point: 0,
    description: 'Judge flag-based decision system'
  }
};

// Fighting techniques
export const TECHNIQUES = {
  punches: [
    'Seiza Tsuki (Straight Punch)',
    'Jodan Tsuki (High Punch)',
    'Chudan Tsuki (Middle Punch)',
    'Gedan Tsuki (Low Punch)',
    'Ura Tsuki (Uppercut)',
    'Kagi Tsuki (Hook Punch)'
  ],
  kicks: [
    'Mae Geri (Front Kick)',
    'Yoko Geri (Side Kick)',
    'Ushiro Geri (Back Kick)',
    'Mawashi Geri (Roundhouse Kick)',
    'Ushiro Mawashi Geri (Back Roundhouse)',
    'Hiza Geri (Knee Strike)',
    'Kakato Geri (Heel Kick)',
    'Kin Geri (Groin Kick)'
  ],
  strikes: [
    'Empi Uchi (Elbow Strike)',
    'Shuto Uchi (Knife Hand)',
    'Haito Uchi (Ridge Hand)',
    'Uraken Uchi (Back Fist)',
    'Tetsui Uchi (Hammer Fist)'
  ]
};

// Target areas
export const TARGET_AREAS = [
  'Head',
  'Face',
  'Neck',
  'Chest',
  'Solar Plexus',
  'Ribs',
  'Stomach',
  'Back',
  'Leg',
  'Thigh',
  'Shin',
  'Foot'
];

// Tournament statuses
export const TOURNAMENT_STATUSES = {
  draft: { label: 'Draft', color: '#6c757d' },
  upcoming: { label: 'Upcoming', color: '#007bff' },
  'registration-open': { label: 'Registration Open', color: '#ffc107' },
  'registration-closed': { label: 'Registration Closed', color: '#fd7e14' },
  ongoing: { label: 'Ongoing', color: '#dc3545' },
  completed: { label: 'Completed', color: '#28a745' },
  cancelled: { label: 'Cancelled', color: '#6c757d' }
};

// Bout statuses
export const BOUT_STATUSES = {
  scheduled: { label: 'Scheduled', color: '#6c757d' },
  ready: { label: 'Ready', color: '#ffc107' },
  'in-progress': { label: 'In Progress', color: '#dc3545' },
  paused: { label: 'Paused', color: '#fd7e14' },
  completed: { label: 'Completed', color: '#28a745' },
  cancelled: { label: 'Cancelled', color: '#6c757d' },
  postponed: { label: 'Postponed', color: '#17a2b8' }
};

// Utility functions
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getWeightClass = (weight: number, age: number, gender: 'male' | 'female'): string => {
  const isJunior = age < 18;
  const categories = isJunior ? WEIGHT_CLASSES[gender].junior : WEIGHT_CLASSES[gender].senior;
  
  for (const category of categories) {
    if (age >= category.ageMin && age <= category.ageMax) {
      for (const weightClass of category.weights) {
        if (weightClass.startsWith('-')) {
          const maxWeight = parseInt(weightClass.substring(1));
          if (weight <= maxWeight) {
            return `${category.name} ${weightClass}`;
          }
        } else if (weightClass.startsWith('+')) {
          const minWeight = parseInt(weightClass.substring(1));
          if (weight > minWeight) {
            return `${category.name} ${weightClass}`;
          }
        }
      }
    }
  }
  
  return 'Open Category';
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getBeltColor = (belt: string): string => {
  const beltColors: { [key: string]: string } = {
    white: '#ffffff',
    yellow: '#ffd700',
    orange: '#ffa500',
    green: '#228b22',
    blue: '#0000ff',
    brown: '#8b4513',
    black: '#000000'
  };
  
  return beltColors[belt.toLowerCase()] || '#6c757d';
};

export const generateBracketStructure = (participants: any[], type: 'single-elimination' | 'double-elimination' | 'round-robin') => {
  const participantCount = participants.length;
  
  if (type === 'single-elimination') {
    // Calculate bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
    const byeCount = bracketSize - participantCount;
    
    return {
      bracketSize,
      byeCount,
      rounds: Math.ceil(Math.log2(bracketSize)),
      firstRoundMatches: bracketSize / 2
    };
  }
  
  if (type === 'round-robin') {
    const totalMatches = (participantCount * (participantCount - 1)) / 2;
    const rounds = participantCount % 2 === 0 ? participantCount - 1 : participantCount;
    
    return {
      totalMatches,
      rounds,
      matchesPerRound: Math.floor(participantCount / 2)
    };
  }
  
  // Double elimination
  const winnersRounds = Math.ceil(Math.log2(participantCount));
  const losersRounds = (winnersRounds - 1) * 2;
  
  return {
    winnersRounds,
    losersRounds,
    totalRounds: winnersRounds + losersRounds + 1 // +1 for grand final
  };
};

export const validateTournamentData = (tournament: any): string[] => {
  const errors: string[] = [];
  
  if (!tournament.name || tournament.name.trim().length === 0) {
    errors.push('Tournament name is required');
  }
  
  if (!tournament.date || new Date(tournament.date) <= new Date()) {
    errors.push('Tournament date must be in the future');
  }
  
  if (!tournament.location?.venue) {
    errors.push('Venue is required');
  }
  
  if (!tournament.registration?.opens || !tournament.registration?.closes) {
    errors.push('Registration dates are required');
  }
  
  if (new Date(tournament.registration?.opens) >= new Date(tournament.registration?.closes)) {
    errors.push('Registration open date must be before close date');
  }
  
  if (tournament.categories && tournament.categories.length === 0) {
    errors.push('At least one category is required');
  }
  
  return errors;
};

export const exportTournamentData = (tournament: any, participants: any[], format: 'csv' | 'json') => {
  if (format === 'csv') {
    const headers = ['Name', 'Email', 'Category', 'Belt', 'Dojo', 'Status'];
    const rows = participants.map(p => [
      `${p.user.profile.firstName} ${p.user.profile.lastName}`,
      p.user.email,
      p.category,
      p.user.profile.belt || 'N/A',
      p.user.profile.dojo || 'N/A',
      p.status
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
  
  if (format === 'json') {
    return JSON.stringify({
      tournament: {
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        categories: tournament.categories
      },
      participants: participants.map(p => ({
        name: `${p.user.profile.firstName} ${p.user.profile.lastName}`,
        email: p.user.email,
        category: p.category,
        belt: p.user.profile.belt,
        dojo: p.user.profile.dojo,
        status: p.status,
        registrationDate: p.registeredAt
      }))
    }, null, 2);
  }
  
  return '';
};

// Real-time updates helper
export const createTournamentSocket = (tournamentId: string) => {
  // This would integrate with WebSocket for real-time updates
  return {
    joinTournament: () => console.log(`Joined tournament ${tournamentId}`),
    leaveTournament: () => console.log(`Left tournament ${tournamentId}`),
    onBoutUpdate: (callback: Function) => console.log('Listening for bout updates'),
    onScoreUpdate: (callback: Function) => console.log('Listening for score updates'),
    onBracketUpdate: (callback: Function) => console.log('Listening for bracket updates')
  };
};

export default {
  WEIGHT_CLASSES,
  BELT_LEVELS,
  SCORING_SYSTEMS,
  TECHNIQUES,
  TARGET_AREAS,
  TOURNAMENT_STATUSES,
  BOUT_STATUSES,
  calculateAge,
  getWeightClass,
  formatTime,
  getBeltColor,
  generateBracketStructure,
  validateTournamentData,
  exportTournamentData,
  createTournamentSocket
};
