const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/dice/roll - Roll dice
router.post('/roll', auth, async (req, res) => {
  try {
    const { formula, reason, isPrivate = false } = req.body;
    
    if (!formula) {
      return res.status(400).json({
        error: 'Dice formula is required'
      });
    }

    // Basic dice rolling logic (simplified for now)
    // This would be expanded with proper dice notation parsing
    res.json({ 
      message: 'Dice roller coming soon!',
      formula,
      reason,
      isPrivate
    });
  } catch (error) {
    res.status(500).json({
      error: 'Dice roll failed'
    });
  }
});

module.exports = router;
