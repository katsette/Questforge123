const express = require('express');
const admin = require('firebase-admin');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a custom token for the user
router.post('/custom-token', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ message: 'Error creating custom token' });
  }
});

module.exports = router;