const fs = require('fs');
const zlib = require('zlib');

// CRC32 table for PNG chunk checksums
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function encodePng(width, height, rgbaPixels) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: width, height, bit depth (8), color type (6 = RGBA), compression (0), filter (0), interlace (0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each line
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;
  const stride = width * 4;

  for (let y = 0; y < height; y++) {
    rawData[dstOffset++] = 0; // Filter 0 (None)
    rgbaPixels.copy(rawData, dstOffset, srcOffset, srcOffset + stride);
    dstOffset += stride;
    srcOffset += stride;
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function unfilterPng(buf) {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);

  let rawPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;

    for (let x = 0; x < stride; x++) {
      const b = raw[rawPos++];
      const left = x >= bpp ? pixels[rowStart + x - bpp] : 0;
      const up = y > 0 ? pixels[prevRowStart + x] : 0;
      const upLeft = (y > 0 && x >= bpp) ? pixels[prevRowStart + x - bpp] : 0;

      let val = 0;
      switch (filter) {
        case 0: val = b; break;
        case 1: val = (b + left) & 0xff; break;
        case 2: val = (b + up) & 0xff; break;
        case 3: val = (b + Math.floor((left + up) / 2)) & 0xff; break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          let pr = pa <= pb && pa <= pc ? left : (pb <= pc ? up : upLeft);
          val = (b + pr) & 0xff;
          break;
        }
      }
      pixels[rowStart + x] = val;
    }
  }
  return { width, height, pixels };
}

// Perform exact de-matting on sipvertise-logo-badge.png
const src = unfilterPng(fs.readFileSync('public/sipvertise-logo-badge.png'));
const outPixels = Buffer.alloc(src.width * src.height * 4);

// Background yellow color
const bgR = 255, bgG = 208, bgB = 0;

for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < src.width; x++) {
    const i = (y * src.width + x) * 4;
    const r = src.pixels[i];
    const g = src.pixels[i + 1];
    const b = src.pixels[i + 2];

    // Check color difference from pure yellow
    const dr = Math.abs(r - bgR);
    const dg = Math.abs(g - bgG);
    const db = Math.abs(b - bgB);
    const totalDiff = dr + dg + db;

    if (totalDiff <= 3) {
      // 100% background yellow -> completely transparent
      outPixels[i] = 0;
      outPixels[i + 1] = 0;
      outPixels[i + 2] = 0;
      outPixels[i + 3] = 0;
    } else {
      // Calculate alpha based on color distance from yellow
      // In yellow, b is 0, while in blue letters b is 150-223.
      // In yellow, r is 255, while in blue letters r is 0-60.
      // Foreground fraction:
      const alphaR = (255 - r) / 255;
      const alphaB = Math.min(1, b / 160);
      let alpha = Math.max(alphaR, alphaB);

      // Smooth step near threshold
      if (alpha < 0.08) {
        alpha = 0;
      } else if (alpha > 0.95) {
        alpha = 1.0;
      }

      if (alpha <= 0) {
        outPixels[i] = 0;
        outPixels[i + 1] = 0;
        outPixels[i + 2] = 0;
        outPixels[i + 3] = 0;
      } else if (alpha >= 1.0) {
        // Pure letter pixel - keep as is
        outPixels[i] = r;
        outPixels[i + 1] = g;
        outPixels[i + 2] = b;
        outPixels[i + 3] = 255;
      } else {
        // Un-matting formula: C_fg = (C - (1 - a) * C_bg) / a
        const fgR = Math.min(255, Math.max(0, Math.round((r - (1 - alpha) * bgR) / alpha)));
        const fgG = Math.min(255, Math.max(0, Math.round((g - (1 - alpha) * bgG) / alpha)));
        const fgB = Math.min(255, Math.max(0, Math.round((b - (1 - alpha) * bgB) / alpha)));
        const aByte = Math.min(255, Math.max(0, Math.round(alpha * 255)));

        outPixels[i] = fgR;
        outPixels[i + 1] = fgG;
        outPixels[i + 2] = fgB;
        outPixels[i + 3] = aByte;
      }
    }
  }
}

// Generate new transparent PNG
const pngBuffer = encodePng(src.width, src.height, outPixels);
fs.writeFileSync('public/sipvertise-logo-transparent.png', pngBuffer);
fs.writeFileSync('public/sipvertise-logo-badge.png', pngBuffer);
fs.writeFileSync('public/sipvertise-logo.png', pngBuffer);

// Also generate SVG without yellow rect
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1116 284" width="100%" height="100%" role="img" aria-label="Sipvertise">
  <image href="data:image/png;base64,${pngBuffer.toString('base64')}" width="1116" height="284"/>
</svg>
`;
fs.writeFileSync('public/sipvertise-logo.svg', svgContent, 'utf8');

console.log('Successfully generated transparent logo in all formats! Size:', pngBuffer.length);
