const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    // Get token from auth header or query parameter
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Set user online status
    user.isOnline = true;
    await user.save();

    // Attach user info to socket
    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.user = user;

    // Update last active
    await user.updateLastActive();

    console.log(`Socket authenticated for user: ${user.username} (${user._id})`);
    next();
    
  } catch (error) {
    console.error('Socket authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    return next(new Error('Authentication error: Server error'));
  }
};

module.exports = socketAuth;
