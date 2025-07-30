const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
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

// @route   GET /api/announcements
// @desc    Get all published announcements
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, targetAudience } = req.query;

    console.log('📢 Fetching announcements...');

    const filters = {};
    if (priority) filters.priority = priority;
    if (targetAudience) {
      if (targetAudience === 'specific') {
        filters.$or = [
          { targetAudience: 'all' },
          { targetAudience: req.user.role },
          { specificUsers: req.user.id }
        ];
      } else {
        filters.$or = [
          { targetAudience: 'all' },
          { targetAudience: req.user.role }
        ];
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const announcements = await Announcement.getPublished(filters)
      .skip(skip)
      .limit(limitNum);

    const total = await Announcement.countDocuments({ 
      status: 'published',
      ...filters
    });

    // Mark announcements as read by current user
    const unreadAnnouncements = announcements.filter(a => !a.isReadBy(req.user.id));
    await Promise.all(
      unreadAnnouncements.map(a => a.markAsRead(req.user.id))
    );

    console.log(`✅ Found ${announcements.length} announcements`);

    res.json({
      success: true,
      data: {
        announcements,
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
    console.error('❌ Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'profile.firstName profile.lastName role')
      .populate('comments.user', 'profile.firstName profile.lastName');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user has access to this announcement
    const hasAccess = announcement.targetAudience === 'all' ||
                     announcement.targetAudience === req.user.role ||
                     announcement.specificUsers.includes(req.user.id) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read
    await announcement.markAsRead(req.user.id);

    res.json({
      success: true,
      data: announcement
    });

  } catch (error) {
    console.error('❌ Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcement'
    });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Admin only)
router.post('/', [
  auth,
  adminAuth,
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('content').isLength({ min: 1, max: 5000 }).withMessage('Content must be 1-5000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('targetAudience').optional().isIn(['all', 'students', 'instructors', 'specific']),
  body('scheduledAt').optional().isISO8601(),
  body('expiresAt').optional().isISO8601()
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

    const {
      title,
      content,
      priority = 'medium',
      targetAudience = 'all',
      specificUsers = [],
      scheduledAt,
      expiresAt
    } = req.body;

    console.log('📝 Creating new announcement:', title);

    const announcement = new Announcement({
      title,
      content,
      author: req.user.id,
      priority,
      targetAudience,
      specificUsers: targetAudience === 'specific' ? specificUsers : [],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await announcement.save();
    await announcement.populate('author', 'profile.firstName profile.lastName role');

    console.log('✅ Announcement created successfully:', announcement._id);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });

  } catch (error) {
    console.error('❌ Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  adminAuth,
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 1, max: 5000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('targetAudience').optional().isIn(['all', 'students', 'instructors', 'specific']),
  body('status').optional().isIn(['draft', 'published', 'archived'])
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

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        announcement[key] = updates[key];
      }
    });

    announcement.updatedAt = new Date();
    await announcement.save();

    console.log('✅ Announcement updated:', announcement._id);

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });

  } catch (error) {
    console.error('❌ Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement'
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    console.log('✅ Announcement deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement'
    });
  }
});

// @route   POST /api/announcements/:id/like
// @desc    Toggle like on announcement
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.toggleLike(req.user.id);

    res.json({
      success: true,
      message: 'Like toggled successfully',
      data: {
        likeCount: announcement.likeCount,
        isLiked: announcement.likes.includes(req.user.id)
      }
    });

  } catch (error) {
    console.error('❌ Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

// @route   POST /api/announcements/:id/comment
// @desc    Add comment to announcement
// @access  Private
router.post('/:id/comment', [
  auth,
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters')
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

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.comments.push({
      user: req.user.id,
      content: req.body.content
    });

    await announcement.save();
    await announcement.populate('comments.user', 'profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: announcement.comments[announcement.comments.length - 1]
    });

  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

module.exports = router;
