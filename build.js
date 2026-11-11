const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const entries = fs.readdirSync(rootDir);
for (const entry of entries) {
  if (entry === 'dist' || entry === 'node_modules' || entry === '.git' || entry === 'build.js') {
    continue;
  }
  const fullPath = path.join(rootDir, entry);
  copyRecursiveSync(fullPath, path.join(distDir, entry));
}

console.log('Build complete: static files mirrored to dist/');
