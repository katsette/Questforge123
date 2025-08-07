const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password -refreshToken -email')
      .populate('campaigns.campaign', 'name description status')
      .populate('characters', 'name basicInfo.class basicInfo.level status avatar');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('profile.displayName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Display name must be 50 characters or less'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or less')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { profile, settings } = req.body;
    const user = req.user;

    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        profile: user.profile,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.displayName': { $regex: q, $options: 'i' } }
      ]
    })
      .select('username profile.displayName profile.avatar isOnline lastActive')
      .limit(parseInt(limit));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Failed to search users'
    });
  }
});

// Get online users
router.get('/online', auth, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select('username profile.displayName profile.avatar lastActive')
      .sort({ lastActive: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      error: 'Failed to get online users'
    });
  }
});

module.exports = router;
