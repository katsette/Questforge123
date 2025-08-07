const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  system: {
    type: String,
    enum: ['5e', '3.5e', 'pathfinder', 'other'],
    required: true,
    default: '5e'
  },
  
  // Basic Character Info
  basicInfo: {
    race: {
      type: String,
      required: true
    },
    class: {
      type: String,
      required: true
    },
    subclass: {
      type: String
    },
    background: {
      type: String
    },
    alignment: {
      type: String,
      enum: [
        'lawful good', 'neutral good', 'chaotic good',
        'lawful neutral', 'true neutral', 'chaotic neutral',
        'lawful evil', 'neutral evil', 'chaotic evil'
      ]
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 1
    },
    experiencePoints: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Ability Scores
  abilityScores: {
    strength: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    },
    dexterity: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    },
    constitution: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    },
    intelligence: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    },
    wisdom: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    },
    charisma: {
      base: { type: Number, required: true, min: 1, max: 30 },
      modifier: { type: Number },
      savingThrow: { type: Number },
      proficient: { type: Boolean, default: false }
    }
  },

  // Skills
  skills: [{
    name: { type: String, required: true },
    ability: { type: String, required: true },
    proficient: { type: Boolean, default: false },
    expertise: { type: Boolean, default: false },
    bonus: { type: Number, default: 0 }
  }],

  // Combat Stats
  combat: {
    armorClass: {
      type: Number,
      required: true,
      min: 1
    },
    hitPoints: {
      current: { type: Number, required: true, min: 0 },
      maximum: { type: Number, required: true, min: 1 },
      temporary: { type: Number, default: 0, min: 0 }
    },
    hitDice: [{
      die: { type: String, required: true }, // e.g., "d8"
      current: { type: Number, required: true, min: 0 },
      maximum: { type: Number, required: true, min: 1 }
    }],
    speed: {
      walking: { type: Number, default: 30 },
      flying: { type: Number, default: 0 },
      swimming: { type: Number, default: 0 },
      climbing: { type: Number, default: 0 }
    },
    initiative: {
      type: Number,
      default: 0
    },
    proficiencyBonus: {
      type: Number,
      required: true,
      default: 2
    }
  },

  // Features & Traits
  features: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String }, // race, class, feat, etc.
    type: { 
      type: String, 
      enum: ['racial', 'class', 'feat', 'background', 'other'],
      default: 'other' 
    },
    usesRemaining: { type: Number },
    usesMax: { type: Number },
    rechargeType: { 
      type: String, 
      enum: ['short_rest', 'long_rest', 'daily', 'weekly', 'none'],
      default: 'none'
    }
  }],

  // Equipment
  equipment: {
    weapons: [{
      name: { type: String, required: true },
      damage: { type: String }, // e.g., "1d8+3"
      damageType: { type: String },
      properties: [{ type: String }],
      proficient: { type: Boolean, default: false },
      equipped: { type: Boolean, default: false },
      attackBonus: { type: Number, default: 0 }
    }],
    armor: [{
      name: { type: String, required: true },
      armorClass: { type: Number },
      armorType: { 
        type: String, 
        enum: ['light', 'medium', 'heavy', 'shield'] 
      },
      equipped: { type: Boolean, default: false },
      stealthDisadvantage: { type: Boolean, default: false }
    }],
    items: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1, min: 0 },
      weight: { type: Number, default: 0, min: 0 },
      value: { type: Number, default: 0, min: 0 },
      description: { type: String },
      rarity: { 
        type: String, 
        enum: ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact'],
        default: 'common' 
      }
    }]
  },

  // Spellcasting
  spellcasting: {
    class: { type: String },
    ability: { type: String },
    spellAttackBonus: { type: Number, default: 0 },
    spellSaveDC: { type: Number, default: 8 },
    cantripsKnown: { type: Number, default: 0 },
    spellsKnown: { type: Number, default: 0 },
    spellSlots: [{
      level: { type: Number, min: 1, max: 9, required: true },
      current: { type: Number, min: 0, default: 0 },
      maximum: { type: Number, min: 0, default: 0 }
    }],
    spells: [{
      name: { type: String, required: true },
      level: { type: Number, min: 0, max: 9, required: true },
      school: { type: String },
      castingTime: { type: String },
      range: { type: String },
      components: { type: String },
      duration: { type: String },
      description: { type: String },
      prepared: { type: Boolean, default: false },
      alwaysPrepared: { type: Boolean, default: false }
    }]
  },

  // Currency
  currency: {
    copper: { type: Number, default: 0, min: 0 },
    silver: { type: Number, default: 0, min: 0 },
    electrum: { type: Number, default: 0, min: 0 },
    gold: { type: Number, default: 0, min: 0 },
    platinum: { type: Number, default: 0, min: 0 }
  },

  // Character Description
  description: {
    age: { type: Number, min: 0 },
    height: { type: String },
    weight: { type: String },
    eyes: { type: String },
    skin: { type: String },
    hair: { type: String },
    appearance: { type: String, maxlength: 1000 },
    personality: { type: String, maxlength: 1000 },
    ideals: { type: String, maxlength: 500 },
    bonds: { type: String, maxlength: 500 },
    flaws: { type: String, maxlength: 500 },
    backstory: { type: String, maxlength: 2000 }
  },

  // Notes
  notes: {
    public: { type: String, maxlength: 2000 },
    private: { type: String, maxlength: 2000 }
  },

  // Character Sheet Image/Avatar
  avatar: {
    type: String // URL or file path
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'dead', 'retired'],
    default: 'active'
  },

  // Permissions
  visibility: {
    type: String,
    enum: ['public', 'campaign', 'private'],
    default: 'campaign'
  }

}, {
  timestamps: true
});

// Indexes
characterSchema.index({ owner: 1 });
characterSchema.index({ campaign: 1 });
characterSchema.index({ 'basicInfo.level': 1 });
characterSchema.index({ status: 1 });

// Calculate ability modifiers before saving
characterSchema.pre('save', function(next) {
  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  
  abilities.forEach(ability => {
    const score = this.abilityScores[ability].base;
    const modifier = Math.floor((score - 10) / 2);
    this.abilityScores[ability].modifier = modifier;
    
    // Calculate saving throw bonus
    const profBonus = this.abilityScores[ability].proficient ? this.combat.proficiencyBonus : 0;
    this.abilityScores[ability].savingThrow = modifier + profBonus;
  });

  next();
});

// Method to calculate skill bonuses
characterSchema.methods.calculateSkillBonus = function(skillName) {
  const skill = this.skills.find(s => s.name === skillName);
  if (!skill) return 0;

  const abilityMod = this.abilityScores[skill.ability].modifier;
  const profBonus = skill.proficient ? this.combat.proficiencyBonus : 0;
  const expertiseBonus = skill.expertise ? this.combat.proficiencyBonus : 0;
  
  return abilityMod + profBonus + expertiseBonus + skill.bonus;
};

// Method to get current carrying capacity
characterSchema.methods.getCarryingCapacity = function() {
  const strScore = this.abilityScores.strength.base;
  return strScore * 15; // Basic carrying capacity in pounds
};

// Method to check if character can level up
characterSchema.methods.canLevelUp = function() {
  const currentLevel = this.basicInfo.level;
  const currentXP = this.basicInfo.experiencePoints;
  
  // XP thresholds for 5e (simplified)
  const xpThresholds = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
    6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
    11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
    16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000
  };
  
  return currentLevel < 20 && currentXP >= xpThresholds[currentLevel + 1];
};

// Method to get total wealth in gold pieces
characterSchema.methods.getTotalWealthInGold = function() {
  const { copper, silver, electrum, gold, platinum } = this.currency;
  return (copper * 0.01) + (silver * 0.1) + (electrum * 0.5) + gold + (platinum * 10);
};

module.exports = mongoose.model('Character', characterSchema);
