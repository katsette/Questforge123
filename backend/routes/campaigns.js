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
      // Get campaigns where user is a member
      const db = require('../config/database').getDB();
      const stmt = db.prepare(`
        SELECT DISTINCT c.*, u.username as dmUsername,
               cm.role as userRole,
               (SELECT COUNT(*) FROM campaign_members WHERE campaignId = c.id) as memberCount
        FROM campaigns c
        JOIN users u ON c.dmId = u.id
        JOIN campaign_members cm ON c.id = cm.campaignId
        WHERE cm.userId = ?
        ORDER BY c.createdAt DESC
      `);
      campaigns = stmt.all(req.user.id);
    } else {
      // Get all active campaigns
      const db = require('../config/database').getDB();
      const stmt = db.prepare(`
        SELECT c.*, u.username as dmUsername,
               (SELECT COUNT(*) FROM campaign_members WHERE campaignId = c.id) as memberCount,
               (SELECT COUNT(*) FROM campaign_members WHERE campaignId = c.id AND userId = ?) as isMember
        FROM campaigns c
        JOIN users u ON c.dmId = u.id
        WHERE c.isActive = 1
        ORDER BY c.createdAt DESC
      `);
      campaigns = stmt.all(req.user.id);
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
    const { name, description, isPublic = true } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Campaign name is required' });
    }
    
    const campaign = Campaign.create({
      name: name.trim(),
      description: description?.trim() || null,
      dmId: req.user.id,
      isActive: true
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
    const campaignId = parseInt(req.params.id);
    const campaign = Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    // Check if user is a member or if it's public
    const isMember = Campaign.isMember(campaignId, req.user.id);
    if (!isMember && req.user.id !== campaign.dmId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    // Get additional campaign data
    const members = Campaign.getMembers(campaignId);
    const characters = Campaign.getCharacters(campaignId);
    
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
    const campaignId = parseInt(req.params.id);
    const campaign = Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    if (!campaign.isActive) {
      return res.status(400).json({ success: false, error: 'Campaign is not active' });
    }
    
    if (Campaign.isMember(campaignId, req.user.id)) {
      return res.status(400).json({ success: false, error: 'Already a member of this campaign' });
    }
    
    Campaign.addMember(campaignId, req.user.id, 'player');
    
    res.json({ success: true, message: 'Successfully joined campaign' });
  } catch (error) {
    console.error('Error joining campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns/:id/leave - Leave a campaign
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    if (campaign.dmId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Campaign GM cannot leave their own campaign' });
    }
    
    if (!Campaign.isMember(campaignId, req.user.id)) {
      return res.status(400).json({ success: false, error: 'Not a member of this campaign' });
    }
    
    Campaign.removeMember(campaignId, req.user.id);
    
    res.json({ success: true, message: 'Successfully left campaign' });
  } catch (error) {
    console.error('Error leaving campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/campaigns/:id - Update campaign (GM only)
router.put('/:id', auth, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    if (campaign.dmId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the GM can update this campaign' });
    }
    
    const { name, description, isActive } = req.body;
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;
    
    const updatedCampaign = Campaign.updateById(campaignId, updateData);
    
    res.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/campaigns/:id - Delete campaign (GM only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const campaign = Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    
    if (campaign.dmId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the GM can delete this campaign' });
    }
    
    const deleted = Campaign.deleteById(campaignId);
    
    if (deleted) {
      res.json({ success: true, message: 'Campaign deleted successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete campaign' });
    }
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
