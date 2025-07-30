const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve user registration
// @access  Private (Admin/Instructor only)
router.put('/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'approved';
    user.approvedAt = Date.now();
    // user.approvedBy = req.user.id; // Would come from auth middleware
    
    await user.save();

    res.json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
