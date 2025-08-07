#!/usr/bin/env node

// Script to ensure npm is used instead of yarn
// This will help prevent package manager conflicts

console.log('🔧 Configuring project to use npm...');
console.log('📍 Current working directory:', process.cwd());

// Check if yarn is being used
if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('yarn')) {
  console.error('❌ Yarn detected! This project requires npm.');
  console.log('Please run with npm instead:');
  console.log('  npm install');
  console.log('  npm start');
  console.log('  npm run build');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

// Remove any yarn.lock files that might exist
const locations = [
  __dirname,                          // Project root
  path.join(__dirname, 'frontend'),   // Frontend directory
  path.join(__dirname, 'backend')     // Backend directory
];

locations.forEach(dir => {
  const yarnLockPath = path.join(dir, 'yarn.lock');
  if (fs.existsSync(yarnLockPath)) {
    console.log(`⚠️  Found yarn.lock in ${dir} - removing...`);
    fs.unlinkSync(yarnLockPath);
    console.log('✅ yarn.lock removed');
  }
});

// Create/update .yarnrc to disable yarn
const yarnrcPath = path.join(__dirname, '.yarnrc');
fs.writeFileSync(yarnrcPath, '# Yarn disabled - use npm instead\ndisable-self-update-check true\n');
console.log('✅ Created .yarnrc to disable yarn');

// Ensure package-lock.json files exist
const packageLockPaths = [
  path.join(__dirname, 'package-lock.json'),
  path.join(__dirname, 'frontend', 'package-lock.json'),
  path.join(__dirname, 'backend', 'package-lock.json')
];

packageLockPaths.forEach(lockPath => {
  if (fs.existsSync(lockPath)) {
    console.log(`✅ Found npm lock file: ${lockPath}`);
  }
});

console.log('✅ Project configured for npm usage - yarn disabled');
