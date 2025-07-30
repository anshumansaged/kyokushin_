const mongoose = require('mongoose');

// Tournament Bout/Match Management Schema
const TournamentBoutSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  bracket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TournamentBracket',
    required: true
  },
  matchId: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
  roundName: {
    type: String,
    required: true
  },
  participants: {
    red: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: String,
      dojo: String,
      belt: String,
      weight: Number,
      corner: {
        type: String,
        default: 'red'
      }
    },
    blue: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: String,
      dojo: String,
      belt: String,
      weight: Number,
      corner: {
        type: String,
        default: 'blue'
      }
    }
  },
  officials: {
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    judges: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      position: {
        type: String,
        enum: ['judge1', 'judge2', 'judge3', 'judge4']
      }
    }],
    timekeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recorder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  schedule: {
    scheduledTime: Date,
    court: String,
    ring: String,
    estimatedDuration: {
      type: Number,
      default: 300 // 5 minutes including preparation
    }
  },
  timer: {
    duration: {
      type: Number,
      default: 180 // 3 minutes
    },
    startTime: Date,
    endTime: Date,
    pausedTime: {
      type: Number,
      default: 0
    },
    extensions: [{
      duration: {
        type: Number,
        default: 60
      },
      reason: String,
      startTime: Date,
      endTime: Date
    }],
    timeRemaining: Number,
    status: {
      type: String,
      enum: ['not-started', 'running', 'paused', 'extension', 'finished'],
      default: 'not-started'
    }
  },
  scoring: {
    system: {
      type: String,
      enum: ['traditional', 'point', 'flag'],
      default: 'traditional'
    },
    red: {
      ippon: {
        type: Number,
        default: 0
      },
      wazaari: {
        type: Number,
        default: 0
      },
      points: {
        type: Number,
        default: 0
      },
      warnings: {
        type: Number,
        default: 0
      },
      penalties: {
        type: Number,
        default: 0
      },
      fouls: [{
        type: String,
        time: Number,
        description: String
      }]
    },
    blue: {
      ippon: {
        type: Number,
        default: 0
      },
      wazaari: {
        type: Number,
        default: 0
      },
      points: {
        type: Number,
        default: 0
      },
      warnings: {
        type: Number,
        default: 0
      },
      penalties: {
        type: Number,
        default: 0
      },
      fouls: [{
        type: String,
        time: Number,
        description: String
      }]
    }
  },
  events: [{
    time: {
      type: Number, // Time in bout (seconds)
      required: true
    },
    type: {
      type: String,
      enum: ['start', 'pause', 'resume', 'ippon', 'waza-ari', 'point', 'warning', 'penalty', 'injury', 'medical', 'end'],
      required: true
    },
    participant: {
      type: String,
      enum: ['red', 'blue', 'both', 'none']
    },
    technique: String,
    target: String,
    description: String,
    official: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  result: {
    winner: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      corner: {
        type: String,
        enum: ['red', 'blue']
      }
    },
    loser: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      corner: {
        type: String,
        enum: ['red', 'blue']
      }
    },
    method: {
      type: String,
      enum: ['ippon', 'waza-ari', 'decision', 'disqualification', 'injury', 'walkover', 'draw'],
      required: true
    },
    decision: {
      type: String,
      enum: ['unanimous', 'majority', 'split'],
    },
    judgeScores: [{
      judge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      red: Number,
      blue: Number,
      winner: {
        type: String,
        enum: ['red', 'blue', 'draw']
      }
    }],
    finalScore: {
      red: {
        total: Number,
        breakdown: String
      },
      blue: {
        total: Number,
        breakdown: String
      }
    },
    duration: Number, // Total bout duration in seconds
    techniques: [{
      participant: {
        type: String,
        enum: ['red', 'blue']
      },
      technique: String,
      target: String,
      score: Number,
      time: Number
    }],
    notes: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'in-progress', 'paused', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  video: {
    liveStream: {
      url: String,
      platform: String,
      isLive: {
        type: Boolean,
        default: false
      }
    },
    recordings: [{
      url: String,
      platform: String,
      startTime: Date,
      endTime: Date,
      quality: String
    }]
  },
  medical: {
    injuries: [{
      participant: {
        type: String,
        enum: ['red', 'blue']
      },
      type: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'severe']
      },
      description: String,
      treatment: String,
      medic: String,
      time: Number,
      canContinue: Boolean
    }],
    medicalTimeouts: [{
      participant: {
        type: String,
        enum: ['red', 'blue']
      },
      duration: Number,
      reason: String,
      time: Number
    }]
  },
  protests: [{
    submittedBy: {
      type: String,
      enum: ['red-corner', 'blue-corner', 'official']
    },
    type: String,
    description: String,
    time: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
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
TournamentBoutSchema.index({ tournament: 1, matchId: 1 });
TournamentBoutSchema.index({ bracket: 1, round: 1 });
TournamentBoutSchema.index({ status: 1 });
TournamentBoutSchema.index({ 'schedule.scheduledTime': 1 });
TournamentBoutSchema.index({ 'participants.red.user': 1 });
TournamentBoutSchema.index({ 'participants.blue.user': 1 });

// Virtual for bout display name
TournamentBoutSchema.virtual('displayName').get(function() {
  return `${this.category} - ${this.roundName} - Match ${this.matchId}`;
});

// Method to start the bout
TournamentBoutSchema.methods.startBout = function() {
  if (this.status !== 'ready') {
    throw new Error('Bout is not ready to start');
  }
  
  this.status = 'in-progress';
  this.timer.status = 'running';
  this.timer.startTime = new Date();
  this.timer.timeRemaining = this.timer.duration;
  
  // Add start event
  this.events.push({
    time: 0,
    type: 'start',
    participant: 'none',
    description: 'Bout started',
    official: this.officials.referee
  });
  
  return this.save();
};

// Method to pause the bout
TournamentBoutSchema.methods.pauseBout = function(reason = '') {
  if (this.timer.status !== 'running') {
    throw new Error('Bout is not running');
  }
  
  this.timer.status = 'paused';
  const currentTime = (new Date() - this.timer.startTime) / 1000;
  
  this.events.push({
    time: currentTime,
    type: 'pause',
    participant: 'none',
    description: reason || 'Bout paused',
    official: this.officials.referee
  });
  
  return this.save();
};

// Method to resume the bout
TournamentBoutSchema.methods.resumeBout = function() {
  if (this.timer.status !== 'paused') {
    throw new Error('Bout is not paused');
  }
  
  this.timer.status = 'running';
  const currentTime = (new Date() - this.timer.startTime) / 1000;
  
  this.events.push({
    time: currentTime,
    type: 'resume',
    participant: 'none',
    description: 'Bout resumed',
    official: this.officials.referee
  });
  
  return this.save();
};

// Method to score a technique
TournamentBoutSchema.methods.scorePoint = function(corner, type, technique = '', target = '') {
  if (this.timer.status !== 'running') {
    throw new Error('Cannot score when bout is not running');
  }
  
  const currentTime = (new Date() - this.timer.startTime) / 1000;
  
  // Update score
  if (type === 'ippon') {
    this.scoring[corner].ippon += 1;
  } else if (type === 'waza-ari') {
    this.scoring[corner].wazaari += 1;
  } else if (type === 'point') {
    this.scoring[corner].points += 1;
  }
  
  // Add event
  this.events.push({
    time: currentTime,
    type: type,
    participant: corner,
    technique: technique,
    target: target,
    official: this.officials.referee
  });
  
  // Check for automatic win (Ippon or 2 Waza-ari)
  if (this.scoring[corner].ippon >= 1 || this.scoring[corner].wazaari >= 2) {
    return this.endBout(corner, 'ippon');
  }
  
  return this.save();
};

// Method to end the bout
TournamentBoutSchema.methods.endBout = function(winner, method, notes = '') {
  this.status = 'completed';
  this.timer.status = 'finished';
  this.timer.endTime = new Date();
  
  const totalDuration = (this.timer.endTime - this.timer.startTime) / 1000;
  this.result.duration = totalDuration;
  
  // Set winner and loser
  if (winner === 'red') {
    this.result.winner = {
      user: this.participants.red.user,
      corner: 'red'
    };
    this.result.loser = {
      user: this.participants.blue.user,
      corner: 'blue'
    };
  } else if (winner === 'blue') {
    this.result.winner = {
      user: this.participants.blue.user,
      corner: 'blue'
    };
    this.result.loser = {
      user: this.participants.red.user,
      corner: 'red'
    };
  }
  
  this.result.method = method;
  this.result.notes = notes;
  
  // Calculate final scores
  this.result.finalScore = {
    red: {
      total: this.scoring.red.ippon * 10 + this.scoring.red.wazaari * 5 + this.scoring.red.points,
      breakdown: `${this.scoring.red.ippon}I, ${this.scoring.red.wazaari}W, ${this.scoring.red.points}P`
    },
    blue: {
      total: this.scoring.blue.ippon * 10 + this.scoring.blue.wazaari * 5 + this.scoring.blue.points,
      breakdown: `${this.scoring.blue.ippon}I, ${this.scoring.blue.wazaari}W, ${this.scoring.blue.points}P`
    }
  };
  
  // Add end event
  this.events.push({
    time: totalDuration,
    type: 'end',
    participant: winner,
    description: `Bout ended - Winner: ${winner} by ${method}`,
    official: this.officials.referee
  });
  
  return this.save();
};

// Method to add warning or penalty
TournamentBoutSchema.methods.addPenalty = function(corner, type, reason = '') {
  const currentTime = (new Date() - this.timer.startTime) / 1000;
  
  if (type === 'warning') {
    this.scoring[corner].warnings += 1;
  } else if (type === 'penalty') {
    this.scoring[corner].penalties += 1;
  }
  
  this.events.push({
    time: currentTime,
    type: type,
    participant: corner,
    description: reason,
    official: this.officials.referee
  });
  
  // Check for disqualification (3 warnings or penalties)
  if (this.scoring[corner].warnings >= 3 || this.scoring[corner].penalties >= 3) {
    const winner = corner === 'red' ? 'blue' : 'red';
    return this.endBout(winner, 'disqualification', `${corner} disqualified - ${reason}`);
  }
  
  return this.save();
};

// Static method to get upcoming bouts
TournamentBoutSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({
    status: { $in: ['scheduled', 'ready'] },
    'schedule.scheduledTime': { $gte: new Date() }
  })
  .populate('participants.red.user', 'profile.firstName profile.lastName')
  .populate('participants.blue.user', 'profile.firstName profile.lastName')
  .populate('officials.referee', 'profile.firstName profile.lastName')
  .sort({ 'schedule.scheduledTime': 1 })
  .limit(limit);
};

// Pre-save middleware
TournamentBoutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TournamentBout', TournamentBoutSchema);
