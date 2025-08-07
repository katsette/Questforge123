#!/usr/bin/env node

// Simple start script that works with both npm and yarn
// This ensures the backend server starts correctly regardless of package manager

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting QuestForge backend server...');
console.log('📍 Current directory:', process.cwd());

// Change to backend directory and start the server
const backendPath = path.join(__dirname, 'backend');
console.log('🔧 Backend path:', backendPath);

const startServer = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
});

startServer.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

startServer.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});
