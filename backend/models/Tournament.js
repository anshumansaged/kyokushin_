const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 5000
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'registration-open', 'registration-closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['tournament', 'seminar', 'grading', 'camp', 'workshop'],
    default: 'tournament'
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    ageGroup: {
      min: Number,
      max: Number
    },
    beltLevel: {
      min: String,
      max: String
    },
    weight: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'mixed'],
      default: 'mixed'
    },
    maxParticipants: Number
  }],
  registration: {
    opens: {
      type: Date,
      required: true
    },
    closes: {
      type: Date,
      required: true
    },
    fee: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      earlyBird: {
        amount: Number,
        deadline: Date
      }
    },
    requirements: [{
      type: String
    }],
    documents: [{
      name: String,
      required: {
        type: Boolean,
        default: false
      }
    }]
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'checked-in', 'withdrawn', 'disqualified'],
      default: 'registered'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    documents: [{
      name: String,
      path: String,
      uploadedAt: Date
    }],
    results: {
      position: Number,
      points: Number,
      notes: String
    }
  }],
  rules: {
    type: String,
    maxlength: 10000
  },
  schedule: [{
    time: Date,
    event: String,
    category: String,
    venue: String
  }],
  officials: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['referee', 'judge', 'timekeeper', 'coordinator'],
      required: true
    },
    assigned: {
      type: Boolean,
      default: false
    }
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    tier: {
      type: String,
      enum: ['title', 'gold', 'silver', 'bronze', 'supporter'],
      default: 'supporter'
    }
  }],
  media: {
    banner: String,
    gallery: [String],
    videos: [String]
  },
  results: [{
    category: String,
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      position: Number,
      points: Number,
      time: String,
      notes: String
    }]
  }],
  stats: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    attendanceRate: {
      type: Number,
      default: 0
    }
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

// Indexes for efficient queries
TournamentSchema.index({ status: 1, date: 1 });
TournamentSchema.index({ organizer: 1, createdAt: -1 });
TournamentSchema.index({ 'location.city': 1, 'location.state': 1 });
TournamentSchema.index({ type: 1, status: 1 });

// Virtual for registration count
TournamentSchema.virtual('registrationCount').get(function() {
  return this.participants.length;
});

// Virtual for days until tournament
TournamentSchema.virtual('daysUntil').get(function() {
  const now = new Date();
  const diffTime = this.date - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if registration is open
TournamentSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return now >= this.registration.opens && 
         now <= this.registration.closes && 
         this.status === 'registration-open';
};

// Method to register participant
TournamentSchema.methods.registerParticipant = function(userId, categoryName) {
  // Check if already registered
  const existingRegistration = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (existingRegistration) {
    throw new Error('User already registered for this tournament');
  }

  // Check if registration is open
  if (!this.isRegistrationOpen()) {
    throw new Error('Registration is not open for this tournament');
  }

  // Check category exists
  const category = this.categories.find(c => c.name === categoryName);
  if (!category) {
    throw new Error('Invalid category');
  }

  // Check capacity
  const categoryRegistrations = this.participants.filter(p => p.category === categoryName);
  if (category.maxParticipants && categoryRegistrations.length >= category.maxParticipants) {
    throw new Error('Category is full');
  }

  // Add participant
  this.participants.push({
    user: userId,
    category: categoryName
  });

  // Update stats
  this.stats.totalRegistrations = this.participants.length;

  return this.save();
};

// Method to update participant status
TournamentSchema.methods.updateParticipantStatus = function(userId, status) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('Participant not found');
  }

  participant.status = status;
  return this.save();
};

// Static method to get upcoming tournaments
TournamentSchema.statics.getUpcoming = function(limit = 10) {
  return this.find({
    status: { $in: ['upcoming', 'registration-open', 'registration-closed'] },
    date: { $gte: new Date() }
  })
  .populate('organizer', 'profile.firstName profile.lastName')
  .sort({ date: 1 })
  .limit(limit);
};

// Static method to get tournaments by location
TournamentSchema.statics.getByLocation = function(city, state) {
  const query = {};
  if (city) query['location.address.city'] = city;
  if (state) query['location.address.state'] = state;
  
  return this.find(query)
    .populate('organizer', 'profile.firstName profile.lastName')
    .sort({ date: 1 });
};

// Pre-save middleware to update timestamps
TournamentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Tournament', TournamentSchema);
