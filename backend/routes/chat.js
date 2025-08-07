const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Campaign = require('../models/Campaign');

const router = express.Router();

// GET /api/chat/campaigns/:campaignId/messages - Get chat messages for a campaign
router.get('/campaigns/:campaignId/messages', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const isMember = await Campaign.isMember(campaignId, req.user.uid);
    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { messages, pagination } = await Message.getPaginated(campaignId, parseInt(page), parseInt(limit));

    res.json({ success: true, messages, pagination });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chat/campaigns/:campaignId/messages - Send message to a campaign
router.post('/campaigns/:campaignId/messages', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { content, type = 'text', characterId = null } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const isMember = await Campaign.isMember(campaignId, req.user.uid);
    if (!isMember) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const message = await Message.create({
      content: content.trim(),
      type,
      userId: req.user.uid,
      campaignId,
      characterId,
    });

    // Emit message via Socket.IO (assuming io is available via req.io)
    if (req.io) {
      req.io.to(campaignId).emit('newMessage', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;