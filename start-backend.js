#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ports to try for backend
const AVAILABLE_PORTS = [5001, 5000, 5002, 5003, 8000, 8001];

// Check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`lsof -ti:${port}`, (error, stdout) => {
      resolve(!stdout.trim()); // Port is available if no output
    });
  });
};

// Find available port
const findAvailablePort = async () => {
  for (const port of AVAILABLE_PORTS) {
    const available = await isPortAvailable(port);
    if (available) {
      console.log(`✅ Port ${port} is available`);
      return port;
    } else {
      console.log(`❌ Port ${port} is in use`);
    }
  }
  
  console.error('❌ No available ports found');
  process.exit(1);
};

// Update .env file with new port
const updateEnvPort = (port) => {
  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/PORT=\d+/, `PORT=${port}`);
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env file to use PORT=${port}`);
  }
};

// Start backend server
const startBackend = async () => {
  console.log('🔍 Finding available port for backend...');
  
  const port = await findAvailablePort();
  updateEnvPort(port);
  
  console.log(`🚀 Starting backend on port ${port}...`);
  
  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: { ...process.env, PORT: port }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error);
    process.exit(1);
  });
  
  backend.on('close', (code) => {
    console.log(`🔄 Backend process exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down backend...');
    backend.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\\n🛑 Shutting down backend...');
    backend.kill('SIGTERM');
  });
};

// Run if called directly
if (require.main === module) {
  startBackend().catch(console.error);
}

module.exports = { startBackend, findAvailablePort };
