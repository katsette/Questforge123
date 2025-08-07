const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: '🎲 Welcome to QuestForge!',
    status: 'Server running successfully',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - This welcome message',
      'GET /api/health - Health check',
      'POST /api/test/dice - Test dice rolling'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'QuestForge backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test dice rolling without database
app.post('/api/test/dice', (req, res) => {
  const { notation = '1d20', reason = 'Test roll' } = req.body;
  
  // Simple dice rolling logic
  const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;
  
  // Parse simple notation like "1d20", "2d6+3"
  const match = notation.match(/^(\d+)?d(\d+)(?:([+-])(\d+))?$/i);
  
  if (!match) {
    return res.status(400).json({
      error: 'Invalid dice notation',
      example: '1d20, 2d6+3, 4d4-1'
    });
  }
  
  const [, numDice = '1', dieSize, modifierSign, modifierValue] = match;
  const diceCount = parseInt(numDice);
  const sides = parseInt(dieSize);
  const modifier = modifierSign && modifierValue ? 
    parseInt(modifierSign + modifierValue) : 0;
  
  // Roll the dice
  const individual = [];
  for (let i = 0; i < diceCount; i++) {
    individual.push(rollDie(sides));
  }
  
  const subtotal = individual.reduce((sum, roll) => sum + roll, 0);
  const total = subtotal + modifier;
  
  res.json({
    success: true,
    notation,
    reason,
    individual,
    subtotal,
    modifier,
    total,
    timestamp: new Date().toISOString()
  });
});

// Test authentication endpoint (simplified)
app.post('/api/test/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password required'
    });
  }
  
  res.json({
    message: 'Authentication endpoint working',
    note: 'This is a test endpoint - full auth requires MongoDB',
    user: {
      username,
      id: 'test-user-id',
      profile: {
        displayName: username
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint was not found',
    availableEndpoints: ['/', '/api/health', '/api/test/dice', '/api/test/auth']
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎲 QuestForge test server running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log('🔍 Test endpoints:');
  console.log('  GET  / - Welcome message');
  console.log('  GET  /api/health - Health check');
  console.log('  POST /api/test/dice - Test dice rolling');
  console.log('  POST /api/test/auth - Test authentication');
  console.log('');
  console.log('📝 Note: Full features require MongoDB connection');
  console.log('   To set up MongoDB: docker run -d -p 27017:27017 mongo:5.0');
  console.log('   Or install MongoDB: https://docs.mongodb.com/manual/installation/');
});
