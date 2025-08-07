const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/campaigns - Get user's campaigns
router.get('/', auth, async (req, res) => {
  res.json({ message: 'Campaign routes coming soon!' });
});

// POST /api/campaigns - Create new campaign
router.post('/', auth, async (req, res) => {
  res.json({ message: 'Create campaign endpoint coming soon!' });
});

// GET /api/campaigns/:id - Get campaign details
router.get('/:id', auth, async (req, res) => {
  res.json({ message: 'Get campaign details coming soon!' });
});

module.exports = router;
