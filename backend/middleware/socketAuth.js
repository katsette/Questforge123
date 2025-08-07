const admin = require('firebase-admin');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.userId = decodedToken.uid;
    // Optionally, fetch user details from Firestore if needed for socket context
    // socket.user = await admin.firestore().collection('users').doc(decodedToken.uid).get();

    console.log(`Socket authenticated for user: ${socket.userId}`);
    next();
    
  } catch (error) {
    console.error('Socket authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return next(new Error('Authentication error: Token expired'));
    }
    
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return next(new Error('Authentication error: Invalid token'));
    }
    
    return next(new Error('Authentication error: Server error'));
  }
};

module.exports = socketAuth;