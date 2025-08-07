const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/campaigns/:campaignId/rooms/:room - Get chat messages
router.get('/campaigns/:campaignId/rooms/:room', auth, async (req, res) => {
  res.json({ message: 'Chat routes coming soon!' });
});

// POST /api/chat/campaigns/:campaignId/rooms/:room - Send message
router.post('/campaigns/:campaignId/rooms/:room', auth, async (req, res) => {
  res.json({ message: 'Send message endpoint coming soon!' });
});

module.exports = router;
