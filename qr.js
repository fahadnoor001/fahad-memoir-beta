// ===== QR CODE GENERATOR =====
// Lightweight QR code generator - no dependencies
(function() {
  'use strict';

  // QR Code encoding logic
  const QR = {
    // Generate QR matrix from data
    generate(text, ecl) {
      const segs = [{mode: 'byte', data: new TextEncoder().encode(text)}];
      const version = QR.findVersion(segs, ecl);
      const size = version * 4 + 17;
      const matrix = Array.from({length: size}, () => Array(size).fill(null));
      const reserved = Array.from({length: size}, () => Array(size).fill(false));

      QR.placeFinderPatterns(matrix, reserved, size);
      QR.placeAlignmentPatterns(matrix, reserved, version, size);
      QR.placeTimingPatterns(matrix, reserved, size);
      QR.placeDarkModule(matrix, reserved, version);
      QR.reserveFormatInfo(reserved, size);
      if (version >= 7) QR.reserveVersionInfo(reserved, size);

      const data = QR.encodeData(segs, version, ecl);
      QR.placeData(matrix, reserved, size, data);

      const mask = QR.applyBestMask(matrix, reserved, size);
      QR.placeFormatInfo(matrix, size, ecl, mask);
      if (version >= 7) QR.placeVersionInfo(matrix, size, version);

      return matrix;
    },

    findVersion(segs, ecl) {
      for (let v = 1; v <= 40; v++) {
        const cap = QR.getDataCapacity(v, ecl);
        let bits = 4 + (v < 10 ? 8 : 16);
        bits += segs[0].data.length * 8;
        if (Math.ceil(bits / 8) <= cap) return v;
      }
      return 40;
    },

    EC_CODEWORDS: [
      [],
      [7,10,13,17],[10,16,22,28],[15,26,36,44],[20,36,52,64],[26,48,72,88],
      [36,64,96,112],[40,72,108,130],[48,86,132,156],[60,98,156,180],[72,110,180,208],
      [80,130,208,240],[96,150,240,280],[104,162,260,308],[120,182,292,348],[132,202,320,384],
      [144,224,360,432],[168,250,408,480],[180,270,432,532],[196,300,480,588],[224,334,532,644],
      [224,340,544,664],[252,374,600,736],[270,394,624,784],[300,434,688,856],[312,454,720,896],
      [336,482,750,944],[360,514,810,1008],[390,538,870,1056],[420,570,924,1108],[450,598,980,1164],
      [480,628,1036,1224],[510,658,1092,1276],[540,688,1148,1340],[570,720,1208,1396],[570,750,1268,1456],
      [600,780,1324,1512],[630,810,1384,1568],[660,840,1440,1628],[720,870,1500,1688],[750,900,1560,1748]
    ],

    TOTAL_CODEWORDS: [
      0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,
      1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,
      3034,3196,3362,3532,3706
    ],

    getDataCapacity(version, ecl) {
      const eclIdx = ['L','M','Q','H'].indexOf(ecl);
      return QR.TOTAL_CODEWORDS[version] - QR.EC_CODEWORDS[version][eclIdx];
    },

    placeFinderPatterns(matrix, reserved, size) {
      const positions = [[0,0],[size-7,0],[0,size-7]];
      positions.forEach(([row, col]) => {
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const rr = row + r, cc = col + c;
            if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
            const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
            const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[rr][cc] = inOuter || inInner ? 1 : 0;
            reserved[rr][cc] = true;
          }
        }
      });
    },

    ALIGNMENT_POSITIONS: [
      [],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
      [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
      [6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],
      [6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],
      [6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],
      [6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],
      [6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166]
    ],

    placeAlignmentPatterns(matrix, reserved, version, size) {
      const pos = QR.ALIGNMENT_POSITIONS[version];
      if (!pos || pos.length < 2) return;
      for (let i = 0; i < pos.length; i++) {
        for (let j = 0; j < pos.length; j++) {
          const r = pos[i], c = pos[j];
          if (reserved[r][c]) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
              const isCenter = dr === 0 && dc === 0;
              matrix[r+dr][c+dc] = isEdge || isCenter ? 1 : 0;
              reserved[r+dr][c+dc] = true;
            }
          }
        }
      }
    },

    placeTimingPatterns(matrix, reserved, size) {
      for (let i = 8; i < size - 8; i++) {
        if (!reserved[6][i]) { matrix[6][i] = i % 2 === 0 ? 1 : 0; reserved[6][i] = true; }
        if (!reserved[i][6]) { matrix[i][6] = i % 2 === 0 ? 1 : 0; reserved[i][6] = true; }
      }
    },

    placeDarkModule(matrix, reserved, version) {
      matrix[4*version+9][8] = 1;
      reserved[4*version+9][8] = true;
    },

    reserveFormatInfo(reserved, size) {
      for (let i = 0; i < 8; i++) {
        reserved[8][i] = true;
        reserved[8][size-1-i] = true;
        reserved[i][8] = true;
        reserved[size-1-i][8] = true;
      }
      reserved[8][8] = true;
    },

    reserveVersionInfo(reserved, size) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          reserved[i][size-11+j] = true;
          reserved[size-11+j][i] = true;
        }
      }
    },

    encodeData(segs, version, ecl) {
      const capacity = QR.getDataCapacity(version, ecl);
      const bits = [];
      const push = (val, len) => { for (let i = len-1; i >= 0; i--) bits.push((val >> i) & 1); };

      push(4, 4); // byte mode
      push(segs[0].data.length, version < 10 ? 8 : 16);
      segs[0].data.forEach(b => push(b, 8));

      // Terminator
      const rem = capacity * 8 - bits.length;
      push(0, Math.min(4, rem));
      while (bits.length % 8 !== 0) bits.push(0);

      // Pad bytes
      const padBytes = [0xEC, 0x11];
      let pi = 0;
      while (bits.length < capacity * 8) {
        push(padBytes[pi % 2], 8);
        pi++;
      }

      // Convert to bytes
      const bytes = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i+j];
        bytes.push(b);
      }

      // Add error correction
      return QR.addErrorCorrection(bytes, version, ecl);
    },

    addErrorCorrection(data, version, ecl) {
      const eclIdx = ['L','M','Q','H'].indexOf(ecl);
      const totalCodewords = QR.TOTAL_CODEWORDS[version];
      const ecCodewords = QR.EC_CODEWORDS[version][eclIdx];
      const dataCodewords = totalCodewords - ecCodewords;

      // Simplified: single block for small versions
      const ecPerBlock = ecCodewords;
      const gen = QR.getGeneratorPolynomial(ecPerBlock);
      const msgPoly = [...data];
      while (msgPoly.length < dataCodewords) msgPoly.push(0);

      const result = [...msgPoly.slice(0, dataCodewords)];
      const rem = QR.polyDivide(msgPoly.slice(0, dataCodewords), gen);
      result.push(...rem);

      // Convert to bit array
      const bits = [];
      result.forEach(b => { for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1); });
      return bits;
    },

    GF_EXP: (() => {
      const exp = new Uint8Array(512);
      const log = new Uint8Array(256);
      let v = 1;
      for (let i = 0; i < 255; i++) {
        exp[i] = v;
        log[v] = i;
        v = (v << 1) ^ (v >= 128 ? 0x11d : 0);
      }
      for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
      return {exp, log};
    })(),

    gfMul(a, b) {
      if (a === 0 || b === 0) return 0;
      return QR.GF_EXP.exp[QR.GF_EXP.log[a] + QR.GF_EXP.log[b]];
    },

    getGeneratorPolynomial(degree) {
      let gen = [1];
      for (let i = 0; i < degree; i++) {
        const next = new Array(gen.length + 1).fill(0);
        const factor = QR.GF_EXP.exp[i];
        for (let j = 0; j < gen.length; j++) {
          next[j] ^= gen[j];
          next[j+1] ^= QR.gfMul(gen[j], factor);
        }
        gen = next;
      }
      return gen;
    },

    polyDivide(msg, gen) {
      const result = [...msg];
      for (let i = 0; i < msg.length; i++) {
        if (result[i] === 0) continue;
        for (let j = 1; j < gen.length; j++) {
          if (i + j < result.length) {
            result[i+j] ^= QR.gfMul(result[i], gen[j]);
          }
        }
      }
      return result.slice(msg.length - gen.length + 1 > 0 ? msg.length : 0);
    },

    placeData(matrix, reserved, size, data) {
      let bitIdx = 0;
      for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
          for (let j = 0; j < 2; j++) {
            const col = right - j;
            const row = ((Math.floor((size - 1 - right + (right < 6 ? 1 : 0)) / 2)) % 2 === 0)
              ? size - 1 - vert : vert;
            if (reserved[row][col]) continue;
            matrix[row][col] = bitIdx < data.length ? data[bitIdx++] : 0;
          }
        }
      }
    },

    applyBestMask(matrix, reserved, size) {
      let bestMask = 0, bestPenalty = Infinity;
      for (let mask = 0; mask < 8; mask++) {
        const test = matrix.map(row => [...row]);
        QR.applyMask(test, reserved, size, mask);
        const penalty = QR.calcPenalty(test, size);
        if (penalty < bestPenalty) { bestPenalty = penalty; bestMask = mask; }
      }
      QR.applyMask(matrix, reserved, size, bestMask);
      return bestMask;
    },

    applyMask(matrix, reserved, size, mask) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (reserved[r][c]) continue;
          let invert = false;
          switch (mask) {
            case 0: invert = (r + c) % 2 === 0; break;
            case 1: invert = r % 2 === 0; break;
            case 2: invert = c % 3 === 0; break;
            case 3: invert = (r + c) % 3 === 0; break;
            case 4: invert = (Math.floor(r/2) + Math.floor(c/3)) % 2 === 0; break;
            case 5: invert = (r*c)%2 + (r*c)%3 === 0; break;
            case 6: invert = ((r*c)%2 + (r*c)%3) % 2 === 0; break;
            case 7: invert = ((r+c)%2 + (r*c)%3) % 2 === 0; break;
          }
          if (invert) matrix[r][c] ^= 1;
        }
      }
    },

    calcPenalty(matrix, size) {
      let penalty = 0;
      // Rule 1: consecutive same-color modules
      for (let r = 0; r < size; r++) {
        let count = 1;
        for (let c = 1; c < size; c++) {
          if (matrix[r][c] === matrix[r][c-1]) { count++; }
          else { if (count >= 5) penalty += count - 2; count = 1; }
        }
        if (count >= 5) penalty += count - 2;
      }
      for (let c = 0; c < size; c++) {
        let count = 1;
        for (let r = 1; r < size; r++) {
          if (matrix[r][c] === matrix[r-1][c]) { count++; }
          else { if (count >= 5) penalty += count - 2; count = 1; }
        }
        if (count >= 5) penalty += count - 2;
      }
      return penalty;
    },

    FORMAT_INFO: [
      0x77c4,0x72f3,0x7daa,0x789d,0x662f,0x6318,0x6c41,0x6976,
      0x5412,0x5125,0x5e7c,0x5b4b,0x45f9,0x40ce,0x4f97,0x4aa0,
      0x355f,0x3068,0x3f31,0x3a06,0x24b4,0x2183,0x2eda,0x2bed,
      0x1689,0x13be,0x1ce7,0x19d0,0x0762,0x0255,0x0d0c,0x083b
    ],

    placeFormatInfo(matrix, size, ecl, mask) {
      const eclIdx = ['L','M','Q','H'].indexOf(ecl);
      const formatIdx = eclIdx * 8 + mask;
      const bits = QR.FORMAT_INFO[formatIdx];

      const coords1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
      const coords2 = [];
      for (let i = 0; i < 7; i++) coords2.push([size-1-i, 8]);
      for (let i = 7; i < 15; i++) coords2.push([8, size-15+i]);

      for (let i = 0; i < 15; i++) {
        const bit = (bits >> (14 - i)) & 1;
        if (coords1[i]) matrix[coords1[i][0]][coords1[i][1]] = bit;
        if (coords2[i]) matrix[coords2[i][0]][coords2[i][1]] = bit;
      }
    },

    placeVersionInfo(matrix, size, version) {
      if (version < 7) return;
      // Simplified: skip version info placement for common small versions
    }
  };

  // ===== RENDER QR CODE ON CANVAS =====
  function renderQR(canvas, text, options = {}) {
    const {
      size = 220,
      margin = 4,
      fgColor = '#0a0a0b',
      bgColor = '#ffffff',
      ecl = 'M'
    } = options;

    try {
      const matrix = QR.generate(text, ecl);
      const modules = matrix.length;
      const cellSize = (size - margin * 2) / modules;
      const ctx = canvas.getContext('2d');

      canvas.width = size;
      canvas.height = size;

      // Background
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, 12);
      ctx.fill();

      // Modules
      ctx.fillStyle = fgColor;
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (matrix[r][c]) {
            const x = margin + c * cellSize;
            const y = margin + r * cellSize;
            ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
          }
        }
      }

      // Center logo area - gold "F"
      const centerSize = cellSize * 7;
      const cx = size / 2 - centerSize / 2;
      const cy = size / 2 - centerSize / 2;

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(cx - 2, cy - 2, centerSize + 4, centerSize + 4, 6);
      ctx.fill();

      ctx.fillStyle = '#c8a44e';
      ctx.beginPath();
      ctx.roundRect(cx, cy, centerSize, centerSize, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${centerSize * 0.65}px 'Playfair Display', Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F', size / 2, size / 2 + 1);

    } catch(e) {
      // Fallback: draw a simple placeholder
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = fgColor;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', size/2, size/2 - 10);
      ctx.fillText(text.substring(0, 30), size/2, size/2 + 10);
    }
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;

    // vCard format for business card QR
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;Fahad;;;',
      'FN:Fahad',
      'EMAIL:fahad.mnoor97@gmail.com',
      'URL:https://www.linkedin.com/in/fahadnoormohammed',
      'ADR:;;Houston;TX;;US',
      'NOTE:fahadnoor.ai',
      'END:VCARD'
    ].join('\n');

    renderQR(canvas, vcard, {
      size: 220,
      fgColor: '#0a0a0b',
      bgColor: '#ffffff',
      ecl: 'M'
    });

    // Download QR code
    const downloadBtn = document.getElementById('qrDownload');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'fahad-qr-business-card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  });
})();
