#!/usr/bin/env node

// Script to ensure npm is used instead of yarn
// This will help prevent package manager conflicts

console.log('🔧 Configuring project to use npm...');

// Check if yarn is being used
if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('yarn')) {
  console.error('❌ Yarn detected! This project requires npm.');
  console.log('Please run with npm instead:');
  console.log('  npm install');
  console.log('  npm start');
  console.log('  npm run build');
  process.exit(1);
}

// Check for yarn.lock in project root
const fs = require('fs');
const path = require('path');

const yarnLockPath = path.join(__dirname, 'yarn.lock');
if (fs.existsSync(yarnLockPath)) {
  console.log('⚠️  Found yarn.lock - removing to prevent conflicts...');
  fs.unlinkSync(yarnLockPath);
  console.log('✅ yarn.lock removed');
}

console.log('✅ Project configured for npm usage');
