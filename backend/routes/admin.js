const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard-stats', auth, adminAuth, async (req, res) => {
  try {
    console.log('🔢 Fetching dashboard statistics...');

    // Get user counts by role and status
    const totalStudents = await User.countDocuments({ role: 'student', status: 'approved' });
    const totalInstructors = await User.countDocuments({ role: 'instructor', status: 'approved' });
    const pendingApprovals = await User.countDocuments({ status: 'pending' });
    
    // Mock data for camps and tournaments (replace with actual models)
    const activeCamps = 3;
    const upcomingTournaments = 2;

    // Get state-wise breakdown
    const stateBreakdown = await User.aggregate([
      { $match: { role: 'student', status: 'approved', 'profile.state': { $exists: true } } },
      { 
        $group: { 
          _id: '$profile.state', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Get city-wise breakdown for top states
    const cityBreakdown = await User.aggregate([
      { $match: { role: 'student', status: 'approved', 'profile.city': { $exists: true } } },
      { 
        $group: { 
          _id: { state: '$profile.state', city: '$profile.city' },
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly registration trends
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), 0, 1) // This year
          }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          students: { 
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          instructors: { 
            $sum: { $cond: [{ $eq: ['$role', 'instructor'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      overview: {
        totalStudents,
        totalInstructors,
        pendingApprovals,
        activeCamps,
        upcomingTournaments,
        totalUsers: totalStudents + totalInstructors
      },
      breakdown: {
        stateWise: stateBreakdown,
        cityWise: cityBreakdown,
        monthlyTrends: monthlyRegistrations
      }
    };

    console.log('✅ Dashboard stats retrieved:', stats.overview);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
});

// @route   GET /api/admin/pending-users
// @desc    Get all pending user approvals
// @access  Private (Admin only)
router.get('/pending-users', auth, adminAuth, async (req, res) => {
  try {
    console.log('👥 Fetching pending users...');

    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${pendingUsers.length} pending users`);

    res.json({
      success: true,
      data: pendingUsers
    });

  } catch (error) {
    console.error('❌ Pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending users'
    });
  }
});

// @route   PUT /api/admin/approve-user/:userId
// @desc    Approve or reject a user
// @access  Private (Admin only)
router.put('/approve-user/:userId', [
  auth,
  adminAuth,
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
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

    const { userId } = req.params;
    const { action, reason } = req.body;

    console.log(`🔄 ${action} user ${userId}...`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    // Update user status
    user.status = action === 'approve' ? 'approved' : 'rejected';
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    if (reason) {
      user.approvalReason = reason;
    }

    await user.save();

    console.log(`✅ User ${userId} ${action}d successfully`);

    // TODO: Send email notification to user
    // await sendApprovalEmail(user, action, reason);

    res.json({
      success: true,
      message: `User ${action}d successfully`,
      data: {
        userId: user._id,
        status: user.status,
        approvedAt: user.approvedAt
      }
    });

  } catch (error) {
    console.error('❌ User approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/all-users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/all-users', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      state,
      city,
      search
    } = req.query;

    console.log('👥 Fetching all users with filters:', { role, status, state, city, search });

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (state) filter['profile.state'] = state;
    if (city) filter['profile.city'] = city;
    if (search) {
      filter.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    console.log(`✅ Found ${users.length} users (${total} total)`);

    res.json({
      success: true,
      data: {
        users,
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
    console.error('❌ All users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

// @route   DELETE /api/admin/delete-user/:userId
// @desc    Delete a user (soft delete)
// @access  Private (Admin only)
router.delete('/delete-user/:userId', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Deleting user ${userId}...`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - mark as deleted instead of removing
    user.status = 'deleted';
    user.deletedBy = req.user.id;
    user.deletedAt = new Date();
    await user.save();

    console.log(`✅ User ${userId} deleted successfully`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// @route   PUT /api/admin/update-user/:userId
// @desc    Update user information
// @access  Private (Admin only)
router.put('/update-user/:userId', [
  auth,
  adminAuth,
  body('profile.firstName').optional().isLength({ min: 1, max: 50 }),
  body('profile.lastName').optional().isLength({ min: 1, max: 50 }),
  body('profile.phoneNumber').optional().isLength({ min: 10, max: 15 }),
  body('role').optional().isIn(['student', 'instructor', 'admin']),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'suspended'])
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

    const { userId } = req.params;
    const updates = req.body;

    console.log(`📝 Updating user ${userId}...`);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (updates.profile) {
      user.profile = { ...user.profile, ...updates.profile };
    }
    if (updates.role) user.role = updates.role;
    if (updates.status) user.status = updates.status;

    user.updatedBy = req.user.id;
    user.updatedAt = new Date();

    await user.save();

    console.log(`✅ User ${userId} updated successfully`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

module.exports = router;
