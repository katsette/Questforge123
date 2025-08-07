const express = require('express');
const auth = require('../middleware/auth');
const { 
  rollDiceWithNotation,
  getCommonDicePresets,
  isValidDiceNotation
} = require('../utils/dice');

const router = express.Router();

// POST /api/dice/roll - Roll dice
router.post('/roll', auth, async (req, res) => {
  try {
    const { 
      formula, 
      reason = '', 
      isPrivate = false, 
      advantage = false, 
      disadvantage = false,
      campaignId = null
    } = req.body;
    
    if (!formula) {
      return res.status(400).json({
        error: 'Dice formula is required'
      });
    }

    // Validate dice notation
    if (!isValidDiceNotation(formula)) {
      return res.status(400).json({
        error: 'Invalid dice notation',
        formula,
        examples: ['1d20', '2d6+3', '1d8-1', '4d4']
      });
    }

    // Roll the dice
    const rollResult = rollDiceWithNotation(formula, { advantage, disadvantage });
    
    if (rollResult.error) {
      return res.status(400).json({
        error: rollResult.error,
        formula
      });
    }

    // Prepare the complete result
    const result = {
      id: Date.now() + Math.random(), // Simple unique ID
      userId: req.user.uid,
      timestamp: new Date().toISOString(),
      formula: rollResult.formula || formula,
      result: rollResult.total,
      individual: rollResult.individual || [],
      subtotal: rollResult.subtotal || 0,
      modifier: rollResult.modifier || 0,
      reason: reason.trim(),
      isPrivate,
      advantage: rollResult.advantage || false,
      disadvantage: rollResult.disadvantage || false,
      success: true
    };

    // Emit to campaign room or user room via socket if available
    if (req.io) {
      const targetRoom = campaignId && !isPrivate ? `campaign:${campaignId}` : `user:${req.user.id}`;
      
      req.io.to(targetRoom).emit('diceRoll', {
        ...result,
        campaignId: campaignId || null
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Dice roll error:', error);
    res.status(500).json({
      error: 'Dice roll failed',
      message: error.message
    });
  }
});

// GET /api/dice/presets - Get common dice presets
router.get('/presets', (req, res) => {
  try {
    const presets = getCommonDicePresets();
    res.json({
      presets,
      success: true
    });
  } catch (error) {
    console.error('Error getting dice presets:', error);
    res.status(500).json({
      error: 'Failed to get dice presets',
      message: error.message
    });
  }
});

// POST /api/dice/validate - Validate dice notation
router.post('/validate', (req, res) => {
  try {
    const { formula } = req.body;
    
    if (!formula) {
      return res.status(400).json({
        error: 'Formula is required for validation'
      });
    }

    const isValid = isValidDiceNotation(formula);
    
    res.json({
      formula,
      valid: isValid,
      success: true
    });
  } catch (error) {
    console.error('Error validating dice notation:', error);
    res.status(500).json({
      error: 'Failed to validate dice notation',
      message: error.message
    });
  }
});

module.exports = router;
