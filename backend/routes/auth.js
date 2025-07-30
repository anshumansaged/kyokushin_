const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'instructor']),
  body('profile.firstName').trim().isLength({ min: 1 }),
  body('profile.lastName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      profile,
      status: 'pending' // All new registrations start as pending
    });

    // Generate token
    const token = generateToken(user._id);

    // Prepare response message based on role and instructor assignment
    let responseMessage;
    if (role === 'student') {
      if (profile.assignedInstructor === 'admin-approval') {
        responseMessage = 'Registration successful! An admin will assign you to an instructor and approve your request.';
      } else if (profile.assignedInstructor) {
        responseMessage = `Registration successful! Please ask ${profile.assignedInstructor} to approve your request.`;
      } else {
        responseMessage = 'Registration successful! Please ask your instructor to approve your request.';
      }
    } else if (role === 'instructor') {
      responseMessage = 'Registration successful! Please wait for your interview call with the Director.';
    }

    res.status(201).json({
      success: true,
      message: responseMessage,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid email and password'
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      let statusMessage;
      if (user.status === 'pending') {
        if (user.role === 'student') {
          if (user.profile.assignedInstructor === 'admin-approval') {
            statusMessage = 'Your account is pending admin approval for instructor assignment.';
          } else if (user.profile.assignedInstructor) {
            statusMessage = `Your account is pending approval from ${user.profile.assignedInstructor}.`;
          } else {
            statusMessage = 'Your account is pending approval from your instructor.';
          }
        } else {
          statusMessage = 'Your account is pending approval. Please wait for your interview call with the Director.';
        }
      } else if (user.status === 'rejected') {
        statusMessage = 'Your account has been rejected. Please contact support.';
      }
      
      return res.status(401).json({
        success: false,
        message: statusMessage,
        status: user.status,
        user: {
          role: user.role,
          status: user.status
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Generate welcome message
    let welcomeMessage = 'Login successful';
    console.log('🔍 User role:', user.role);
    console.log('🔍 User profile:', user.profile);
    console.log('🔍 First name:', user.profile.firstName);
    console.log('🔍 Last name:', user.profile.lastName);
    
    if (user.role === 'admin') {
      if (user.profile.firstName === 'Sihan' && user.profile.lastName === 'Vasant Singh') {
        welcomeMessage = 'Welcome to Kyokushin Family 🙏, Sihan Vasant Singh.';
        console.log('✅ Special Sihan message set');
      } else {
        welcomeMessage = 'Welcome to Kyokushin Family';
        console.log('✅ General admin message set');
      }
    } else {
      welcomeMessage = 'Welcome to Kyokushin Family';
      console.log('✅ Regular user message set');
    }

    res.json({
      success: true,
      message: welcomeMessage,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // This route would need auth middleware
    // For now, just return a placeholder
    res.json({
      success: true,
      message: 'Protected route - requires authentication middleware'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
