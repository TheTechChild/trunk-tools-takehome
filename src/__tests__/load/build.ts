import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Build the TypeScript files
console.info('Building TypeScript files...');
execSync('tsc', { stdio: 'inherit' });

// Rename the processor file to use .mjs extension
const distDir = path.join(__dirname, 'dist');
const processorJsPath = path.join(distDir, 'processor.js');
const processorMjsPath = path.join(distDir, 'processor.mjs');

if (fs.existsSync(processorJsPath)) {
  fs.renameSync(processorJsPath, processorMjsPath);
  console.info('Renamed processor.js to processor.mjs');
} else {
  console.error('Error: processor.js not found in dist directory');
  process.exit(1);
}

console.info('Build completed successfully');
