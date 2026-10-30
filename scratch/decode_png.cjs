const fs = require('fs');
const zlib = require('zlib');

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  
  // Extract IDAT chunks
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  console.log(filePath, 'decompressed length:', decompressed.length, 'expected:', height * (1 + width * 4));
  
  // Let's sample corners and non-transparent pixels
  // Corner pixel:
  // row 0 filter byte is at index 0, pixel (0,0) is at index 1..4
  const r0 = decompressed[1], g0 = decompressed[2], b0 = decompressed[3], a0 = decompressed[4];
  console.log(filePath, 'corner (0,0) RGBA:', r0, g0, b0, a0);
  
  // Find unique colors with alpha > 0 and alpha == 0
  let transparentCount = 0;
  let yellowCount = 0;
  let blueCount = 0;
  
  // Quick scan without unfiltering (good enough to detect alpha bytes if mostly transparent or yellow)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const a = decompressed[px + 3];
      if (a === 0) transparentCount++;
    }
  }
  console.log(filePath, 'transparent pixels ratio:', (transparentCount / (width * height)).toFixed(2));
}

decodePng('public/sipvertise-logo-badge.png');
decodePng('public/sipvertise-logo-transparent.png');
decodePng('public/sipvertise-logo.png');
