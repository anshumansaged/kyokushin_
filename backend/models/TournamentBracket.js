const mongoose = require('mongoose');

// Enhanced Tournament Bracket Schema for Competition Management
const BracketSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss'],
    default: 'single-elimination'
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'in-progress', 'completed'],
    default: 'draft'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    seed: {
      type: Number,
      default: 0
    },
    name: String, // Cache for display
    dojo: String,
    belt: String,
    weight: Number,
    age: Number,
    eliminated: {
      type: Boolean,
      default: false
    },
    position: Number // Final position (1st, 2nd, 3rd, etc.)
  }],
  matches: [{
    matchId: {
      type: Number,
      required: true
    },
    round: {
      type: Number,
      required: true
    },
    roundName: String, // Quarter-final, Semi-final, Final, etc.
    participant1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    participant2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    loser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'walkover', 'cancelled'],
      default: 'pending'
    },
    scheduledTime: Date,
    startTime: Date,
    endTime: Date,
    court: String,
    result: {
      type: {
        type: String,
        enum: ['ippon', 'waza-ari', 'decision', 'disqualification', 'injury', 'walkover'],
      },
      score: {
        participant1: {
          ippon: { type: Number, default: 0 },
          wazaari: { type: Number, default: 0 },
          points: { type: Number, default: 0 },
          warnings: { type: Number, default: 0 },
          penalties: { type: Number, default: 0 }
        },
        participant2: {
          ippon: { type: Number, default: 0 },
          wazaari: { type: Number, default: 0 },
          points: { type: Number, default: 0 },
          warnings: { type: Number, default: 0 },
          penalties: { type: Number, default: 0 }
        }
      },
      duration: Number, // in seconds
      referee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      judges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      notes: String
    },
    nextMatch: Number, // Next match for winner
    loserNextMatch: Number, // For double elimination
    isBye: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    matchDuration: {
      type: Number,
      default: 180 // 3 minutes in seconds
    },
    extensionTime: {
      type: Number,
      default: 60 // 1 minute extension
    },
    allowExtensions: {
      type: Boolean,
      default: true
    },
    maxExtensions: {
      type: Number,
      default: 2
    },
    scoringSystem: {
      type: String,
      enum: ['traditional', 'point', 'flag'],
      default: 'traditional'
    },
    autoAdvancement: {
      type: Boolean,
      default: true
    },
    thirdPlaceMatch: {
      type: Boolean,
      default: true
    }
  },
  rounds: [{
    roundNumber: Number,
    name: String,
    matches: [Number], // Match IDs
    completed: {
      type: Boolean,
      default: false
    }
  }],
  finalResults: {
    first: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    second: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    third: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    participantCount: Number,
    completedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
BracketSchema.index({ tournament: 1, category: 1 });
BracketSchema.index({ status: 1 });
BracketSchema.index({ 'matches.status': 1 });

// Methods for bracket generation
BracketSchema.methods.generateSingleElimination = function() {
  const participants = this.participants.filter(p => !p.eliminated);
  const participantCount = participants.length;
  
  if (participantCount < 2) {
    throw new Error('Need at least 2 participants to generate bracket');
  }

  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const byeCount = bracketSize - participantCount;
  
  // Shuffle participants if no seeding
  const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
  
  this.matches = [];
  let matchId = 1;
  
  // Generate first round matches
  const firstRoundMatches = bracketSize / 2;
  let participantIndex = 0;
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const match = {
      matchId: matchId++,
      round: 1,
      roundName: this.getRoundName(1, bracketSize),
      status: 'pending'
    };
    
    // Assign participants, accounting for byes
    if (participantIndex < shuffledParticipants.length) {
      match.participant1 = shuffledParticipants[participantIndex++]._id;
    }
    
    if (participantIndex < shuffledParticipants.length) {
      match.participant2 = shuffledParticipants[participantIndex++]._id;
    } else if (match.participant1) {
      // Bye situation
      match.isBye = true;
      match.winner = match.participant1;
      match.status = 'completed';
      match.result = { type: 'walkover' };
    }
    
    this.matches.push(match);
  }
  
  // Generate subsequent rounds
  let currentRoundMatches = firstRoundMatches;
  let round = 2;
  
  while (currentRoundMatches > 1) {
    const nextRoundMatches = currentRoundMatches / 2;
    
    for (let i = 0; i < nextRoundMatches; i++) {
      this.matches.push({
        matchId: matchId++,
        round: round,
        roundName: this.getRoundName(round, bracketSize),
        status: 'pending'
      });
    }
    
    currentRoundMatches = nextRoundMatches;
    round++;
  }
  
  // Generate third place match if enabled
  if (this.settings.thirdPlaceMatch && bracketSize >= 4) {
    this.matches.push({
      matchId: matchId++,
      round: round - 1,
      roundName: 'Third Place',
      status: 'pending'
    });
  }
  
  this.status = 'generated';
  return this.save();
};

// Helper method to get round names
BracketSchema.methods.getRoundName = function(round, bracketSize) {
  const totalRounds = Math.log2(bracketSize);
  
  if (round === totalRounds) return 'Final';
  if (round === totalRounds - 1) return 'Semi-Final';
  if (round === totalRounds - 2) return 'Quarter-Final';
  if (round === 1) return 'First Round';
  
  return `Round ${round}`;
};

// Method to advance winner to next match
BracketSchema.methods.advanceWinner = function(matchId, winnerId) {
  const match = this.matches.find(m => m.matchId === matchId);
  if (!match) throw new Error('Match not found');
  
  match.winner = winnerId;
  match.status = 'completed';
  
  // Find next match
  const nextRoundMatch = this.matches.find(m => 
    m.round === match.round + 1 && 
    (!m.participant1 || !m.participant2)
  );
  
  if (nextRoundMatch) {
    if (!nextRoundMatch.participant1) {
      nextRoundMatch.participant1 = winnerId;
    } else if (!nextRoundMatch.participant2) {
      nextRoundMatch.participant2 = winnerId;
    }
  }
  
  // Check if tournament is complete
  this.checkTournamentComplete();
  
  return this.save();
};

// Method to check if tournament is complete
BracketSchema.methods.checkTournamentComplete = function() {
  const finalMatch = this.matches.find(m => m.roundName === 'Final');
  
  if (finalMatch && finalMatch.status === 'completed') {
    this.status = 'completed';
    this.finalResults.first = finalMatch.winner;
    this.finalResults.second = finalMatch.participant1 === finalMatch.winner ? 
      finalMatch.participant2 : finalMatch.participant1;
    this.finalResults.completedAt = new Date();
    
    // Handle third place
    const thirdPlaceMatch = this.matches.find(m => m.roundName === 'Third Place');
    if (thirdPlaceMatch && thirdPlaceMatch.status === 'completed') {
      this.finalResults.third = [thirdPlaceMatch.winner];
    }
    
    this.finalResults.participantCount = this.participants.length;
  }
};

// Pre-save middleware
BracketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TournamentBracket', BracketSchema);
