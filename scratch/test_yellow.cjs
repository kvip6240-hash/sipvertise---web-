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

// Test color distance from background yellow rgb(255, 208, 0)
// Let's sample pixels that are pure yellow:
let pureYellow = 0;
for (let i = 0; i < badge.pixels.length; i += 4) {
  const r = badge.pixels[i], g = badge.pixels[i+1], b = badge.pixels[i+2];
  if (r === 255 && g === 208 && b === 0) pureYellow++;
}
console.log('pure yellow count:', pureYellow, 'out of', badge.width * badge.height, (pureYellow / (badge.width * badge.height) * 100).toFixed(1) + '%');
