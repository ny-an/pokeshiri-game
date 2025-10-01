const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/placeholder-logo.png');
  const outputDir = path.join(__dirname, '../public');

  // アイコンサイズの配列
  const sizes = [
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' }
  ];

  try {
    for (const { size, name } of sizes) {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`Generated ${name} (${size}x${size})`);
    }

    // ファビコンも生成
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
