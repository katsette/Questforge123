const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  let secret = process.env.JWT_SECRET;
  
  // Fallback for missing JWT_SECRET
  if (!secret) {
    console.error('⚠️  JWT_SECRET environment variable not set, using fallback');
    if (process.env.NODE_ENV === 'production') {
      // In production, we need a consistent secret across restarts
      // Use a combination of fixed string and service info
      const crypto = require('crypto');
      const baseString = 'questforge-prod-fallback-' + (process.env.RENDER_SERVICE_ID || 'unknown');
      secret = crypto.createHash('sha256').update(baseString).digest('hex');
      console.warn('🔐 Generated consistent production JWT secret from service info');
    } else {
      // Development fallback
      secret = 'dev-fallback-secret-not-for-production-' + Date.now();
      console.warn('🔐 Using development fallback JWT secret');
    }
  }
  
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { username: req.body.username, email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, displayName, firstName, lastName } = req.body;
    console.log('📋 Processing registration data:', { username, email, displayName, firstName, lastName });
    
    // Use displayName as firstName if provided, or split displayName if it contains spaces
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (displayName && !firstName && !lastName) {
      const nameParts = displayName.trim().split(' ');
      finalFirstName = nameParts[0];
      if (nameParts.length > 1) {
        finalLastName = nameParts.slice(1).join(' ');
      }
    }

    // Check if user already exists
    const existingUserByEmail = User.findByEmail(email);
    const existingUserByUsername = User.findByUsername(username);

    if (existingUserByEmail) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email already registered'
      });
    }

    if (existingUserByUsername) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Username already taken'
      });
    }

    // Hash password and create new user
    const hashedPassword = await User.hashPassword(password);
    const user = User.create({
      username,
      email,
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: User.toJSON(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// Login user
router.post('/login', [
  body('login')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { login, password } = req.body;

    // Find user by email or username
    let user = User.findByEmail(login.toLowerCase());
    if (!user) {
      user = User.findByUsername(login);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'User not found'
      });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Get user campaigns and characters
    const userCampaigns = User.getUserCampaigns(user.id);
    const userCharacters = User.getUserCharacters(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...User.toJSON(user),
        campaigns: userCampaigns,
        characters: userCharacters
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    const userCampaigns = User.getUserCampaigns(req.user.id);
    const userCharacters = User.getUserCharacters(req.user.id);

    res.json({
      user: {
        ...User.toJSON(user),
        campaigns: userCampaigns,
        characters: userCharacters
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      message: 'An error occurred while fetching user information'
    });
  }
});

// Verify token
router.get('/verify', auth, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Change password
router.put('/password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = User.findById(req.user.id);

    // Verify current password
    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const hashedPassword = await User.hashPassword(newPassword);
    User.updateById(req.user.id, { password: hashedPassword });

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing password'
    });
  }
});

module.exports = router;
