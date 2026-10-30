const fs = require('fs');

// Read PNG header and IHDR
function inspectPng(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25]; // 6 is RGBA, 2 is RGB, etc.
  console.log(filePath, { width, height, colorType });
}

inspectPng('public/sipvertise-logo-badge.png');
inspectPng('public/sipvertise-logo-transparent.png');
inspectPng('public/sipvertise-logo.png');
