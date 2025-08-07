const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database instance
let db;

const connectDB = () => {
  try {
    // Database path configuration for different environments
    let dbPath;
    if (process.env.NODE_ENV === 'production') {
      // In production (Render), use a path in the writable temp directory
      dbPath = process.env.DATABASE_PATH || '/tmp/questforge.db';
    } else {
      // In development, use local data directory
      dbPath = process.env.DATABASE_PATH || './data/questforge.db';
    }
    
    const dbDir = path.dirname(dbPath);
    console.log('🗄️  Database configuration:', { NODE_ENV: process.env.NODE_ENV, dbPath, dbDir });
    
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Connect to SQLite database
    console.log(`Connecting to database: ${dbPath}`);
    db = new Database(dbPath);
    
    console.log('📦 SQLite Connected');
    console.log(`🗄️  Database: ${dbPath}`);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Test the database connection
    const result = db.prepare('SELECT 1 as test').get();
    if (result.test !== 1) {
      throw new Error('Database connection test failed');
    }
    
    // Create tables
    initializeTables();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Closing SQLite database connection...');
      if (db) {
        db.close();
      }
      console.log('SQLite database connection closed');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('Closing SQLite database connection...');
      if (db) {
        db.close();
      }
      console.log('SQLite database connection closed');
      process.exit(0);
    });

    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

const initializeTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Campaigns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      dmId INTEGER NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dmId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      race TEXT,
      background TEXT,
      stats TEXT, -- JSON string for ability scores
      userId INTEGER NOT NULL,
      campaignId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE SET NULL
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      userId INTEGER NOT NULL,
      campaignId INTEGER NOT NULL,
      characterId INTEGER,
      isSystemMessage BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (characterId) REFERENCES characters(id) ON DELETE SET NULL
    )
  `);

  // Campaign members junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_members (
      campaignId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      role TEXT DEFAULT 'player',
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (campaignId, userId),
      FOREIGN KEY (campaignId) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables initialized');
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
