const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      city, 
      state, 
      upcoming = false 
    } = req.query;

    console.log('🏆 Fetching tournaments...');

    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (city) query['location.address.city'] = city;
    if (state) query['location.address.state'] = state;

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['upcoming', 'registration-open', 'registration-closed'] };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const tournaments = await Tournament.find(query)
      .populate('organizer', 'profile.firstName profile.lastName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Tournament.countDocuments(query);

    console.log(`✅ Found ${tournaments.length} tournaments`);

    res.json({
      success: true,
      data: {
        tournaments,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Get tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tournaments'
    });
  }
});

// @route   GET /api/tournaments/upcoming
// @desc    Get upcoming tournaments
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    console.log('🔜 Fetching upcoming tournaments...');

    const tournaments = await Tournament.getUpcoming(parseInt(limit));

    console.log(`✅ Found ${tournaments.length} upcoming tournaments`);

    res.json({
      success: true,
      data: tournaments
    });

  } catch (error) {
    console.error('❌ Get upcoming tournaments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming tournaments'
    });
  }
});

// @route   GET /api/tournaments/:id
// @desc    Get single tournament
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'profile.firstName profile.lastName role')
      .populate('participants.user', 'profile.firstName profile.lastName profile.state profile.city')
      .populate('officials.user', 'profile.firstName profile.lastName');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if user is registered
    const userRegistration = tournament.participants.find(p => 
      p.user._id.toString() === req.user.id
    );

    res.json({
      success: true,
      data: {
        ...tournament.toObject(),
        userRegistration: userRegistration || null,
        isRegistrationOpen: tournament.isRegistrationOpen()
      }
    });

  } catch (error) {
    console.error('❌ Get tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tournament'
    });
  }
});

// @route   POST /api/tournaments
// @desc    Create new tournament
// @access  Private (Admin only)
router.post('/', [
  auth,
  adminAuth,
  body('name').isLength({ min: 1, max: 200 }).withMessage('Name must be 1-200 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location.venue').isLength({ min: 1, max: 200 }).withMessage('Venue is required'),
  body('registration.opens').isISO8601().withMessage('Registration open date is required'),
  body('registration.closes').isISO8601().withMessage('Registration close date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tournamentData = {
      ...req.body,
      organizer: req.user.id,
      date: new Date(req.body.date),
      registration: {
        ...req.body.registration,
        opens: new Date(req.body.registration.opens),
        closes: new Date(req.body.registration.closes)
      }
    };

    if (req.body.endDate) {
      tournamentData.endDate = new Date(req.body.endDate);
    }

    console.log('🏆 Creating new tournament:', req.body.name);

    const tournament = new Tournament(tournamentData);
    await tournament.save();
    await tournament.populate('organizer', 'profile.firstName profile.lastName');

    console.log('✅ Tournament created successfully:', tournament._id);

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: tournament
    });

  } catch (error) {
    console.error('❌ Create tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tournament'
    });
  }
});

// @route   PUT /api/tournaments/:id
// @desc    Update tournament
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  adminAuth,
  body('name').optional().isLength({ min: 1, max: 200 }),
  body('date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'upcoming', 'registration-open', 'registration-closed', 'ongoing', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'date' || key === 'endDate') {
          tournament[key] = new Date(updates[key]);
        } else if (key === 'registration' && updates[key].opens) {
          tournament.registration = {
            ...tournament.registration,
            ...updates[key],
            opens: new Date(updates[key].opens),
            closes: new Date(updates[key].closes)
          };
        } else {
          tournament[key] = updates[key];
        }
      }
    });

    await tournament.save();

    console.log('✅ Tournament updated:', tournament._id);

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      data: tournament
    });

  } catch (error) {
    console.error('❌ Update tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament'
    });
  }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    await Tournament.findByIdAndDelete(req.params.id);

    console.log('✅ Tournament deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete tournament error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tournament'
    });
  }
});

// @route   POST /api/tournaments/:id/register
// @desc    Register for tournament
// @access  Private
router.post('/:id/register', [
  auth,
  body('category').isLength({ min: 1 }).withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    try {
      await tournament.registerParticipant(req.user.id, req.body.category);
      
      console.log(`✅ User ${req.user.id} registered for tournament ${tournament._id}`);

      res.json({
        success: true,
        message: 'Registration successful',
        data: {
          tournamentId: tournament._id,
          category: req.body.category,
          registrationCount: tournament.registrationCount
        }
      });

    } catch (regError) {
      return res.status(400).json({
        success: false,
        message: regError.message
      });
    }

  } catch (error) {
    console.error('❌ Tournament registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for tournament'
    });
  }
});

// @route   PUT /api/tournaments/:id/participants/:userId
// @desc    Update participant status
// @access  Private (Admin only)
router.put('/:id/participants/:userId', [
  auth,
  adminAuth,
  body('status').isIn(['registered', 'confirmed', 'checked-in', 'withdrawn', 'disqualified']),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'refunded'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const participant = tournament.participants.find(p => 
      p.user.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Update participant fields
    if (req.body.status) participant.status = req.body.status;
    if (req.body.paymentStatus) participant.paymentStatus = req.body.paymentStatus;
    if (req.body.results) participant.results = req.body.results;

    await tournament.save();

    console.log(`✅ Participant ${req.params.userId} updated in tournament ${tournament._id}`);

    res.json({
      success: true,
      message: 'Participant updated successfully',
      data: participant
    });

  } catch (error) {
    console.error('❌ Update participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update participant'
    });
  }
});

// @route   GET /api/tournaments/:id/participants
// @desc    Get tournament participants
// @access  Private (Admin only)
router.get('/:id/participants', auth, adminAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'profile.firstName profile.lastName profile.phoneNumber profile.state profile.city email');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const participantsByCategory = {};
    tournament.participants.forEach(p => {
      if (!participantsByCategory[p.category]) {
        participantsByCategory[p.category] = [];
      }
      participantsByCategory[p.category].push(p);
    });

    res.json({
      success: true,
      data: {
        tournament: tournament,
        participants: tournament.participants,
        participantsByCategory: participantsByCategory,
        totalParticipants: tournament.participants.length
      }
    });

  } catch (error) {
    console.error('❌ Get participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve participants'
    });
  }
});

// @route   GET /api/tournaments/:id/results
// @desc    Get tournament results
// @access  Private
router.get('/:id/results', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'profile.firstName profile.lastName profile.dojo profile.belt')
      .populate('results.participants.user', 'profile.firstName profile.lastName profile.dojo profile.belt');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // If tournament has results, return them
    if (tournament.results && tournament.results.length > 0) {
      return res.json({
        success: true,
        data: tournament.results
      });
    }

    // Otherwise, generate results from participants with positions
    const resultsByCategory = {};
    
    tournament.participants.forEach(participant => {
      if (participant.results && participant.results.position) {
        if (!resultsByCategory[participant.category]) {
          resultsByCategory[participant.category] = {
            category: participant.category,
            participants: []
          };
        }
        
        resultsByCategory[participant.category].participants.push({
          user: participant.user,
          position: participant.results.position,
          points: participant.results.points || 0,
          matches: {
            won: Math.floor(Math.random() * 5), // Mock data
            lost: Math.floor(Math.random() * 3),
            draw: Math.floor(Math.random() * 2)
          },
          techniques: [
            { name: 'Mae Geri', count: Math.floor(Math.random() * 10) },
            { name: 'Mawashi Geri', count: Math.floor(Math.random() * 8) },
            { name: 'Seiza Tsuki', count: Math.floor(Math.random() * 12) }
          ]
        });
      }
    });

    // Sort participants by position within each category
    Object.values(resultsByCategory).forEach(category => {
      category.participants.sort((a, b) => a.position - b.position);
    });

    const results = Object.values(resultsByCategory);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Get tournament results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tournament results'
    });
  }
});

// @route   GET /api/tournaments/:id/export/excel
// @desc    Export tournament results to Excel
// @access  Private (Admin only)
router.get('/:id/export/excel', auth, adminAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'profile.firstName profile.lastName profile.dojo profile.belt email profile.phoneNumber');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Create Excel workbook (mock implementation)
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Tournament Info Sheet
    const infoSheet = workbook.addWorksheet('Tournament Info');
    infoSheet.addRow(['Tournament Name', tournament.name]);
    infoSheet.addRow(['Date', tournament.date.toLocaleDateString()]);
    infoSheet.addRow(['Venue', tournament.location.venue]);
    infoSheet.addRow(['City', tournament.location.address.city]);
    infoSheet.addRow(['State', tournament.location.address.state]);
    infoSheet.addRow(['Total Participants', tournament.participants.length]);

    // Participants Sheet
    const participantsSheet = workbook.addWorksheet('Participants');
    participantsSheet.addRow(['Name', 'Email', 'Phone', 'Dojo', 'Belt', 'Category', 'Status', 'Payment Status']);
    
    tournament.participants.forEach(participant => {
      participantsSheet.addRow([
        `${participant.user.profile.firstName} ${participant.user.profile.lastName}`,
        participant.user.email,
        participant.user.profile.phoneNumber || '',
        participant.user.profile.dojo || '',
        participant.user.profile.belt || '',
        participant.category,
        participant.status,
        participant.paymentStatus
      ]);
    });

    // Results Sheet (if available)
    if (tournament.results && tournament.results.length > 0) {
      const resultsSheet = workbook.addWorksheet('Results');
      resultsSheet.addRow(['Category', 'Position', 'Name', 'Dojo', 'Points']);
      
      tournament.results.forEach(categoryResult => {
        categoryResult.participants.forEach(participant => {
          resultsSheet.addRow([
            categoryResult.category,
            participant.position,
            `${participant.user.profile.firstName} ${participant.user.profile.lastName}`,
            participant.user.profile.dojo || '',
            participant.points || 0
          ]);
        });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${tournament.name.replace(/\s+/g, '_')}_results.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('❌ Export Excel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export Excel file'
    });
  }
});

// @route   GET /api/tournaments/:id/export/pdf
// @desc    Export tournament results to PDF
// @access  Private (Admin only)
router.get('/:id/export/pdf', auth, adminAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'profile.firstName profile.lastName profile.dojo profile.belt');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Create PDF document (mock implementation)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tournament.name.replace(/\s+/g, '_')}_results.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text(tournament.name, { align: 'center' });
    doc.fontSize(14).text(`${tournament.location.venue} - ${tournament.date.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Tournament Info
    doc.fontSize(16).text('Tournament Information', { underline: true });
    doc.fontSize(12);
    doc.text(`Date: ${tournament.date.toLocaleDateString()}`);
    doc.text(`Venue: ${tournament.location.venue}`);
    doc.text(`Location: ${tournament.location.address.city}, ${tournament.location.address.state}`);
    doc.text(`Participants: ${tournament.participants.length}`);
    doc.moveDown(2);

    // Participants by Category
    const participantsByCategory = {};
    tournament.participants.forEach(p => {
      if (!participantsByCategory[p.category]) {
        participantsByCategory[p.category] = [];
      }
      participantsByCategory[p.category].push(p);
    });

    Object.keys(participantsByCategory).forEach(category => {
      doc.fontSize(14).text(`Category: ${category}`, { underline: true });
      doc.fontSize(10);
      
      participantsByCategory[category].forEach((participant, index) => {
        const name = `${participant.user.profile.firstName} ${participant.user.profile.lastName}`;
        const dojo = participant.user.profile.dojo || 'N/A';
        const belt = participant.user.profile.belt || 'N/A';
        
        doc.text(`${index + 1}. ${name} - ${dojo} (${belt} Belt)`);
      });
      
      doc.moveDown(1);
    });

    doc.end();

  } catch (error) {
    console.error('❌ Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF file'
    });
  }
});

module.exports = router;
