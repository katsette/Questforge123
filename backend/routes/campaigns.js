const express = require('express');
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');

const router = express.Router();

// GET /api/campaigns - Get all public campaigns and user's campaigns
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    let campaigns;

    if (type === 'my') {
      campaigns = await Campaign.findByGM(req.user.uid);
    } else {
      campaigns = await Campaign.findAll();
    }

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Campaign name is required' });
    }

    const campaign = await Campaign.create({
      name: name.trim(),
      description: description?.trim() || null,
      dmId: req.user.uid,
    });

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/campaigns/:id - Get campaign details
router.get('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const isMember = await Campaign.isMember(campaignId, req.user.uid);
    if (!isMember && req.user.uid !== campaign.dmId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const members = await Campaign.getMembers(campaignId);
    const characters = await Campaign.getCharacters(campaignId);

    res.json({ 
      success: true, 
      campaign: {
        ...campaign,
        members,
        characters,
        memberCount: members.length
      }
    });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns/:id/join - Join a campaign
router.post('/:id/join', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (!campaign.isActive) {
      return res.status(400).json({ success: false, error: 'Campaign is not active' });
    }

    if (await Campaign.isMember(campaignId, req.user.uid)) {
      return res.status(400).json({ success: false, error: 'Already a member of this campaign' });
    }

    await Campaign.addMember(campaignId, req.user.uid, 'player');

    res.json({ success: true, message: 'Successfully joined campaign' });
  } catch (error) {
    console.error('Error joining campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns/:id/leave - Leave a campaign
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (campaign.dmId === req.user.uid) {
      return res.status(400).json({ success: false, error: 'Campaign GM cannot leave their own campaign' });
    }

    if (!(await Campaign.isMember(campaignId, req.user.uid))) {
      return res.status(400).json({ success: false, error: 'Not a member of this campaign' });
    }

    await Campaign.removeMember(campaignId, req.user.uid);

    res.json({ success: true, message: 'Successfully left campaign' });
  } catch (error) {
    console.error('Error leaving campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/campaigns/:id - Update campaign (GM only)
router.put('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (campaign.dmId !== req.user.uid) {
      return res.status(403).json({ success: false, error: 'Only the GM can update this campaign' });
    }

    const { name, description, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCampaign = await Campaign.updateById(campaignId, updateData);

    res.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (GM only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (campaign.dmId !== req.user.uid) {
      return res.status(403).json({ success: false, error: 'Only the GM can delete this campaign' });
    }

    await Campaign.deleteById(campaignId);

    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;