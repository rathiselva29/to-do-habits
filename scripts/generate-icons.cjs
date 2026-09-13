const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG builder using Node built-in zlib
function createPNG(width, height, drawPixel) {
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)) >>> 0;
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter 0
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw habit tracker grid icon
function habitIconPainter(maskable = false) {
  return function(x, y, w, h) {
    const u = x / w;
    const v = y / h;

    // Background: indigo gradient
    const bgR = Math.floor(79 + (99 - 79) * v);
    const bgG = Math.floor(70 + (102 - 70) * v);
    const bgB = Math.floor(229 + (241 - 229) * v);

    // Padding for maskable safe zone
    const pad = maskable ? 0.20 : 0.12;
    const innerW = 1 - 2 * pad;
    const innerH = 1 - 2 * pad;

    if (u < pad || u > 1 - pad || v < pad || v > 1 - pad) {
      return [bgR, bgG, bgB, 255];
    }

    // Inside habit grid (3x3 blocks)
    const relX = (u - pad) / innerW; // 0..1
    const relY = (v - pad) / innerH; // 0..1

    const col = Math.floor(relX * 3);
    const row = Math.floor(relY * 3);
    const inColX = (relX * 3) % 1;
    const inRowY = (relY * 3) % 1;

    const gap = 0.15;
    if (inColX < gap || inColX > 1 - gap || inRowY < gap || inRowY > 1 - gap) {
      return [bgR, bgG, bgB, 255];
    }

    // Tile colors: checked green tiles vs uncompleted
    const isChecked = (row === 0 && col >= 1) || (row === 1 && col === 0);
    if (isChecked) {
      // Vibrant green tile
      return [110, 192, 64, 255];
    } else {
      // Light soft tile
      return [160, 218, 90, 255];
    }
  };
}

const publicDir = path.resolve(__dirname, '../public');

// Generate 192x192
const buf192 = createPNG(192, 192, habitIconPainter(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);

// Generate 512x512
const buf512 = createPNG(512, 512, habitIconPainter(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);

// Generate maskable 512x512
const bufMaskable = createPNG(512, 512, habitIconPainter(true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), bufMaskable);

// Generate apple-touch-icon 180x180
const bufApple = createPNG(180, 180, habitIconPainter(false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), bufApple);

console.log('Successfully generated PWA icon assets in /public');
