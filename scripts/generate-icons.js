const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../public/wxcopilot.jpg');
const OUTPUT_DIR = path.join(__dirname, '../public');

const ICONS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

async function generateIcons() {
  console.log('Generating PWA icons from:', SOURCE_IMAGE);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const icon of ICONS) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);
    
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 7, g: 13, b: 21, alpha: 1 } // #070d15 - matches logo background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('\nAll icons generated successfully!');
  console.log('\nDon\'t forget to update your manifest.json and layout.tsx if needed.');
}

generateIcons().catch(console.error);


