const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const campaignRoutes = require('./routes/campaigns');
const characterRoutes = require('./routes/characters');
const chatRoutes = require('./routes/chat');
const diceRoutes = require('./routes/dice');
const aiRoutes = require('./routes/ai');

const socketAuth = require('./middleware/socketAuth');
const chatHandlers = require('./socket/chatHandlers');
const campaignHandlers = require('./socket/campaignHandlers');

// Validate critical environment variables
const validateEnvironment = () => {
  const required = {
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV
  };
  
  const missing = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('ℹ️ Please set the following environment variables:');
    missing.forEach(key => {
      console.error(`  - ${key}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🚫 Production deployment cannot continue without these variables');
      process.exit(1);
    } else {
      console.warn('⚠️  Development mode: using fallback values');
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'dev-fallback-secret-' + Date.now();
        console.warn('  Generated temporary JWT_SECRET for development');
      }
    }
  }
  
  console.log('✅ Environment variables validated');
};

// Validate environment before starting
validateEnvironment();

const app = express();
const server = http.createServer(app);

// CORS configuration
const getAllowedOrigins = () => {
  const origins = [];
  
  // Add environment-specified frontend URL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Add localhost for development
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:3001');
  }
  
  // For production, allow the same origin (since frontend is served by same server)
  if (process.env.NODE_ENV === 'production') {
    // Allow same-origin requests
    origins.push(null); // null means same origin
  }
  
  console.log('🌐 Allowed CORS origins:', origins);
  return origins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow same-origin requests (when origin is undefined/null)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(null)) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Database connection
connectDB();

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dice', diceRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve React frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  
  // Try multiple possible paths for the frontend build
  const possiblePaths = [
    path.join(__dirname, '../frontend/build'),                    // Local dev
    path.join(__dirname, '../../frontend/build'),                 // Alternative local
    path.join(process.cwd(), '../frontend/build'),                // Render from backend dir
    path.join('/opt/render/project/src/frontend/build'),          // Render absolute path
    path.join(process.cwd(), 'frontend/build'),                   // Root level
    path.join(__dirname, 'build')                                 // Build in backend
  ];
  
  let buildPath = null;
  
  console.log('🔍 Searching for frontend build in multiple locations:');
  for (const testPath of possiblePaths) {
    console.log(`  Testing: ${testPath}`);
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
      buildPath = testPath;
      console.log(`  ✅ Found frontend build at: ${buildPath}`);
      break;
    }
  }
  
  if (!buildPath) {
    console.error('❌ Frontend build folder not found in any expected location');
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
  }
  
  if (buildPath) {
    // Serve static files from React build
    app.use(express.static(buildPath));
    
    // Handle React Router - send all non-api requests to React app
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        const indexPath = path.join(buildPath, 'index.html');
        console.log(`📄 Serving index.html for route: ${req.path}`);
        res.sendFile(indexPath);
      }
    });
  } else {
    // Fallback when no build found
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        console.error('❌ Frontend build not available');
        res.status(503).json({
          error: 'Frontend Not Available',
          message: 'Frontend build files could not be found',
          suggestions: [
            'Ensure the build process completed successfully',
            'Check that frontend/build directory exists',
            'Verify NODE_ENV is set to production'
          ],
          environment: process.env.NODE_ENV,
          cwd: process.cwd(),
          dirname: __dirname
        });
      }
    });
  }
} else {
  // Development fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.json({
        message: 'QuestForge API Server',
        environment: 'development',
        note: 'Frontend should be served separately in development'
      });
    }
  });
}

// Socket.IO connection handling
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected: ${socket.id}`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Chat handlers
  chatHandlers(socket, io);
  
  // Campaign handlers
  campaignHandlers(socket, io);

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 QuestForge server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO server ready for connections`);
});
