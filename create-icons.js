// Simple script to create placeholder icons using data URLs
// These will work but for production you should use proper PNG files

const fs = require('fs');
const path = require('path');

// Create a simple PNG data (1x1 transparent pixel) and scale it
// For a real extension, use proper icon design tools or the HTML generator

function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <line x1="${size * 0.3}" y1="${size * 0.7}" x2="${size * 0.7}" y2="${size * 0.3}"
        stroke="white" stroke-width="${size * 0.08}" stroke-linecap="round"/>
  <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.1}" fill="rgba(251, 191, 36, 0.8)"/>
  <line x1="${size * 0.2}" y1="${size * 0.8}" x2="${size * 0.8}" y2="${size * 0.8}"
        stroke="rgba(251, 191, 36, 0.5)" stroke-width="${size * 0.15}" stroke-linecap="round"/>
  <line x1="${size * 0.675}" y1="${size * 0.675}" x2="${size * 0.825}" y2="${size * 0.825}"
        stroke="#ef4444" stroke-width="${size * 0.06}" stroke-linecap="round"/>
  <line x1="${size * 0.825}" y1="${size * 0.675}" x2="${size * 0.675}" y2="${size * 0.825}"
        stroke="#ef4444" stroke-width="${size * 0.06}" stroke-linecap="round"/>
</svg>`;
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Create SVG files that Chrome can use
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\nSVG icons created! Note: Chrome extensions work best with PNG files.');
console.log('To create PNG files:');
console.log('1. Open generate-icons.html in your browser');
console.log('2. Right-click each canvas and save as PNG');
console.log('3. Save them in the icons/ folder with names: icon16.png, icon48.png, icon128.png');
