#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// The project root directory
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Starting Wingman AI (free-cluely)...');

// Run npm start in the project root
const child = spawn('npm', ['start'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start the app:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.log(`App process exited with code ${code}`);
  }
  process.exit(code);
});
