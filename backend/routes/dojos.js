const express = require('express');
const Dojo = require('../models/Dojo');

const router = express.Router();

// @route   GET /api/dojos
// @desc    Get all dojos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const dojos = await Dojo.find({ isActive: true })
      .populate('headInstructor', 'profile.firstName profile.lastName email')
      .populate('instructors', 'profile.firstName profile.lastName email');
    
    res.json({
      success: true,
      count: dojos.length,
      data: dojos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/dojos
// @desc    Create new dojo
// @access  Private (Admin/Instructor only)
router.post('/', async (req, res) => {
  try {
    const dojo = await Dojo.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Dojo created successfully',
      data: dojo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
