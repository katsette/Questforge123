const express = require('express');
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the requesting user is authorized to view this profile
    if (req.user.uid !== userId) {
      // Optionally, you could allow public profiles or add more complex authorization here
      return res.status(403).json({ message: 'Unauthorized to view this profile' });
    }

    const userRecord = await admin.auth().getUser(userId);

    if (!userRecord) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // You can fetch additional profile data from Firestore if you store it there
    // For now, we'll just return basic Firebase Auth user data
    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        // Add any custom claims or other relevant data you store in Firebase Auth
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({
      error: 'Failed to get user profile',
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const uid = req.user.uid;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const userRecord = await admin.auth().updateUser(uid, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

module.exports = router;