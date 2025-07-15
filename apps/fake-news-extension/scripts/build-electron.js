import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy electron files to dist-electron
function copyElectronFiles() {
  const electronDir = path.join(__dirname, '../electron');
  const distElectronDir = path.join(__dirname, '../dist-electron');

  // Create dist-electron directory if it doesn't exist
  if (!fs.existsSync(distElectronDir)) {
    fs.mkdirSync(distElectronDir, { recursive: true });
  }

  // Copy main.js
  const mainSrc = path.join(electronDir, 'main.js');
  const mainDest = path.join(distElectronDir, 'main.js');
  fs.copyFileSync(mainSrc, mainDest);

  // Copy preload.js
  const preloadSrc = path.join(electronDir, 'preload.js');
  const preloadDest = path.join(distElectronDir, 'preload.js');
  fs.copyFileSync(preloadSrc, preloadDest);

  console.log('✅ Electron files copied to dist-electron/');
}

// Run the copy function
copyElectronFiles(); 