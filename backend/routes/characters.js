const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/characters - Get user's characters
router.get('/', auth, async (req, res) => {
  res.json({ message: 'Character routes coming soon!' });
});

// POST /api/characters - Create new character
router.post('/', auth, async (req, res) => {
  res.json({ message: 'Create character endpoint coming soon!' });
});

// GET /api/characters/:id - Get character details
router.get('/:id', auth, async (req, res) => {
  res.json({ message: 'Get character details coming soon!' });
});

module.exports = router;
