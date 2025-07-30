const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'specific'],
    default: 'all'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  scheduledAt: {
    type: Date
  },
  expiresAt: {
    type: Date
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

// Index for efficient queries
AnnouncementSchema.index({ status: 1, createdAt: -1 });
AnnouncementSchema.index({ targetAudience: 1, priority: 1 });
AnnouncementSchema.index({ author: 1, createdAt: -1 });

// Virtual for read count
AnnouncementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Virtual for like count
AnnouncementSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
AnnouncementSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user has read announcement
AnnouncementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark as read by user
AnnouncementSchema.methods.markAsRead = function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ user: userId });
    return this.save();
  }
};

// Method to toggle like
AnnouncementSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Static method to get published announcements
AnnouncementSchema.statics.getPublished = function(filters = {}) {
  return this.find({ 
    status: 'published',
    ...filters,
    $or: [
      { scheduledAt: { $lte: new Date() } },
      { scheduledAt: { $exists: false } }
    ],
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: { $exists: false } }
    ]
  }).populate('author', 'profile.firstName profile.lastName role')
    .sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Announcement', AnnouncementSchema);
