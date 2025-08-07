const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJWTSecret } = require('../utils/jwtSecret');

const socketAuth = async (socket, next) => {
  try {
    // Get token from auth header or query parameter
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token using the same secret system
    const { secret } = getJWTSecret();
    const decoded = jwt.verify(token, secret);
    
    // Get user from database (SQLite version)
    const user = User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Note: We don't track online status in SQLite for simplicity
    // This could be added later with a separate online_users table if needed
    
    // Attach user info to socket (SQLite uses id instead of _id)
    socket.userId = user.id;
    socket.username = user.username;
    socket.user = User.toJSON(user); // Remove password field

    console.log(`Socket authenticated for user: ${user.username} (${user.id})`);
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
