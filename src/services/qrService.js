// Self-contained ISO/IEC 18004 QR Code generator (Byte mode, Error Correction M, Versions 1..10)
// Zero external dependencies for reliable offline & server builds.

const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255]);

const rsGeneratorPoly = (degree) => {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
};

const rsEncode = (data, ecLen) => {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Array(data.length + ecLen).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
};

// Version table for Error Correction Level M: [totalDataCodewords, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data, alignments]
const QR_VERSIONS_M = [
  null,
  [16, 10, 1, 16, 0, 0, []],
  [28, 16, 1, 28, 0, 0, [6, 18]],
  [44, 26, 1, 44, 0, 0, [6, 22]],
  [64, 18, 2, 32, 0, 0, [6, 26]],
  [86, 24, 2, 43, 0, 0, [6, 30]],
  [108, 16, 4, 27, 0, 0, [6, 34]],
  [124, 18, 4, 31, 0, 0, [6, 22, 38]],
  [154, 22, 2, 38, 2, 39, [6, 24, 42]],
  [182, 22, 3, 36, 2, 37, [6, 26, 46]],
  [216, 26, 4, 43, 1, 44, [6, 28, 50]]
];

const pickVersion = (byteLen) => {
  for (let v = 1; v < QR_VERSIONS_M.length; v++) {
    const countBits = v <= 9 ? 8 : 16;
    const totalBits = 4 + countBits + byteLen * 8;
    const maxBits = QR_VERSIONS_M[v][0] * 8;
    if (totalBits <= maxBits) return v;
  }
  return 10;
};

const encodeBytes = (text) => {
  const bytes = new TextEncoder().encode(String(text || ''));
  const version = pickVersion(bytes.length);
  const [totalData, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data] = QR_VERSIONS_M[version];
  const countBits = version <= 9 ? 8 : 16;
  const maxBytes = Math.floor((totalData * 8 - 4 - countBits) / 8);
  const clipped = bytes.slice(0, maxBytes);

  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(clipped.length, countBits);
  for (const b of clipped) pushBits(b, 8);

  const maxBits = totalData * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const pads = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(pads[padIdx % 2], 8);
    padIdx++;
  }

  const dataCodewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let val = 0;
    for (let b = 0; b < 8; b++) val = (val << 1) | bits[i + b];
    dataCodewords.push(val);
  }

  const blocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (let i = 0; i < g1Blocks; i++) {
    const slice = dataCodewords.slice(offset, offset + g1Data);
    offset += g1Data;
    blocks.push(slice);
    ecBlocks.push(rsEncode(slice, ecPerBlock));
  }
  for (let i = 0; i < g2Blocks; i++) {
    const slice = dataCodewords.slice(offset, offset + g2Data);
    offset += g2Data;
    blocks.push(slice);
    ecBlocks.push(rsEncode(slice, ecPerBlock));
  }

  const interleaved = [];
  const maxBlockLen = Math.max(g1Data, g2Data);
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < blocks[b].length) interleaved.push(blocks[b][i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      interleaved.push(ecBlocks[b][i]);
    }
  }

  return { version, codewords: interleaved };
};

const FORMAT_BITS_M = [
  0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0
];

const VERSION_INFO_BITS = {
  7: 0x07c94,
  8: 0x085bc,
  9: 0x09a99,
  10: 0x0a4d3
};

const isMaskDark = (mask, r, c) => {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return ((((r * c) % 2) + ((r * c) % 3)) % 2) === 0;
    case 7: return ((((r + c) % 2) + ((r * c) % 3)) % 2) === 0;
    default: return false;
  }
};

const buildMatrix = (version, codewords, maskPattern) => {
  const size = version * 4 + 17;
  const mat = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  const setModule = (r, c, dark) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    mat[r][c] = dark ? 1 : 0;
    reserved[r][c] = true;
  };

  const drawFinder = (r0, c0) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r < 0 || c < 0 || r >= size || c >= size) continue;
        const inBorder = dr === -1 || dr === 7 || dc === -1 || dc === 7;
        const inRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setModule(r, c, !inBorder && (inRing || inCore));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const alignCoords = QR_VERSIONS_M[version][6];
  for (const r0 of alignCoords) {
    for (const c0 of alignCoords) {
      if (reserved[r0][c0]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isDark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setModule(r0 + dr, c0 + dc, isDark);
        }
      }
    }
  }

  // Reserve format info + dark module
  setModule(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = true;
    if (!reserved[size - 1 - i][8]) reserved[size - 1 - i][8] = true;
  }

  // Reserve & write version info for V7+
  if (version >= 7 && VERSION_INFO_BITS[version]) {
    const vBits = VERSION_INFO_BITS[version];
    for (let i = 0; i < 18; i++) {
      const bit = Boolean((vBits >> i) & 1);
      const a = Math.floor(i / 3);
      const b = size - 11 + (i % 3);
      setModule(a, b, bit);
      setModule(b, a, bit);
    }
  }

  // Data bits placement
  const dataBits = [];
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) dataBits.push((cw >> i) & 1);
  }
  let bitIdx = 0;
  let dir = -1;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < size; step++) {
      const row = dir === -1 ? size - 1 - step : step;
      for (let dx = 0; dx < 2; dx++) {
        const c = col - dx;
        if (reserved[row][c]) continue;
        const bit = bitIdx < dataBits.length ? Boolean(dataBits[bitIdx++]) : false;
        const masked = isMaskDark(maskPattern, row, c) ? !bit : bit;
        mat[row][c] = masked ? 1 : 0;
      }
    }
    dir = -dir;
  }

  // Write format info
  const fmt = FORMAT_BITS_M[maskPattern];
  for (let i = 0; i < 15; i++) {
    const bit = ((fmt >> i) & 1) === 1;
    // vertical
    if (i < 6) mat[i][8] = bit ? 1 : 0;
    else if (i < 8) mat[i + 1][8] = bit ? 1 : 0;
    else mat[size - 15 + i][8] = bit ? 1 : 0;
    // horizontal
    if (i < 8) mat[8][size - 1 - i] = bit ? 1 : 0;
    else if (i < 9) mat[8][7] = bit ? 1 : 0;
    else mat[8][14 - i] = bit ? 1 : 0;
  }

  return mat;
};

const penaltyScore = (mat) => {
  const n = mat.length;
  let score = 0;
  // Rule 1: adjacent same-color runs
  for (let r = 0; r < n; r++) {
    let run = 1;
    for (let c = 1; c < n; c++) {
      if (mat[r][c] === mat[r][c - 1]) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) score += 3 + (run - 5);
  }
  for (let c = 0; c < n; c++) {
    let run = 1;
    for (let r = 1; r < n; r++) {
      if (mat[r][c] === mat[r - 1][c]) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) score += 3 + (run - 5);
  }
  // Rule 2: 2x2 blocks
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = mat[r][c];
      if (v === mat[r][c + 1] && v === mat[r + 1][c] && v === mat[r + 1][c + 1]) score += 3;
    }
  }
  return score;
};

export const generateQrMatrix = (text) => {
  const { version, codewords } = encodeBytes(text);
  let bestMat = null;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    const candidate = buildMatrix(version, codewords, m);
    const s = penaltyScore(candidate);
    if (s < bestScore) {
      bestScore = s;
      bestMat = candidate;
    }
  }
  return bestMat;
};

export const buildWorkerQrPayload = (worker) => {
  const empId = worker?.assignedWorkerId || worker?.id || '';
  const name = worker?.hr?.fullName || '';
  const ref = worker?.id || '';
  const portalUrl = `https://taskai.lloyds.in/onboarding/#process/${ref}`;
  return `${portalUrl}|${empId}|${name}`;
};

export const generateQrSvgDataUrl = (text, size = 160) => {
  const matrix = generateQrMatrix(text);
  const n = matrix.length;
  const quiet = 2;
  const total = n + quiet * 2;
  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1" fill="#0F172A"/>`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#FFFFFF"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
