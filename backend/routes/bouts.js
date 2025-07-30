const express = require('express');
const router = express.Router();
const TournamentBout = require('../models/TournamentBout');
const TournamentBracket = require('../models/TournamentBracket');
const Tournament = require('../models/Tournament');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/bouts
// @desc    Get all bouts with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      tournament,
      category,
      status,
      court,
      upcoming = false,
      limit = 20,
      page = 1
    } = req.query;

    let query = {};
    
    if (tournament) query.tournament = tournament;
    if (category) query.category = category;
    if (status) query.status = status;
    if (court) query['schedule.court'] = court;
    
    if (upcoming === 'true') {
      query.status = { $in: ['scheduled', 'ready'] };
      query['schedule.scheduledTime'] = { $gte: new Date() };
    }

    const bouts = await TournamentBout.find(query)
      .populate('participants.red.user', 'profile.firstName profile.lastName profile.dojo')
      .populate('participants.blue.user', 'profile.firstName profile.lastName profile.dojo')
      .populate('officials.referee', 'profile.firstName profile.lastName')
      .populate('tournament', 'name date')
      .sort({ 'schedule.scheduledTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TournamentBout.countDocuments(query);

    res.json({
      success: true,
      data: bouts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bouts'
    });
  }
});

// @route   GET /api/bouts/:id
// @desc    Get bout by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bout = await TournamentBout.findById(req.params.id)
      .populate('participants.red.user', 'profile')
      .populate('participants.blue.user', 'profile')
      .populate('officials.referee', 'profile.firstName profile.lastName')
      .populate('officials.judges.user', 'profile.firstName profile.lastName')
      .populate('tournament', 'name date location');

    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    res.json({
      success: true,
      data: bout
    });
  } catch (error) {
    console.error('Error fetching bout:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bout'
    });
  }
});

// @route   POST /api/bouts
// @desc    Create new bout from bracket match
// @access  Private (Admin/Official)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      tournamentId,
      bracketId,
      matchId,
      scheduledTime,
      court,
      refereeId,
      judges = []
    } = req.body;

    // Get bracket and match details
    const bracket = await TournamentBracket.findById(bracketId)
      .populate('participants.user', 'profile');
    
    if (!bracket) {
      return res.status(404).json({
        success: false,
        message: 'Bracket not found'
      });
    }

    const match = bracket.matches.find(m => m.matchId === matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found in bracket'
      });
    }

    // Get participant details
    const redParticipant = bracket.participants.find(p => 
      p.user._id.toString() === match.participant1.toString()
    );
    const blueParticipant = bracket.participants.find(p => 
      p.user._id.toString() === match.participant2.toString()
    );

    // Create bout
    const bout = new TournamentBout({
      tournament: tournamentId,
      bracket: bracketId,
      matchId: matchId,
      category: bracket.category,
      round: match.round,
      roundName: match.roundName,
      participants: {
        red: {
          user: redParticipant.user._id,
          name: redParticipant.name,
          dojo: redParticipant.dojo,
          belt: redParticipant.belt,
          weight: redParticipant.weight
        },
        blue: {
          user: blueParticipant.user._id,
          name: blueParticipant.name,
          dojo: blueParticipant.dojo,
          belt: blueParticipant.belt,
          weight: blueParticipant.weight
        }
      },
      officials: {
        referee: refereeId,
        judges: judges.map((judgeId, index) => ({
          user: judgeId,
          position: `judge${index + 1}`
        }))
      },
      schedule: {
        scheduledTime: new Date(scheduledTime),
        court: court
      },
      status: 'scheduled'
    });

    await bout.save();

    res.status(201).json({
      success: true,
      message: 'Bout created successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error creating bout:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bout',
      error: error.message
    });
  }
});

// @route   PUT /api/bouts/:id/start
// @desc    Start a bout
// @access  Private (Referee/Admin)
router.put('/:id/start', auth, async (req, res) => {
  try {
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization (referee or admin)
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this bout'
      });
    }

    await bout.startBout();

    res.json({
      success: true,
      message: 'Bout started successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error starting bout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error starting bout'
    });
  }
});

// @route   PUT /api/bouts/:id/pause
// @desc    Pause a bout
// @access  Private (Referee/Admin)
router.put('/:id/pause', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pause this bout'
      });
    }

    await bout.pauseBout(reason);

    res.json({
      success: true,
      message: 'Bout paused successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error pausing bout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error pausing bout'
    });
  }
});

// @route   PUT /api/bouts/:id/resume
// @desc    Resume a bout
// @access  Private (Referee/Admin)
router.put('/:id/resume', auth, async (req, res) => {
  try {
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resume this bout'
      });
    }

    await bout.resumeBout();

    res.json({
      success: true,
      message: 'Bout resumed successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error resuming bout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resuming bout'
    });
  }
});

// @route   POST /api/bouts/:id/score
// @desc    Score a technique in a bout
// @access  Private (Referee/Admin)
router.post('/:id/score', auth, async (req, res) => {
  try {
    const { corner, type, technique, target } = req.body;
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to score this bout'
      });
    }

    await bout.scorePoint(corner, type, technique, target);

    res.json({
      success: true,
      message: `${type} scored for ${corner} corner`,
      data: bout
    });
  } catch (error) {
    console.error('Error scoring bout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error scoring bout'
    });
  }
});

// @route   POST /api/bouts/:id/penalty
// @desc    Add warning or penalty
// @access  Private (Referee/Admin)
router.post('/:id/penalty', auth, async (req, res) => {
  try {
    const { corner, type, reason } = req.body;
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to penalize in this bout'
      });
    }

    await bout.addPenalty(corner, type, reason);

    res.json({
      success: true,
      message: `${type} added to ${corner} corner`,
      data: bout
    });
  } catch (error) {
    console.error('Error adding penalty:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding penalty'
    });
  }
});

// @route   PUT /api/bouts/:id/end
// @desc    End a bout
// @access  Private (Referee/Admin)
router.put('/:id/end', auth, async (req, res) => {
  try {
    const { winner, method, notes } = req.body;
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check authorization
    if (bout.officials.referee.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to end this bout'
      });
    }

    await bout.endBout(winner, method, notes);

    // Update bracket with winner
    const bracket = await TournamentBracket.findById(bout.bracket);
    if (bracket) {
      const winnerId = winner === 'red' ? 
        bout.participants.red.user : 
        bout.participants.blue.user;
      
      await bracket.advanceWinner(bout.matchId, winnerId);
    }

    res.json({
      success: true,
      message: 'Bout ended successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error ending bout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error ending bout'
    });
  }
});

// @route   GET /api/bouts/live
// @desc    Get currently live bouts
// @access  Public
router.get('/live', async (req, res) => {
  try {
    const liveBouts = await TournamentBout.find({
      status: 'in-progress'
    })
    .populate('participants.red.user', 'profile.firstName profile.lastName')
    .populate('participants.blue.user', 'profile.firstName profile.lastName')
    .populate('tournament', 'name')
    .sort({ 'timer.startTime': -1 });

    res.json({
      success: true,
      data: liveBouts
    });
  } catch (error) {
    console.error('Error fetching live bouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live bouts'
    });
  }
});

// @route   GET /api/bouts/upcoming
// @desc    Get upcoming bouts
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const upcomingBouts = await TournamentBout.getUpcoming(limit);

    res.json({
      success: true,
      data: upcomingBouts
    });
  } catch (error) {
    console.error('Error fetching upcoming bouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bouts'
    });
  }
});

// @route   POST /api/bouts/:id/protest
// @desc    Submit a protest for a bout
// @access  Private
router.post('/:id/protest', auth, async (req, res) => {
  try {
    const { type, description, corner } = req.body;
    const bout = await TournamentBout.findById(req.params.id);
    
    if (!bout) {
      return res.status(404).json({
        success: false,
        message: 'Bout not found'
      });
    }

    // Check if user is involved in the bout
    const isRedCorner = bout.participants.red.user.toString() === req.user.id;
    const isBlueCorner = bout.participants.blue.user.toString() === req.user.id;
    const isOfficial = bout.officials.referee.toString() === req.user.id ||
      bout.officials.judges.some(j => j.user.toString() === req.user.id);

    if (!isRedCorner && !isBlueCorner && !isOfficial && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit protest for this bout'
      });
    }

    const currentTime = bout.timer.startTime ? 
      (new Date() - bout.timer.startTime) / 1000 : 0;

    bout.protests.push({
      submittedBy: corner || (isOfficial ? 'official' : (isRedCorner ? 'red-corner' : 'blue-corner')),
      type: type,
      description: description,
      time: currentTime,
      status: 'pending'
    });

    await bout.save();

    res.json({
      success: true,
      message: 'Protest submitted successfully',
      data: bout
    });
  } catch (error) {
    console.error('Error submitting protest:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting protest'
    });
  }
});

module.exports = router;
