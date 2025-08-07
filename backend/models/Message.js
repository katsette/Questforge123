const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  room: {
    type: String,
    required: true,
    default: 'general'
  },
  type: {
    type: String,
    enum: ['message', 'dice', 'system', 'whisper', 'action', 'ooc', 'ic'],
    default: 'message'
  },
  
  // For dice rolls
  diceRoll: {
    formula: { type: String }, // e.g., "2d6+3"
    result: { type: Number },
    individual: [{ type: Number }], // individual die results
    modifier: { type: Number, default: 0 },
    reason: { type: String }, // what the roll was for
    isPrivate: { type: Boolean, default: false }, // DM-only roll
    advantage: { type: Boolean, default: false },
    disadvantage: { type: Boolean, default: false }
  },

  // For whisper messages
  whisper: {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Message metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalContent: {
    type: String
  },

  // Reactions
  reactions: [{
    emoji: { type: String, required: true },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: { type: Number, default: 0 }
  }],

  // Thread/Reply system
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],

  // Character context (if message sent as character)
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  },

  // Pinned message
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: {
    type: Date
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ campaign: 1, room: 1, createdAt: -1 });
messageSchema.index({ author: 1, createdAt: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ 'whisper.to': 1 });
messageSchema.index({ parentMessage: 1 });
messageSchema.index({ isPinned: 1 });
messageSchema.index({ isDeleted: 1 });

// Method to add reaction
messageSchema.methods.addReaction = function(emoji, userId) {
  let reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (!reaction) {
    reaction = { emoji, users: [], count: 0 };
    this.reactions.push(reaction);
  }
  
  if (!reaction.users.includes(userId)) {
    reaction.users.push(userId);
    reaction.count++;
  }
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (reaction) {
    reaction.users = reaction.users.filter(id => id.toString() !== userId.toString());
    reaction.count = reaction.users.length;
    
    if (reaction.count === 0) {
      this.reactions = this.reactions.filter(r => r.emoji !== emoji);
    }
  }
  
  return this.save();
};

// Method to edit message
messageSchema.methods.editContent = function(newContent) {
  if (!this.isEdited) {
    this.originalContent = this.content;
    this.isEdited = true;
  }
  this.content = newContent;
  this.editedAt = new Date();
  
  return this.save();
};

// Method to soft delete
messageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  
  return this.save();
};

// Method to pin message
messageSchema.methods.pin = function(userId) {
  this.isPinned = true;
  this.pinnedBy = userId;
  this.pinnedAt = new Date();
  
  return this.save();
};

// Method to unpin message
messageSchema.methods.unpin = function() {
  this.isPinned = false;
  this.pinnedBy = undefined;
  this.pinnedAt = undefined;
  
  return this.save();
};

// Static method to get recent messages for a campaign room
messageSchema.statics.getRecentMessages = function(campaignId, room, limit = 50, before = null) {
  let query = {
    campaign: campaignId,
    room: room,
    isDeleted: false
  };
  
  if (before) {
    query.createdAt = { $lt: before };
  }
  
  return this.find(query)
    .populate('author', 'username profile.displayName profile.avatar')
    .populate('character', 'name avatar')
    .populate('whisper.to', 'username profile.displayName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get pinned messages
messageSchema.statics.getPinnedMessages = function(campaignId, room) {
  return this.find({
    campaign: campaignId,
    room: room,
    isPinned: true,
    isDeleted: false
  })
    .populate('author', 'username profile.displayName profile.avatar')
    .populate('character', 'name avatar')
    .populate('pinnedBy', 'username profile.displayName')
    .sort({ pinnedAt: -1 });
};

// Transform for JSON output
messageSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.isDeleted && ret.type !== 'system') {
      ret.content = '[Message deleted]';
      delete ret.originalContent;
    }
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Message', messageSchema);
