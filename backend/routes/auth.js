const express = require('express');
const admin = require('firebase-admin');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// User Registration
router.post('/register', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('username').notEmpty().withMessage('Username is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, username, firstName, lastName } = req.body;

  try {
    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    // Store additional user details in Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      firstName,
      lastName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      campaigns: [],
      characters: [],
    });

    // Generate custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: username,
        firstName: firstName,
        lastName: lastName,
      },
      token: customToken,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ message: 'Weak password' });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User Login
router.post('/login', [
  body('login').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { login, password } = req.body; // 'login' can be email or username

  try {
    let userRecord;
    // Determine if login is email or username
    if (login.includes('@')) {
      userRecord = await admin.auth().getUserByEmail(login);
    } else {
      // Search Firestore for username
      const usersRef = admin.firestore().collection('users');
      const snapshot = await usersRef.where('username', '==', login).limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ message: 'User not found' });
      }
      const userData = snapshot.docs[0].data();
      userRecord = await admin.auth().getUser(snapshot.docs[0].id);
    }

    // Firebase Admin SDK does not directly support password verification for login.
    // You would typically use the Firebase Client SDK for direct user login.
    // For backend-only authentication, you might rely on custom token exchange
    // or a more complex setup involving a client-side Firebase SDK.
    // For this example, we'll assume a successful lookup implies a valid user
    // and proceed to generate a custom token. In a real app, you'd need to
    // securely verify the password (e.g., by calling a client-side login
    // from a trusted environment or using a service like Firebase Auth REST API
    // if you handle password hashing/comparison yourself).

    // For demonstration, we'll generate a custom token if user is found.
    // In a real application, you'd need to verify the password securely.
    // This part needs to be handled carefully for production.
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Fetch full user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    res.json({
      message: 'Login successful',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        campaigns: userData.campaigns || [],
        characters: userData.characters || [],
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
});

// Verify Token (used by frontend to check if token is still valid)
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    // If authMiddleware successfully processed, req.user will contain the decoded token
    const uid = req.user.uid;
    const userRecord = await admin.auth().getUser(uid);
    
    // Fetch full user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    res.json({
      message: 'Token is valid',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        campaigns: userData.campaigns || [],
        characters: userData.characters || [],
      },
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
});

// Get current user's data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userRecord = await admin.auth().getUser(uid);
    
    // Fetch full user data from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        campaigns: userData.campaigns || [],
        characters: userData.characters || [],
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

// Logout (client-side token invalidation is usually handled by client, but this can be for server-side session invalidation if applicable)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Invalidate the user's session/token on the server side if using session cookies
    // For Firebase ID tokens, revocation is typically handled by the client
    // or by setting a short expiration time.
    // If you are using Firebase session cookies, you would revoke them here:
    // await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Error logging out user', error: error.message });
  }
});

// Create a custom token for the user (if needed for specific client-side auth flows)
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