/**
 * generate-fax-audio.js
 *
 * Generates the Somnatek fax line audio file:
 *   1. ~4 seconds of CNG tone (1100 Hz, standard fax calling tone, 0.5s on / 3s off cadence)
 *   2. ~2 seconds of CED tone (2100 Hz, answering tone, continuous)
 *   3. ~1 second of V.21 preamble noise (broadband burst, simulates handshake attempt)
 *   4. Silence ~0.5s — the "failure" moment
 *   5. Morse code for "413" at 15 WPM in 700 Hz tone
 *   6. Trailing silence 1s
 *
 * Output: assets/audio/somnatek-fax-line.wav
 * Format: 8000 Hz, mono, 16-bit PCM — required by Amazon Connect.
 *
 * Usage:
 *   node scripts/generate-fax-audio.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE   = 8000;
const BIT_DEPTH     = 16;
const MAX_AMPLITUDE = 32767 * 0.7; // 70% max to avoid clipping

/**
 * Generates a mono 16-bit PCM sine wave buffer.
 * @param {number} freq      - Frequency in Hz (0 for silence).
 * @param {number} durationS - Duration in seconds.
 * @param {number} amplitude - Peak amplitude (0–32767).
 * @returns {Int16Array}
 */
function sineWave(freq, durationS, amplitude = MAX_AMPLITUDE) {
  const numSamples = Math.round(SAMPLE_RATE * durationS);
  const buf = new Int16Array(numSamples);
  if (freq === 0) return buf; // silence
  for (let i = 0; i < numSamples; i++) {
    buf[i] = Math.round(amplitude * Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE));
  }
  return buf;
}

/**
 * Generates broadband noise — used to simulate V.21 handshake preamble.
 * @param {number} durationS
 * @param {number} amplitude
 * @returns {Int16Array}
 */
function noise(durationS, amplitude = MAX_AMPLITUDE * 0.5) {
  const numSamples = Math.round(SAMPLE_RATE * durationS);
  const buf = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    buf[i] = Math.round((Math.random() * 2 - 1) * amplitude);
  }
  return buf;
}

/**
 * Concatenates multiple Int16Array segments into one.
 * @param {...Int16Array} segments
 * @returns {Int16Array}
 */
function concat(...segments) {
  const total = segments.reduce((n, s) => n + s.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const seg of segments) {
    out.set(seg, offset);
    offset += seg.length;
  }
  return out;
}

/**
 * Applies a short linear fade-in and fade-out to avoid clicks.
 * @param {Int16Array} buf
 * @param {number} fadeSamples - Number of samples to fade at each end.
 * @returns {Int16Array}
 */
function fade(buf, fadeSamples = 80) {
  const out = new Int16Array(buf);
  for (let i = 0; i < fadeSamples && i < out.length; i++) {
    const f = i / fadeSamples;
    out[i] = Math.round(out[i] * f);
    out[out.length - 1 - i] = Math.round(out[out.length - 1 - i] * f);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Morse code definition — ITU standard
// ---------------------------------------------------------------------------

const MORSE = {
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
  'A': '.-',    'B': '-...', 'C': '-.-.', 'D': '-..',
  'E': '.',     'F': '..-.', 'G': '--.',  'H': '....',
  'I': '..',    'J': '.---', 'K': '-.-',  'L': '.-..',
  'M': '--',    'N': '-.',   'O': '---',  'P': '.--.',
  'Q': '--.-',  'R': '.-.',  'S': '...',  'T': '-',
  'U': '..-',   'V': '...-', 'W': '.--',  'X': '-..-',
  'Y': '-.--',  'Z': '--..',
};

/**
 * Encodes a string into an Int16Array of morse code audio.
 * @param {string}  text      - Text to encode (letters and digits only).
 * @param {number}  wpm       - Words per minute (PARIS standard).
 * @param {number}  freq      - Tone frequency in Hz.
 * @param {number}  amplitude
 * @returns {Int16Array}
 */
function morseAudio(text, wpm = 15, freq = 700, amplitude = MAX_AMPLITUDE) {
  // At 15 WPM, one dot = 1200/wpm milliseconds
  const dotMs     = 1200 / wpm;
  const dotS      = dotMs / 1000;
  const dashS     = dotS * 3;
  const symbolGapS = dotS;       // gap between dots/dashes within a character
  const charGapS   = dotS * 3;  // gap between characters
  const wordGapS   = dotS * 7;  // gap between words

  const segments = [];

  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci].toUpperCase();
    if (ch === ' ') {
      segments.push(sineWave(0, wordGapS));
      continue;
    }
    const code = MORSE[ch];
    if (!code) continue;

    for (let si = 0; si < code.length; si++) {
      const sym = code[si];
      const toneSeg = sym === '.'
        ? fade(sineWave(freq, dotS, amplitude))
        : fade(sineWave(freq, dashS, amplitude));
      segments.push(toneSeg);
      // gap between symbols (not after the last one)
      if (si < code.length - 1) {
        segments.push(sineWave(0, symbolGapS));
      }
    }
    // gap between characters (not after the last one)
    if (ci < text.length - 1 && text[ci + 1] !== ' ') {
      segments.push(sineWave(0, charGapS));
    }
  }

  return concat(...segments);
}

// ---------------------------------------------------------------------------
// Build the audio sequence
// ---------------------------------------------------------------------------

// CNG tone: 1100 Hz, 0.5s on / 3.0s off, repeat twice (one full fax ring cycle)
const cng = concat(
  fade(sineWave(1100, 0.5)),
  sineWave(0, 3.0),
  fade(sineWave(1100, 0.5)),
  sineWave(0, 1.0),
);

// CED tone: 2100 Hz continuous 1.8s (answering)
const ced = fade(sineWave(2100, 1.8));

// V.21 preamble noise burst — broadband, 0.9s
const preamble = noise(0.9);

// Failed connection silence
const failSilence = sineWave(0, 0.6);

// Morse: "413"
const morseSegment = morseAudio('413', 15, 700);

// Trailing silence
const trailSilence = sineWave(0, 1.2);

const pcm = concat(cng, ced, preamble, failSilence, morseSegment, trailSilence);

// ---------------------------------------------------------------------------
// Write WAV file
// ---------------------------------------------------------------------------

const numSamples   = pcm.length;
const byteRate     = SAMPLE_RATE * 1 * (BIT_DEPTH / 8);
const blockAlign   = 1 * (BIT_DEPTH / 8);
const dataBytes    = numSamples * blockAlign;
const headerBytes  = 44;
const totalBytes   = headerBytes + dataBytes;

const buf = Buffer.alloc(totalBytes);
let pos = 0;

// RIFF header
buf.write('RIFF', pos); pos += 4;
buf.writeUInt32LE(totalBytes - 8, pos); pos += 4;
buf.write('WAVE', pos); pos += 4;

// fmt chunk
buf.write('fmt ', pos); pos += 4;
buf.writeUInt32LE(16, pos); pos += 4;           // PCM chunk size
buf.writeUInt16LE(1, pos); pos += 2;            // AudioFormat = PCM
buf.writeUInt16LE(1, pos); pos += 2;            // NumChannels = mono
buf.writeUInt32LE(SAMPLE_RATE, pos); pos += 4;  // SampleRate
buf.writeUInt32LE(byteRate, pos); pos += 4;     // ByteRate
buf.writeUInt16LE(blockAlign, pos); pos += 2;   // BlockAlign
buf.writeUInt16LE(BIT_DEPTH, pos); pos += 2;    // BitsPerSample

// data chunk
buf.write('data', pos); pos += 4;
buf.writeUInt32LE(dataBytes, pos); pos += 4;

for (let i = 0; i < numSamples; i++) {
  buf.writeInt16LE(pcm[i], pos);
  pos += 2;
}

const outDir  = path.join(__dirname, '..', 'assets', 'audio');
const outPath = path.join(outDir, 'somnatek-fax-line.wav');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, buf);

const durationS = (numSamples / SAMPLE_RATE).toFixed(1);
console.log(`Written: ${outPath}`);
console.log(`Duration: ${durationS}s  |  Samples: ${numSamples}  |  Size: ${(totalBytes / 1024).toFixed(1)} KB`);
console.log('Upload to Amazon Connect: Routing > Prompts > Create prompt > Upload audio');
