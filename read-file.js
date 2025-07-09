#!/usr/bin/env node
// read-file.js
// Usage: node read-file.js path/to/file
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node read-file.js <path/to/file>');
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(absPath, 'utf8');
  console.log(content);
} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
} 