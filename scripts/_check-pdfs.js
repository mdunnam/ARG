'use strict';
const fs   = require('fs');
const zlib  = require('zlib');
const path  = require('path');

const DOCS = path.resolve(__dirname, '..', 'sites', 'somnatek', 'docs');

function getStreams(filename) {
  const raw    = fs.readFileSync(path.join(DOCS, filename), 'latin1');
  const objRe  = /(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g;
  const streams = [];
  let m;
  while ((m = objRe.exec(raw)) !== null) {
    const body = m[2];
    if (!body.includes('stream')) continue;
    const sStart = body.indexOf('stream') + 6;
    const sEnd   = body.lastIndexOf('endstream');
    const buf    = Buffer.from(body.slice(sStart + 1, sEnd), 'latin1');
    try { streams.push(zlib.inflateSync(buf).toString('latin1')); } catch (e) {}
  }
  return streams;
}

function getMetaStrings(filename) {
  const raw = fs.readFileSync(path.join(DOCS, filename), 'latin1');
  const objRe = /(\d+)\s+0\s+obj\s*([\s\S]*?)endobj/g;
  const strs  = {};
  let m;
  while ((m = objRe.exec(raw)) !== null) {
    const body = m[2];
    if (body.includes('stream')) continue;
    const match = body.match(/^\s*\(([^)]{1,80})\)\s*$/);
    if (match) strs[m[1]] = match[1];
  }
  return strs;
}

const CHECKS = [
  { f: 'patient-intake-form.pdf',    subject: 'When',                  ghost: 'PTX-018', acrostic: 'LORTIZ'     },
  { f: 'sleep-study-consent.pdf',    subject: 'you',                   ghost: 'PTX-011', acrostic: 'NIGHTFLR'   },
  { f: 'cpap-compliance-log.pdf',    subject: 'find',                  ghost: 'PTX-014', acrostic: 'NIGHTFLOOR' },
  { f: 'sleep-hygiene-guide.pdf',    subject: 'this',                  ghost: 'PTX-018', acrostic: 'RECALL'     },
  { f: 'insurance-auth-request.pdf', subject: 'room 413 is waiting',   ghost: 'PTX-031', acrostic: 'NIGHTFLOOR' },
];

for (const c of CHECKS) {
  const streams  = getStreams(c.f);
  const metaStrs = getMetaStrings(c.f);
  const all      = streams.join('\n');

  // Subject check
  const subjectFound = Object.values(metaStrs).some(v => v.includes(c.subject));

  // White color: PDFKit outputs 'fillColor("white")' as '/DeviceRGB cs\n1 1 1 scn' or similar
  // or as the shorthand 'rg'. Check all forms.
  const whitePatterns = [
    /\b1\s+1\s+1\s+(?:rg|scn)\b/.test(all),
    /\b1\.0\s+1\.0\s+1\.0\s+(?:rg|scn)\b/.test(all),
    /\bscn\b/.test(all) && all.includes('1 1 1'),
  ];
  const hasWhite = whitePatterns.some(Boolean);

  // Ghost word: search decoded hex in all streams
  const hexAll = streams.map(s => Buffer.from(s, 'latin1').toString('hex')).join('');
  const ghostHex = Buffer.from(c.ghost).toString('hex');
  const hasGhost = hexAll.includes(ghostHex) || all.includes(c.ghost);

  // Color ops diversity
  const colorOps = [...new Set([...all.matchAll(/[\d.e]+ [\d.e]+ [\d.e]+ (?:rg|scn)\b/g)].map(m => m[0].slice(-6).trim()))];

  console.log('\n=== ' + c.f + ' ===');
  console.log('  Subject (' + c.subject + '):', subjectFound ? 'PASS' : 'FAIL', '| metaStrs:', Object.values(metaStrs).filter(v=>v.length<60).join(', ').slice(0,80));
  console.log('  White color:', hasWhite ? 'PASS' : 'FAIL', '| sample color ops:', colorOps.slice(0,5).join(', '));
  console.log('  Ghost (' + c.ghost + '):', hasGhost ? 'PASS' : 'FAIL');

  // Show last 600 chars of largest stream to find ghost area
  const large = streams.sort((a,b)=>b.length-a.length)[0];
  const tailPrintable = large.slice(-400).replace(/[^\x20-\x7e\r\n]/g, '.').replace(/\s+/g,' ');
  console.log('  Tail of largest stream:', tailPrintable.slice(0,200));
}
