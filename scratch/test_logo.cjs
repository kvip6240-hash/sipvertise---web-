const fs = require('fs');

const b1 = fs.readFileSync('public/sipvertise-logo-badge.png');
const b2 = fs.readFileSync('public/sipvertise-logo-transparent.png');
const b3 = fs.readFileSync('public/sipvertise-logo.png');

console.log('badge size:', b1.length);
console.log('transparent size:', b2.length);
console.log('logo size:', b3.length);

const svg = fs.readFileSync('public/sipvertise-logo.svg', 'utf8');
const match = svg.match(/base64,([^"]+)/);
if (match) {
  const svgImgBuf = Buffer.from(match[1], 'base64');
  console.log('svg image size:', svgImgBuf.length);
  console.log('matches transparent.png?:', svgImgBuf.equals(b2));
  console.log('matches badge.png?:', svgImgBuf.equals(b1));
  console.log('matches logo.png?:', svgImgBuf.equals(b3));
}
