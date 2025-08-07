const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  system: {
    type: String,
    enum: ['5e', '3.5e', 'pathfinder', 'other'],
    required: true,
    default: '5e'
  },
  dm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canInviteOthers: {
        type: Boolean,
        default: false
      },
      canManageCharacters: {
        type: Boolean,
        default: true
      }
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    maxPlayers: {
      type: Number,
      default: 6,
      min: 1,
      max: 20
    },
    level: {
      min: {
        type: Number,
        default: 1,
        min: 1,
        max: 20
      },
      max: {
        type: Number,
        default: 20,
        min: 1,
        max: 20
      }
    },
    allowedRaces: [{
      type: String
    }],
    allowedClasses: [{
      type: String
    }],
    useHomebrewRules: {
      type: Boolean,
      default: false
    },
    enableDiceLogging: {
      type: Boolean,
      default: true
    },
    enableCharacterSheets: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'paused', 'completed', 'cancelled'],
    default: 'planning'
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'irregular'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: Number, // 0-6, Sunday = 0
      min: 0,
      max: 6
    },
    time: {
      type: String // Format: "HH:MM"
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    nextSession: {
      type: Date
    }
  },
  chatRooms: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['general', 'ooc', 'ic', 'dm-only', 'custom'],
      default: 'general'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    permissions: {
      dmOnly: {
        type: Boolean,
        default: false
      },
      allowedRoles: [{
        type: String,
        enum: ['dm', 'player', 'observer']
      }]
    }
  }],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  banner: {
    type: String // URL or file path
  },
  notes: {
    public: {
      type: String,
      maxlength: 2000
    },
    private: {
      type: String, // DM only
      maxlength: 5000
    }
  },
  stats: {
    sessionsPlayed: {
      type: Number,
      default: 0
    },
    totalPlayTime: {
      type: Number,
      default: 0 // in minutes
    },
    averageSessionLength: {
      type: Number,
      default: 0 // in minutes
    }
  }
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ dm: 1 });
campaignSchema.index({ 'players.user': 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ 'settings.isPublic': 1 });
campaignSchema.index({ inviteCode: 1 });
campaignSchema.index({ tags: 1 });

// Generate invite code
campaignSchema.methods.generateInviteCode = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  this.inviteCode = result;
  return result;
};

// Add player to campaign
campaignSchema.methods.addPlayer = function(userId, characterId = null) {
  const existingPlayer = this.players.find(p => p.user.toString() === userId.toString());
  
  if (existingPlayer) {
    if (!existingPlayer.isActive) {
      existingPlayer.isActive = true;
      existingPlayer.joinedAt = new Date();
    }
    if (characterId) {
      existingPlayer.character = characterId;
    }
  } else {
    this.players.push({
      user: userId,
      character: characterId,
      joinedAt: new Date(),
      isActive: true
    });
  }
  
  return this.save();
};

// Remove player from campaign
campaignSchema.methods.removePlayer = function(userId) {
  const player = this.players.find(p => p.user.toString() === userId.toString());
  if (player) {
    player.isActive = false;
  }
  return this.save();
};

// Get active players
campaignSchema.methods.getActivePlayers = function() {
  return this.players.filter(p => p.isActive);
};

// Check if user can join
campaignSchema.methods.canUserJoin = function() {
  const activePlayers = this.getActivePlayers();
  return activePlayers.length < this.settings.maxPlayers;
};

// Create default chat rooms
campaignSchema.methods.createDefaultChatRooms = function() {
  this.chatRooms = [
    {
      name: 'General',
      type: 'general',
      isDefault: true,
      permissions: { dmOnly: false, allowedRoles: ['dm', 'player'] }
    },
    {
      name: 'Out of Character',
      type: 'ooc',
      isDefault: false,
      permissions: { dmOnly: false, allowedRoles: ['dm', 'player'] }
    },
    {
      name: 'In Character',
      type: 'ic',
      isDefault: false,
      permissions: { dmOnly: false, allowedRoles: ['dm', 'player'] }
    },
    {
      name: 'DM Notes',
      type: 'dm-only',
      isDefault: false,
      permissions: { dmOnly: true, allowedRoles: ['dm'] }
    }
  ];
  return this;
};

// Validate level range
campaignSchema.pre('save', function(next) {
  if (this.settings.level.min > this.settings.level.max) {
    next(new Error('Minimum level cannot be greater than maximum level'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
