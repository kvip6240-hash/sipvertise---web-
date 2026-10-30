const fs = require('fs');
const zlib = require('zlib');

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

const badge = unfilterPng(fs.readFileSync('public/sipvertise-logo-badge.png'));

const edgeSamples = [];
for (let y = 1; y < badge.height - 1; y++) {
  for (let x = 1; x < badge.width - 1; x++) {
    const idx = (y * badge.width + x) * 4;
    const r = badge.pixels[idx], g = badge.pixels[idx+1], b = badge.pixels[idx+2];
    if (r === 255 && g === 208 && b === 0) continue;
    
    // Check if any neighbor is pure yellow
    let nearYellow = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nidx = ((y + dy) * badge.width + (x + dx)) * 4;
        if (badge.pixels[nidx] === 255 && badge.pixels[nidx+1] === 208 && badge.pixels[nidx+2] === 0) {
          nearYellow = true;
          break;
        }
      }
      if (nearYellow) break;
    }
    if (nearYellow && edgeSamples.length < 20) {
      edgeSamples.push({ x, y, r, g, b });
    }
  }
}
console.log('edge samples:', edgeSamples);
