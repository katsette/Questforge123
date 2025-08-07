const express = require('express');
const auth = require('../middleware/auth');
const Character = require('../models/Character');
const Campaign = require('../models/Campaign');

const router = express.Router();

// GET /api/characters - Get user's characters
router.get('/', auth, async (req, res) => {
  try {
    const characters = await Character.findByUser(req.user.uid);
    res.json({
      characters,
      success: true
    });
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({
      error: 'Failed to fetch characters',
      message: error.message
    });
  }
});

// POST /api/characters - Create new character
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      class: characterClass, 
      level = 1, 
      race, 
      background, 
      stats, 
      campaignId 
    } = req.body;
    
    // Validation
    if (!name || !characterClass) {
      return res.status(400).json({
        error: 'Character name and class are required'
      });
    }
    
    if (name.length > 50) {
      return res.status(400).json({
        error: 'Character name must be 50 characters or less'
      });
    }
    
    if (level < 1 || level > 20) {
      return res.status(400).json({
        error: 'Character level must be between 1 and 20'
      });
    }
    
    // If assigning to campaign, verify user has access
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({
          error: 'Campaign not found'
        });
      }
      
      const isAuthorized = await Campaign.isMember(campaignId, req.user.uid);
      
      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Not authorized to assign character to this campaign'
        });
      }
    }
    
    const characterData = {
      name: name.trim(),
      class: characterClass,
      level,
      race,
      background,
      stats,
      userId: req.user.uid,
      campaignId
    };
    
    const character = await Character.create(characterData);
    
    res.status(201).json({
      character,
      success: true
    });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({
      error: 'Failed to create character',
      message: error.message
    });
  }
});

// GET /api/characters/:id - Get character details
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Check if user has access to this character
    const isOwner = character.userId === req.user.uid;
    
    // If not owner, check if user has access through campaign
    let hasAccess = isOwner;
    if (!hasAccess && character.campaignId) {
      const isMember = await Campaign.isMember(character.campaignId, req.user.uid);
      if (isMember) {
        hasAccess = true;
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Not authorized to view this character'
      });
    }
    
    res.json({
      character,
      isOwner,
      success: true
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({
      error: 'Failed to fetch character',
      message: error.message
    });
  }
});

// PUT /api/characters/:id - Update character
router.put('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Only owner can update character
    if (character.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Not authorized to update this character'
      });
    }
    
    const { name, class: characterClass, level, race, background, stats } = req.body;
    const updateData = {};
    
    if (name !== undefined) {
      if (!name || name.length > 50) {
        return res.status(400).json({
          error: 'Character name must be between 1 and 50 characters'
        });
      }
      updateData.name = name.trim();
    }
    
    if (characterClass !== undefined) {
      updateData.class = characterClass;
    }
    
    if (level !== undefined) {
      if (level < 1 || level > 20) {
        return res.status(400).json({
          error: 'Character level must be between 1 and 20'
        });
      }
      updateData.level = level;
    }
    
    if (race !== undefined) updateData.race = race;
    if (background !== undefined) updateData.background = background;
    if (stats !== undefined) updateData.stats = stats;
    
    const updatedCharacter = await Character.updateById(req.params.id, updateData);
    
    res.json({
      character: updatedCharacter,
      success: true
    });
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({
      error: 'Failed to update character',
      message: error.message
    });
  }
});

// DELETE /api/characters/:id - Delete character
router.delete('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Only owner can delete character
    if (character.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Not authorized to delete this character'
      });
    }
    
    await Character.deleteById(req.params.id);
    
    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({
      error: 'Failed to delete character',
      message: error.message
    });
  }
});

// POST /api/characters/:id/level-up - Level up character
router.post('/:id/level-up', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Only owner can level up character
    if (character.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Not authorized to level up this character'
      });
    }
    
    if (character.level >= 20) {
      return res.status(400).json({
        error: 'Character is already at maximum level (20)'
      });
    }
    
    const leveledCharacter = await Character.levelUp(req.params.id);
    
    res.json({
      character: leveledCharacter,
      success: true,
      message: `${character.name} leveled up to level ${leveledCharacter.level}!`
    });
  } catch (error) {
    console.error('Level up character error:', error);
    res.status(500).json({
      error: 'Failed to level up character',
      message: error.message
    });
  }
});

// POST /api/characters/:id/assign-campaign - Assign character to campaign
router.post('/:id/assign-campaign', auth, async (req, res) => {
  try {
    const { campaignId } = req.body;
    
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Only owner can assign character
    if (character.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Not authorized to assign this character'
      });
    }
    
    // Verify campaign exists and user has access
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found'
      });
    }
    
    const isAuthorized = await Campaign.isMember(campaignId, req.user.uid);
    
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Not authorized to assign character to this campaign'
      });
    }
    
    const updatedCharacter = await Character.assignToCampaign(req.params.id, campaignId);
    
    res.json({
      character: updatedCharacter,
      success: true,
      message: `${character.name} assigned to ${campaign.name}`
    });
  } catch (error) {
    console.error('Assign character error:', error);
    res.status(500).json({
      error: 'Failed to assign character',
      message: error.message
    });
  }
});

// POST /api/characters/:id/remove-campaign - Remove character from campaign
router.post('/:id/remove-campaign', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        error: 'Character not found'
      });
    }
    
    // Only owner can remove character
    if (character.userId !== req.user.uid) {
      return res.status(403).json({
        error: 'Not authorized to modify this character'
      });
    }
    
    const updatedCharacter = await Character.removeFromCampaign(req.params.id);
    
    res.json({
      character: updatedCharacter,
      success: true,
      message: `${character.name} removed from campaign`
    });
  } catch (error) {
    console.error('Remove character from campaign error:', error);
    res.status(500).json({
      error: 'Failed to remove character from campaign',
      message: error.message
    });
  }
});

module.exports = router;