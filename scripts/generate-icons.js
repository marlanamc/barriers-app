const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple icon with purple gradient background and a brain/barrier icon
async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">🧠</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .resize(size, size)
    .toBuffer();
}

async function generateIcons() {
  try {
    console.log('Generating PWA icons...');
    
    // Generate 192x192 icon
    const icon192 = await createIcon(192);
    fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
    console.log('✅ Created icon-192.png');
    
    // Generate 512x512 icon
    const icon512 = await createIcon(512);
    fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
    console.log('✅ Created icon-512.png');
    
    console.log('✨ Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

