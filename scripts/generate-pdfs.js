#!/usr/bin/env node
/**
 * scripts/generate-pdfs.js
 *
 * Generates five institutional PDF documents for somnatek.org/docs/
 * Each embeds hidden puzzle elements that collectively reveal the five
 * confirmed-access participant IDs from Protocol 7A.
 *
 * ─── PUZZLE ARCHITECTURE ────────────────────────────────────────────────────
 *
 * CROSS-FORM CIPHER (primary):
 *   Each form has a trailing two-digit number in its form number:
 *     SHC-INT-2009-07  →  07  →  PTX-007
 *     SHC-CST-2008-11  →  11  →  PTX-011
 *     SHC-CPL-2010-14  →  14  →  PTX-014
 *     SHC-SHG-2009-18  →  18  →  PTX-018
 *     SHC-IAR-2011-31  →  31  →  PTX-031
 *   These five participant IDs are the confirmed-access cohort listed in
 *   7A-SUPP-005 (Termination Reports). Assembling all five reveals the path.
 *
 * METADATA CIPHER (secondary):
 *   The PDF Subject field across all five forms, read in order, produces:
 *   "When you find this room 413 is waiting"
 *   Visible via exiftool, Get Info, or PDF properties panels.
 *
 * ACROSTICS (per-document):
 *   patient-intake-form.pdf   — Instructions paragraph: first letter of each
 *                               sentence spells LORTIZ (Lena Ortiz)
 *   sleep-study-consent.pdf   — Participant Rights list: first letter of each
 *                               item spells NIGHTFLR
 *   sleep-hygiene-guide.pdf   — 10-tip list: first word of each tip spells
 *                               NIGHTFLOOR (N-I-G-H-T-F-L-O-O-R)
 *   insurance-auth-request.pdf — Carrier notes list: first letter of each
 *                               sentence spells RECALL
 *
 * INVISIBLE (white-on-white) TEXT (per-document):
 *   Selectable/searchable but visually invisible. Select-all reveals each.
 *
 * VISUAL ANOMALIES:
 *   patient-intake-form.pdf   — "Room 413 reserved for protocol use" note
 *   sleep-study-consent.pdf   — Withdrawal clause references Protocol 7A §8.3
 *   cpap-compliance-log.pdf   — Sample rows dated sessions 7/14/22, hours 4.13
 *   insurance-auth-request.pdf — ICD code G47.413 (fabricated), HRWCO-FAC-0031
 *
 * ANOMALOUS METADATA DATES:
 *   patient-intake-form.pdf   — ModDate 2014-09-22 (4 days post-closure)
 *   sleep-study-consent.pdf   — ModDate 2011-09-15 (EC-003 amendment date)
 *   cpap-compliance-log.pdf   — ModDate 2014-10-08 (Ortiz cert renewal date)
 *   sleep-hygiene-guide.pdf   — ModDate 2013-03-14 (EC-004 co-signature date)
 *   insurance-auth-request.pdf — ModDate 2014-09-18 (exact clinic closure date)
 * ────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'sites', 'somnatek', 'docs');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Drawing helpers ──────────────────────────────────────────────────────────

/** Thin horizontal rule */
function hr(doc, y, x1 = 72, x2 = 540) {
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor('#bbbbbb').lineWidth(0.4).stroke();
}

/** Filled section header bar */
function sectionBar(doc, text, y) {
  doc.rect(72, y, 468, 13).fill('#dde4ea');
  doc.fontSize(7.5).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text(text.toUpperCase(), 76, y + 3, { lineBreak: false });
  return y + 17;
}

/**
 * Labeled field with optional grey sample text.
 * @param {PDFDocument} doc
 * @param {string}  label
 * @param {number}  x
 * @param {number}  y
 * @param {number}  w       - width of the underline
 * @param {string} [sample] - light-grey sample/placeholder value
 */
function field(doc, label, x, y, w, sample) {
  doc.fontSize(6.5).fillColor('#666').font('Helvetica')
     .text(label, x, y, { lineBreak: false });
  if (sample) {
    doc.fontSize(7).fillColor('#c0c0c0').font('Helvetica-Oblique')
       .text(sample, x + 2, y + 8, { lineBreak: false });
  }
  doc.moveTo(x, y + 18).lineTo(x + w, y + 18)
     .strokeColor('#c0c0c0').lineWidth(0.4).stroke();
}

/** Checkbox with label */
function checkbox(doc, label, x, y) {
  doc.rect(x, y + 1, 8, 8).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text(label, x + 12, y + 0.5, { lineBreak: false });
}

/**
 * White-on-white invisible text.
 * Uses PDF text rendering mode 3 (invisible) via raw content injection.
 * Text is present in the stream, selectable, and extractable via pdftotext,
 * but renders as nothing on screen. PDFKit's fillColor('white') is silently
 * dropped; only addContent with Tr 3 reliably embeds the text.
 * @param {PDFDocument} doc
 * @param {string} text
 * @param {number} x
 * @param {number} y
 */
function ghost(doc, text, x, y) {
  // Escape special PDF string characters
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  // Convert y to PDF coordinate space (PDF origin is bottom-left; PDFKit uses top-left)
  const pdfY = doc.page.height - y - 5.5;
  doc.addContent(
    'q BT /F1 5.5 Tf ' + x + ' ' + pdfY + ' Td 3 Tr (' + escaped + ') Tj ET Q'
  );
}

/** Underlined signature line */
function sigLine(doc, label, x, y, w) {
  doc.moveTo(x, y).lineTo(x + w, y).strokeColor('#aaaaaa').lineWidth(0.4).stroke();
  doc.fontSize(6.5).fillColor('#888').font('Helvetica')
     .text(label, x, y + 2, { lineBreak: false });
}

/** Clinic letterhead */
function clinicHeader(doc, formTitle, formNum, revNote) {
  doc.rect(72, 52, 468, 2).fill('#1a3a5a');
  doc.fontSize(12.5).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text('SOMNATEK SLEEP HEALTH CENTER', 72, 62, { align: 'center', width: 468 });
  doc.fontSize(7).fillColor('#666').font('Helvetica')
     .text('465 Upper Riverdale Road, Suite 2  ·  Harrow County, GA 30274  ·  Tel (404) 551-4145  ·  Fax (404) 671-9774', 72, 80, { align: 'center', width: 468 });
  doc.rect(72, 95, 468, 18).strokeColor('#9ab0c4').lineWidth(0.7).stroke();
  doc.fontSize(10).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text(formTitle, 72, 100, { align: 'center', width: 468 });
  doc.fontSize(6.5).fillColor('#aaaaaa').font('Helvetica')
     .text('Form No. ' + formNum + '  ·  ' + revNote, 72, 117, { align: 'right', width: 468 });
  return 133;
}

/** Standard page footer */
function pageFooter(doc, formNum, pageNum, total) {
  const y = 754;
  hr(doc, y);
  doc.fontSize(6.5).fillColor('#aaaaaa').font('Helvetica')
     .text(formNum + '  ·  Page ' + pageNum + ' of ' + total + '  ·  Somnatek Sleep Health Center  ·  Retain in patient file', 72, y + 3, { align: 'center', width: 468 });
}

// ─── PDF 1: patient-intake-form.pdf ──────────────────────────────────────────
/**
 * Puzzle elements:
 *   - Instructions acrostic: LORTIZ (first letter of each of 6 sentences)
 *   - Anomalous: "Room 413 reserved for protocol use" in room assignment section
 *   - Ghost text: enrollment packet PTX-018 reference
 *   - Metadata Subject: "When"
 *   - Metadata ModDate: 2014-09-22 (4 days post-closure)
 *   - Form number trailer: 07 → PTX-007
 */
function generateIntakeForm() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 52, bottom: 52, left: 72, right: 72 },
    info: {
      Title: 'Patient Intake Form',
      Author: 'L. Ortiz',
      Subject: 'When',
      Keywords: 'somnatek patient intake form v4 2009 EC4 amendment 2012',
      Creator: 'Somnatek Sleep Health Center — Administrative Records',
      CreationDate: new Date('2009-03-14T09:00:00'),
      ModDate: new Date('2014-09-22T08:47:00'),
    },
  });

  const out = fs.createWriteStream(path.join(OUT_DIR, 'patient-intake-form.pdf'));
  doc.pipe(out);

  // ── Page 1 ──
  let y = clinicHeader(doc, 'PATIENT INTAKE FORM', 'SHC-INT-2009-07', 'Rev. 4.0  ·  Amendment EC4  ·  Updated March 2012');

  // Instructions — acrostic LORTIZ (first letter of each sentence)
  doc.fontSize(7.5).fillColor('#333').font('Helvetica-Bold').text('INSTRUCTIONS', 72, y);
  y += 12;
  hr(doc, y); y += 5;

  // L — O — R — T — I — Z
  const instructions = [
    'Legible handwriting is required for all fields. Use black or blue ink. Do not use correction fluid or pencil.',
    'Once submitted, this form becomes part of your permanent Somnatek patient record and may be shared with referring physicians.',
    'Referring physician information and a current insurance card must be provided before intake processing can begin.',
    'This form is required at your first appointment and must be reviewed and resubmitted annually during active treatment.',
    'Incomplete forms or missing required fields may delay your initial consultation by up to five business days.',
    'Zip code, county of residence, and insurance group number are required fields for billing and insurance verification.',
  ];

  doc.fontSize(7.5).fillColor('#333').font('Helvetica');
  instructions.forEach((line) => {
    doc.text(line, 76, y, { width: 458 });
    y = doc.y + 2;
  });
  y += 6;

  // Patient information
  y = sectionBar(doc, 'Patient Information', y);
  field(doc, 'Last Name', 72, y, 148);
  field(doc, 'First Name', 232, y, 130);
  field(doc, 'M.I.', 374, y, 30);
  field(doc, 'Date of Birth', 416, y, 124);
  y += 26;
  field(doc, 'Street Address', 72, y, 288);
  field(doc, 'Unit / Apt', 372, y, 68);
  field(doc, 'SSN (last 4)', 452, y, 88);
  y += 26;
  field(doc, 'City', 72, y, 170);
  field(doc, 'State', 254, y, 36);
  field(doc, 'ZIP', 302, y, 72);
  field(doc, 'County', 386, y, 154);
  y += 26;
  field(doc, 'Primary Phone', 72, y, 140);
  field(doc, 'Alternate Phone', 224, y, 140);
  field(doc, 'Email Address', 376, y, 164);
  y += 30;

  // Insurance
  y = sectionBar(doc, 'Insurance Information', y);
  field(doc, 'Insurance Carrier', 72, y, 196);
  field(doc, 'Policy / Member ID', 280, y, 148);
  field(doc, 'Group Number', 440, y, 100);
  y += 26;
  field(doc, 'Policyholder Name (if different)', 72, y, 220);
  field(doc, 'Policyholder DOB', 304, y, 96);
  field(doc, 'Relationship to Patient', 412, y, 128);
  y += 26;
  field(doc, 'Secondary Insurance Carrier (if applicable)', 72, y, 196);
  field(doc, 'Secondary Policy ID', 280, y, 148);
  y += 30;

  // Room assignment — anomalous field
  y = sectionBar(doc, 'Study Room Assignment', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('Room assignment is determined by technician availability and equipment scheduling. Patients with documented sensitivities may indicate a preference. Leave blank if no preference.', 76, y, { width: 458 });
  y = doc.y + 8;
  checkbox(doc, 'No preference', 76, y);
  checkbox(doc, 'Patient-directed assignment (attach written request to this form)', 190, y);
  y += 16;
  // Small anomalous note
  doc.fontSize(6).fillColor('#bbbbbb').font('Helvetica-Oblique')
     .text('Note: Room 413 is reserved for protocol use and is not available for standard patient room assignment.', 76, y, { width: 458 });
  y = doc.y + 12;

  // Ghost text (invisible)
  ghost(doc, 'study participant cross-reference: enrollment packet PTX-018 — attach to file 7A — administered by L. Ortiz', 72, y);
  y += 7;

  // Referring physician
  y = sectionBar(doc, 'Referring Physician', y);
  field(doc, 'Physician Name', 72, y, 196);
  field(doc, 'Practice / Institution', 280, y, 174);
  field(doc, 'NPI Number', 466, y, 74);
  y += 26;
  field(doc, 'Phone', 72, y, 140);
  field(doc, 'Fax', 224, y, 130);
  field(doc, 'Referral Date', 366, y, 100);
  y += 8;

  pageFooter(doc, 'SHC-INT-2009-07', 1, 2);
  doc.addPage();

  // ── Page 2 ──
  y = 72;
  doc.fontSize(9).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text('PATIENT INTAKE FORM — CONTINUED', 72, y, { align: 'center', width: 468 });
  doc.fontSize(7).fillColor('#aaaaaa').font('Helvetica')
     .text('SHC-INT-2009-07  ·  Patient name: ____________________________________________  ·  DOB: _______________', 72, y + 14, { align: 'center', width: 468 });
  y += 34;

  // Sleep history
  y = sectionBar(doc, 'Sleep History and Primary Complaint', y);
  doc.fontSize(7.5).fillColor('#555').font('Helvetica')
     .text('Primary sleep complaint (describe in patient\'s own words):', 76, y);
  y = doc.y + 4;
  for (let i = 0; i < 3; i++) {
    doc.moveTo(76, y + 12).lineTo(534, y + 12).strokeColor('#cccccc').lineWidth(0.4).stroke();
    y += 16;
  }
  y += 4;
  field(doc, 'Duration of complaint', 76, y, 130);
  field(doc, 'Frequency (nights/week)', 218, y, 130);
  field(doc, 'Severity (1–10)', 360, y, 76);
  field(doc, 'Years affected', 448, y, 86);
  y += 26;
  doc.fontSize(7.5).fillColor('#555').font('Helvetica')
     .text('Previous diagnoses or treatments (include self-directed interventions and OTC medications):', 76, y);
  y = doc.y + 4;
  for (let i = 0; i < 2; i++) {
    doc.moveTo(76, y + 12).lineTo(534, y + 12).strokeColor('#cccccc').lineWidth(0.4).stroke();
    y += 16;
  }
  y += 8;

  // Current medications
  y = sectionBar(doc, 'Current Medications', y);
  doc.fontSize(7.5).fillColor('#555').font('Helvetica')
     .text('List all current medications, supplements, and over-the-counter sleep aids:', 76, y);
  y = doc.y + 6;
  const mCols  = [76, 210, 356, 456];
  const mWidths = [130, 142, 96, 78];
  const mLabels = ['Medication Name', 'Dose / Frequency', 'Prescribing Physician', 'Start Date'];
  mLabels.forEach((l, i) => {
    doc.fontSize(6.5).fillColor('#555').font('Helvetica-Bold')
       .text(l, mCols[i], y, { lineBreak: false });
  });
  y += 10;
  hr(doc, y); y += 2;
  for (let r = 0; r < 5; r++) {
    if (r % 2 === 0) doc.rect(76, y, 458, 15).fill('#f8fafc');
    doc.moveTo(76, y + 15).lineTo(534, y + 15).strokeColor('#e0e0e0').lineWidth(0.3).stroke();
    y += 15;
  }
  y += 10;

  // Authorization
  y = sectionBar(doc, 'Authorization and Signature', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('I authorize Somnatek Sleep Health Center to use the information provided on this form for scheduling, clinical coordination, and billing purposes. I confirm that all information is accurate and complete to the best of my knowledge. I understand that this form may be updated at any subsequent visit.', 76, y, { width: 458 });
  y = doc.y + 16;
  sigLine(doc, 'Patient Signature', 76, y, 236);
  sigLine(doc, 'Date', 334, y, 100);
  y += 24;
  sigLine(doc, 'Parent / Guardian Signature (if patient is a minor)', 76, y, 236);
  sigLine(doc, 'Relationship to Patient', 334, y, 200);
  y += 28;

  doc.fontSize(6).fillColor('#c0c0c0').font('Helvetica')
     .text('This form is subject to the Somnatek Sleep Health Center Privacy Notice. For questions regarding patient records, contact records@somnatek.org. Form last updated per Amendment EC4, March 14, 2012. Supersedes all prior intake form versions.', 76, y, { width: 458 });

  pageFooter(doc, 'SHC-INT-2009-07', 2, 2);
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─── PDF 2: sleep-study-consent.pdf ──────────────────────────────────────────
/**
 * Puzzle elements:
 *   - Participant Rights acrostic: NIGHTFLR (first letter of each of 8 items)
 *   - Withdrawal clause explicitly cites Protocol 7A Section 8.3
 *   - Ghost text: EC-003 access confirmation protocol reference
 *   - Metadata Subject: "you"
 *   - Metadata ModDate: 2011-09-15 (exact EC-003 amendment date)
 *   - Form number trailer: 11 → PTX-011
 */
function generateConsentForm() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 52, bottom: 52, left: 72, right: 72 },
    info: {
      Title: 'Sleep Study Informed Consent',
      Author: 'E. Vale / M. Ellison',
      Subject: 'you',
      Keywords: 'informed consent protocol 7A longitudinal recall study WU-CBN-2007-044 EC3',
      Creator: 'Wexler University / Somnatek Sleep Health Center',
      CreationDate: new Date('2008-04-01T09:00:00'),
      ModDate: new Date('2011-09-15T14:22:00'),
    },
  });

  const out = fs.createWriteStream(path.join(OUT_DIR, 'sleep-study-consent.pdf'));
  doc.pipe(out);

  let y = clinicHeader(doc, 'INFORMED CONSENT — SLEEP STUDY PARTICIPATION', 'SHC-CST-2008-11', 'Rev. 3.0  ·  Amendment EC3  ·  September 2011');

  doc.fontSize(7.5).fillColor('#333').font('Helvetica-Bold').text('STUDY DESCRIPTION', 72, y);
  y += 12; hr(doc, y); y += 5;
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('You are being asked to participate in a longitudinal sleep recall study conducted by Somnatek Sleep Health Center in partnership with Wexler University, Department of Cognitive and Behavioral Neuroscience. The study is designated Protocol 7A, IRB reference WU-CBN-2007-044.', 76, y, { width: 458 });
  y = doc.y + 8;
  doc.text('The purpose of this study is to determine whether consistent environmental features appear across independent participant sleep recall reports under controlled polysomnographic conditions. Participation involves a series of overnight sleep sessions followed by structured recall interviews.', 76, y, { width: 458 });
  y = doc.y + 12;

  y = sectionBar(doc, 'What the Study Involves', y);
  const procedures = [
    'Overnight polysomnographic (PSG) monitoring sessions in the Somnatek lab facility, at approximately 21-day intervals',
    'Pre-session intake assessment of approximately 30 minutes',
    'Post-session recall interview of up to 60 minutes, conducted by the attending technician',
    'Completion of a standardized Environmental Element Checklist (EEC) following each session',
    'Physician sign-off and session record filing within 48 hours',
  ];
  doc.fontSize(7.5).fillColor('#333').font('Helvetica');
  procedures.forEach(p => {
    doc.text('\u2022  ' + p, 80, y, { width: 454 });
    y = doc.y + 3;
  });
  y += 6;

  y = sectionBar(doc, 'Risks and Discomforts', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('Participation is associated with minor discomforts: difficulty sleeping in an unfamiliar environment, mild skin irritation from electrode application, and disruption to sleep schedule on study nights. No significant physical risks are known.', 76, y, { width: 458 });
  y = doc.y + 8;
  doc.text('Participants may experience vivid or persistent recalled environmental features following sessions. This is an anticipated study outcome and is not classified as an adverse event under the current protocol. Participants with concerns regarding recall persistence should contact the attending technician.', 76, y, { width: 458 });
  y = doc.y + 10;

  pageFooter(doc, 'SHC-CST-2008-11', 1, 3);
  doc.addPage();

  // Page 2
  y = 72;
  doc.fontSize(9).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text('INFORMED CONSENT — PAGE 2', 72, y, { align: 'center', width: 468 });
  y += 22;

  y = sectionBar(doc, 'Benefits', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('You may not receive direct personal benefit from this study. The potential benefits are to the field of sleep medicine and to our understanding of environmental consistency in sleep recall. Participation provides access to overnight diagnostic monitoring.', 76, y, { width: 458 });
  y = doc.y + 12;

  y = sectionBar(doc, 'Voluntary Participation and Withdrawal', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('Participation is voluntary. You may withdraw at any time by notifying the attending technician or clinical coordinator in writing. Withdrawal will not affect your access to clinical services at Somnatek Sleep Health Center.', 76, y, { width: 458 });
  y = doc.y + 8;
  // Anomalous note citing 8.3
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('Note: Under Amendment EC3 (September 2011), participants who have completed two or more sessions with confirmed environmental access events may be subject to continued observation procedures per Protocol 7A, Section 8.3. Participants with questions regarding continued observation should direct them to the clinical coordinator in writing.', 76, y, { width: 458 });
  y = doc.y + 12;

  // Participant Rights — acrostic NIGHTFLR
  y = sectionBar(doc, 'Participant Rights', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('As a participant in this study, you have the right to:', 76, y);
  y = doc.y + 8;

  // N-I-G-H-T-F-L-R → NIGHTFLR
  const rights = [
    'Not be subject to unauthorized disclosure of your study participation status to parties outside the research team',
    'Inquire about study procedures, session scheduling, and data handling at any time without affecting your participation',
    'Grant or withhold consent for optional study components, including supplemental interview sessions and extended monitoring',
    'Have all study-related questions answered fully before and during participation by the coordinator or attending technician',
    'Terminate participation at any time, subject to the notification provisions in Protocol 7A Section 8.3 as amended',
    'File a formal complaint with the Wexler University Institutional Review Board (WU-CBN-2007-044) at any time',
    'Leave the study facility at the conclusion of each session, provided the post-session assessment has been completed',
    'Receive a copy of this consent form, the current protocol summary, and any amendments upon written request',
  ];

  doc.fontSize(7.5).fillColor('#333').font('Helvetica');
  rights.forEach((r, i) => {
    doc.text((i + 1) + '.  ' + r, 80, y, { width: 454 });
    y = doc.y + 4;
  });

  // Ghost text
  ghost(doc, 'EC-003 amendment September 2011 — access confirmation protocol added — see Protocol 7A Section 8.3 — covers category 7 classification and observer reclassification provisions', 72, y);
  y += 7;

  pageFooter(doc, 'SHC-CST-2008-11', 2, 3);
  doc.addPage();

  // Page 3 — signatures
  y = 72;
  doc.fontSize(9).fillColor('#1a3a5a').font('Helvetica-Bold')
     .text('INFORMED CONSENT — PAGE 3 (SIGNATURE)', 72, y, { align: 'center', width: 468 });
  y += 22;

  y = sectionBar(doc, 'IRB Reference', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('This study has been reviewed and approved by the Wexler University IRB, reference WU-CBN-2007-044. This consent form reflects Amendment EC3, approved September 15, 2011. Consent forms from earlier versions (EC1/2008, EC2/2009) are retained in participant files.', 76, y, { width: 458 });
  y = doc.y + 14;

  y = sectionBar(doc, 'Consent Statement', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('I have read and understand this consent form. I have had the opportunity to ask questions and all questions have been answered to my satisfaction. I voluntarily agree to participate. I understand that I may withdraw at any time, subject to the provisions described in Protocol 7A Section 8.3.', 76, y, { width: 458 });
  y = doc.y + 20;

  sigLine(doc, 'Participant Signature', 76, y, 234);
  sigLine(doc, 'Date', 334, y, 100);
  y += 24;
  sigLine(doc, 'Printed Name', 76, y, 234);
  sigLine(doc, 'Participant ID (assigned at enrollment)', 334, y, 200);
  y += 30;

  doc.fontSize(7.5).fillColor('#555').font('Helvetica-Bold').text('For Research Staff Use:', 76, y);
  y += 14;
  sigLine(doc, 'Attending Technician Signature', 76, y, 194);
  sigLine(doc, 'Staff ID', 282, y, 76);
  sigLine(doc, 'Date', 370, y, 80);
  y += 24;
  sigLine(doc, 'Clinical Coordinator Signature', 76, y, 194);
  sigLine(doc, 'Date', 282, y, 80);
  y += 30;

  doc.fontSize(6).fillColor('#c0c0c0').font('Helvetica')
     .text('SHC-CST-2008-11 EC3. Amended September 15, 2011. Participants enrolled under EC1 or EC2 are subject to original consent terms except as superseded by EC3 amendment provisions. Copy to participant upon request.', 76, y, { width: 458 });

  pageFooter(doc, 'SHC-CST-2008-11', 3, 3);
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─── PDF 3: cpap-compliance-log.pdf ──────────────────────────────────────────
/**
 * Puzzle elements:
 *   - Sample rows dated 2013-01-07, 2013-01-14, 2013-01-22 (sessions 7, 14, 22
 *     from PTX-018 — the sessions with flagged technician notes)
 *   - Sample compliance hours: 4.13 on every row (= room 413)
 *   - Final sample row note: "final entry prior to participant discontinuation"
 *   - Ghost text: "room 413 — do not assign for standard CPAP monitoring"
 *   - Metadata Subject: "find"
 *   - Metadata ModDate: 2014-10-08 (Ortiz RPSGT cert renewal, 6 wks post-elimination)
 *   - Form number trailer: 14 → PTX-014
 */
function generateCpapLog() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 52, bottom: 52, left: 72, right: 72 },
    info: {
      Title: 'CPAP Compliance Log',
      Author: 'L. Ortiz',
      Subject: 'find',
      Keywords: 'CPAP compliance log monthly somnatek 2010 sleep apnea technician',
      Creator: 'Somnatek Sleep Health Center — Clinical Records',
      CreationDate: new Date('2010-06-01T09:00:00'),
      ModDate: new Date('2014-10-08T09:31:00'),
    },
  });

  const out = fs.createWriteStream(path.join(OUT_DIR, 'cpap-compliance-log.pdf'));
  doc.pipe(out);

  let y = clinicHeader(doc, 'CPAP COMPLIANCE LOG — MONTHLY RECORD', 'SHC-CPL-2010-14', 'Rev. 2.1  ·  Updated June 2010');

  y = sectionBar(doc, 'Patient Information', y);
  field(doc, 'Patient Name', 72, y, 198);
  field(doc, 'Patient ID', 282, y, 96, 'e.g. PTX-');
  field(doc, 'Device Serial No.', 390, y, 150);
  y += 26;
  field(doc, 'Attending Technician', 72, y, 154, 'L. Ortiz (Tech II)');
  field(doc, 'Physician of Record', 238, y, 154);
  field(doc, 'Log Period (Month / Year)', 404, y, 136);
  y += 28;

  doc.fontSize(7.5).fillColor('#555').font('Helvetica')
     .text('Complete one row for each night. Record compliance hours from device display or downloaded data. Notes should include any disruptions, mask fit issues, or patient-reported concerns. Technician initials required for reviewed rows.', 76, y, { width: 458 });
  y = doc.y + 10;

  // Table
  const C = [72, 144, 220, 298, 374, 506];
  const CW = [70, 74, 76, 74, 130, 34];
  const heads = ['Date', 'Hours Used', 'Compliance %', 'AHI Events', 'Notes / Patient Report', 'Init.'];

  doc.rect(72, y, 468, 14).fill('#dde4ea');
  heads.forEach((h, i) => {
    doc.fontSize(7).fillColor('#1a3a5a').font('Helvetica-Bold')
       .text(h, C[i] + 2, y + 3.5, { width: CW[i] - 4, lineBreak: false });
  });
  y += 14;

  // Sample rows: sessions 7, 14, 22 — each with 4.13 hours
  const sampleRows = [
    { date: '2013-01-07', hours: '4.13', comp: '100%', ahi: '2.1', notes: 'Nominal. Patient reports consistent environmental recall — flagged for technician review per standing directive.', init: 'L.O.' },
    { date: '2013-01-14', hours: '4.13', comp: '100%', ahi: '1.8', notes: 'Consistent with prior session. Cross-reference session record on file. Technician note attached.', init: 'L.O.' },
    { date: '2013-01-22', hours: '4.13', comp: '100%', ahi: '2.4', notes: 'Final entry prior to participant discontinuation. Records transferred per protocol. File closed.', init: 'L.O.' },
  ];

  sampleRows.forEach((row, idx) => {
    const ry = y + idx * 22;
    if (idx % 2 === 0) doc.rect(72, ry, 468, 22).fill('#f9fbfc');
    doc.fontSize(7).fillColor('#b8b8b8').font('Helvetica-Oblique');
    doc.text(row.date,  C[0] + 2, ry + 5, { width: CW[0] - 4, lineBreak: false });
    doc.text(row.hours, C[1] + 2, ry + 5, { width: CW[1] - 4, lineBreak: false });
    doc.text(row.comp,  C[2] + 2, ry + 5, { width: CW[2] - 4, lineBreak: false });
    doc.text(row.ahi,   C[3] + 2, ry + 5, { width: CW[3] - 4, lineBreak: false });
    doc.text(row.notes, C[4] + 2, ry + 3, { width: CW[4] - 4 });
    doc.text(row.init,  C[5] + 2, ry + 5, { width: CW[5] - 4, lineBreak: false });
    doc.moveTo(72, ry + 22).lineTo(540, ry + 22).strokeColor('#e2e8ee').lineWidth(0.3).stroke();
  });
  y += sampleRows.length * 22;

  // Empty rows
  for (let i = 0; i < 18; i++) {
    if (i % 2 === 0) doc.rect(72, y, 468, 18).fill('#f9fbfc');
    doc.moveTo(72, y + 18).lineTo(540, y + 18).strokeColor('#e2e8ee').lineWidth(0.3).stroke();
    C.slice(1).forEach(cx => {
      doc.moveTo(cx, y).lineTo(cx, y + 18).strokeColor('#e8eef2').lineWidth(0.2).stroke();
    });
    y += 18;
  }
  // Table outer border
  doc.rect(72, y - (18 + sampleRows.length * 22) - 18 * 18 + (18 + sampleRows.length * 22) - 14, 468, 14 + sampleRows.length * 22 + 18 * 18)
     .strokeColor('#aaaaaa').lineWidth(0.5).stroke();
  y += 8;

  doc.fontSize(7).fillColor('#888').font('Helvetica')
     .text('Compliance threshold: \u22654 hours/night, \u226570% of nights per 30-day period (CMS). Log series: SHC-CPAP-LOG-14. Return this log to your attending technician at each follow-up visit.', 76, y, { width: 458 });
  y = doc.y + 8;

  ghost(doc, 'room 413 — do not assign for standard CPAP monitoring sessions — technician standing directive ref 2013-09 — L. Ortiz — see protocol 7A supplemental file', 72, y);

  pageFooter(doc, 'SHC-CPL-2010-14', 1, 1);
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─── PDF 4: sleep-hygiene-guide.pdf ──────────────────────────────────────────
/**
 * Puzzle elements:
 *   - 10-tip acrostic: NIGHTFLOOR — first WORD of each tip:
 *     Never / Identify / Gradually / Hold / Temperature /
 *     Follow / Limit / Optimize / Observe / Restful
 *   - Ghost text: protocol 7A participant supplement, not for general distribution
 *   - Metadata Subject: "this"
 *   - Metadata ModDate: 2013-03-14 (EC-004 co-signature date)
 *   - Publication code: SHG-2009-018 (018 = PTX-018)
 *   - Form number trailer: 18 → PTX-018
 */
function generateSleepHygieneGuide() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 52, bottom: 52, left: 72, right: 72 },
    info: {
      Title: 'Sleep Hygiene Reference Guide',
      Author: 'Somnatek Education Dept.',
      Subject: 'this',
      Keywords: 'sleep hygiene guide SHG 2009 protocol 7A participant supplement somnatek',
      Creator: 'Somnatek Sleep Health Center — Patient Education',
      CreationDate: new Date('2009-07-01T09:00:00'),
      ModDate: new Date('2013-03-14T11:00:00'),
    },
  });

  const out = fs.createWriteStream(path.join(OUT_DIR, 'sleep-hygiene-guide.pdf'));
  doc.pipe(out);

  let y = clinicHeader(doc, 'SLEEP HYGIENE REFERENCE GUIDE', 'SHC-SHG-2009-18', 'Publication SHG-2009-018  ·  Rev. 1.2  ·  Updated March 2013');

  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('The following guidelines are provided by the clinical staff of Somnatek Sleep Health Center based on current sleep medicine literature. These recommendations are general in nature and do not replace the guidance of a licensed sleep medicine physician.', 76, y, { width: 458 });
  y = doc.y + 12;

  y = sectionBar(doc, '10 Evidence-Based Sleep Hygiene Recommendations', y);

  // Tips — first word of each spells NIGHTFLOOR
  const tips = [
    ['Never',       'consume caffeine after 2:00 PM. Caffeine remains active in the system for 5 to 6 hours and can delay sleep onset even when consumed in the early afternoon. Includes coffee, tea, sodas, and chocolate.'],
    ['Identify',    'and minimize sources of pre-sleep stress. Brief journaling or a written to-do list before bed may help externalize unresolved concerns and reduce sleep-onset anxiety.'],
    ['Gradually',   'reduce light exposure 60 to 90 minutes before sleep. Bright overhead light suppresses melatonin and delays sleep onset. Use lower-intensity warm-toned light in the pre-sleep period.'],
    ['Hold',        'to a consistent sleep and wake schedule, including weekends and days off. Irregular schedules disrupt circadian rhythm and impair sleep quality over time.'],
    ['Temperature', 'regulation is important. Most adults sleep best at 65 to 68 degrees Fahrenheit. Seasonal adjustment may be necessary based on individual tolerance.'],
    ['Follow',      'a brief consistent wind-down routine before bed. A predictable pre-sleep sequence signals the nervous system that sleep is approaching and reduces sleep latency.'],
    ['Limit',       'screen use in the final hour before sleep. Blue-spectrum light from displays disrupts melatonin signaling. Use device night mode or amber-tinted glasses if avoidance is not possible.'],
    ['Optimize',    'your sleeping environment for darkness and quiet. Blackout curtains and white noise may help patients in environments with intermittent light or noise exposure.'],
    ['Observe',     'and document your sleep patterns over several weeks before a clinical consultation. A brief sleep diary significantly improves diagnostic accuracy and treatment planning.'],
    ['Restful',     'sleep is achievable with consistent behavioral modification. If difficulties persist beyond three weeks despite adherence to these guidelines, consult a sleep specialist.'],
  ];

  doc.fontSize(7.5).fillColor('#333');
  tips.forEach(([bold, rest], i) => {
    doc.font('Helvetica-Bold').text((i + 1) + '.  ' + bold, 76, y, { continued: true, width: 458 });
    doc.font('Helvetica').text('  ' + rest, { width: 458 });
    y = doc.y + 5;
  });
  y += 6;

  y = sectionBar(doc, 'Sleep Environment Checklist', y);
  const envChecks = [
    'Bedroom used for sleep only — no work, screens, or eating in bed',
    'Room temperature maintained between 65\u201368\u00b0F',
    'Room is dark — blackout curtains or sleep mask used',
    'External noise minimized — white noise machine or earplugs available',
    'Mattress and pillow support reviewed within the last five years',
    'Electronic devices silenced or removed from the sleeping area',
  ];
  envChecks.forEach(c => {
    checkbox(doc, c, 76, y);
    y += 16;
  });
  y += 8;

  doc.fontSize(7).fillColor('#888').font('Helvetica')
     .text('For clinical questions, contact Somnatek Sleep Health Center at (404) 551-4145. This guide is provided for educational purposes. Somnatek Sleep Health Center is no longer providing clinical services. Former patients should direct clinical inquiries to their current provider.', 76, y, { width: 458 });
  y = doc.y + 10;

  ghost(doc, 'guide distribution batch 2009-7A — protocol 7A participant supplement — not authorized for general distribution — administered per clinical coordinator directive M. Ellison', 72, y);

  pageFooter(doc, 'SHC-SHG-2009-18', 1, 1);
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─── PDF 5: insurance-auth-request.pdf ───────────────────────────────────────
/**
 * Puzzle elements:
 *   - Carrier notes acrostic: RECALL (first letter of each of 6 sentences)
 *   - ICD-10 code G47.413 — fabricated, contains room number 413
 *   - Facility code HRWCO-FAC-0031 (Harrow County + PTX-031)
 *   - Referring physician pre-filled: Dr. M. Ellison
 *   - Ghost text: authorization suspended, category 7, ref 7A-SUPP-005
 *   - Metadata Subject: "room 413 is waiting"
 *   - Metadata ModDate: 2014-09-18 (exact clinic closure date)
 *   - Form number trailer: 31 → PTX-031
 */
function generateInsuranceAuth() {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 52, bottom: 52, left: 72, right: 72 },
    info: {
      Title: 'Insurance Prior Authorization Request',
      Author: 'Somnatek Administrative Records',
      Subject: 'room 413 is waiting',
      Keywords: 'prior authorization insurance G47 sleep study somnatek 2011',
      Creator: 'Somnatek Sleep Health Center — Billing and Insurance',
      CreationDate: new Date('2011-01-15T09:00:00'),
      ModDate: new Date('2014-09-18T16:59:00'),
    },
  });

  const out = fs.createWriteStream(path.join(OUT_DIR, 'insurance-auth-request.pdf'));
  doc.pipe(out);

  let y = clinicHeader(doc, 'INSURANCE PRIOR AUTHORIZATION REQUEST', 'SHC-IAR-2011-31', 'Rev. 2.0  ·  Updated January 2011');

  y = sectionBar(doc, 'Patient Information', y);
  field(doc, 'Last Name', 72, y, 148);
  field(doc, 'First Name', 232, y, 120);
  field(doc, 'DOB', 364, y, 78);
  field(doc, 'Patient ID', 454, y, 86);
  y += 26;
  field(doc, 'Insurance Carrier', 72, y, 196);
  field(doc, 'Member ID', 280, y, 140);
  field(doc, 'Group Number', 432, y, 108);
  y += 26;
  field(doc, 'Address', 72, y, 290);
  field(doc, 'City', 374, y, 96);
  field(doc, 'State', 482, y, 58);
  y += 30;

  y = sectionBar(doc, 'Requesting Physician', y);
  field(doc, 'Physician Name', 72, y, 196, 'Dr. M. Ellison');
  field(doc, 'NPI', 280, y, 96);
  field(doc, 'Specialty', 388, y, 152);
  y += 26;
  field(doc, 'Practice / Facility', 72, y, 196, 'Somnatek Sleep Health Center');
  field(doc, 'Facility Code', 280, y, 138, 'HRWCO-FAC-0031');
  field(doc, 'Phone', 430, y, 110);
  y += 30;

  // Diagnosis codes
  y = sectionBar(doc, 'Diagnosis Codes (ICD-10)', y);
  doc.fontSize(7).fillColor('#555').font('Helvetica-Bold').text('Code', 76, y, { lineBreak: false });
  doc.text('Description', 148, y, { lineBreak: false });
  y += 11;
  hr(doc, y); y += 4;

  const diag = [
    { code: 'G47.00',  desc: 'Insomnia, unspecified', anomalous: false },
    { code: 'G47.10',  desc: 'Hypersomnia, unspecified', anomalous: false },
    { code: 'G47.30',  desc: 'Sleep apnea, unspecified', anomalous: false },
    { code: 'G47.413', desc: 'Recurrent sleep-onset environmental consistency disorder, extended observation classification', anomalous: true },
  ];
  diag.forEach((d, i) => {
    if (i % 2 === 0) doc.rect(72, y, 468, 15).fill('#f8fafc');
    const color = d.anomalous ? '#b0b0b0' : '#333';
    const font  = d.anomalous ? 'Helvetica-Oblique' : 'Helvetica';
    doc.fontSize(7).fillColor(color).font(font)
       .text(d.code, 76, y + 3, { lineBreak: false })
       .text(d.desc, 148, y + 3, { lineBreak: false });
    doc.moveTo(72, y + 15).lineTo(540, y + 15).strokeColor('#e2e8ee').lineWidth(0.3).stroke();
    y += 15;
  });
  y += 10;

  // Procedure codes
  y = sectionBar(doc, 'Procedure Codes (CPT)', y);
  const procs = [
    ['95810', 'Polysomnography, attended, 6 or more parameters'],
    ['95811', 'Polysomnography with CPAP titration, attended'],
    ['99213', 'Established patient office visit, moderate complexity'],
  ];
  procs.forEach(([code, desc], i) => {
    if (i % 2 === 0) doc.rect(72, y, 468, 15).fill('#f8fafc');
    doc.fontSize(7).fillColor('#333').font('Helvetica')
       .text(code, 76, y + 3, { lineBreak: false })
       .text(desc, 148, y + 3, { lineBreak: false });
    doc.moveTo(72, y + 15).lineTo(540, y + 15).strokeColor('#e2e8ee').lineWidth(0.3).stroke();
    y += 15;
  });
  y += 10;

  // Carrier notes — acrostic RECALL (first letter each sentence)
  y = sectionBar(doc, 'Insurance Carrier Notes and Submission Instructions', y);

  // R-E-C-A-L-L → RECALL
  const notes = [
    'Review all fields carefully before submission. Incomplete or inaccurate forms will be returned without processing.',
    'Eligibility verification must be completed by the requesting facility prior to the date of service.',
    'Clinical documentation supporting medical necessity, including relevant diagnostic study results, must be attached.',
    'Authorization codes issued are valid for 90 days from the date of issue unless otherwise noted by the carrier.',
    'Late or incomplete submissions received after the service date may result in claim denial without right of appeal.',
    'List all applicable diagnosis codes for the requested procedure to ensure full coverage review and authorization.',
  ];

  doc.fontSize(7.5).fillColor('#333').font('Helvetica');
  notes.forEach((n, i) => {
    doc.text((i + 1) + '.  ' + n, 80, y, { width: 454 });
    y = doc.y + 3;
  });
  y += 6;

  ghost(doc, 'authorization suspended — participant transferred to archive category 7 — do not process — cross-reference 7A-SUPP-005 termination reports — facility HRWCO-FAC-0031 — ref Protocol 7A EC4 Section 8.5', 72, y);
  y += 7;

  y = sectionBar(doc, 'Physician Certification and Signature', y);
  doc.fontSize(7.5).fillColor('#333').font('Helvetica')
     .text('I certify that the services requested are medically necessary for the treatment of the patient\'s condition and that the information provided is accurate and complete to the best of my knowledge.', 76, y, { width: 458 });
  y = doc.y + 16;
  sigLine(doc, 'Physician Signature', 76, y, 220);
  sigLine(doc, 'Date', 318, y, 100);
  y += 22;
  sigLine(doc, 'Printed Name', 76, y, 220);
  sigLine(doc, 'NPI', 318, y, 96);
  sigLine(doc, 'DEA (if applicable)', 426, y, 114);

  pageFooter(doc, 'SHC-IAR-2011-31', 1, 1);
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Generating Somnatek institutional PDFs...');
  await generateIntakeForm();        console.log('  \u2713  patient-intake-form.pdf     (SHC-INT-2009-07)');
  await generateConsentForm();       console.log('  \u2713  sleep-study-consent.pdf      (SHC-CST-2008-11)');
  await generateCpapLog();           console.log('  \u2713  cpap-compliance-log.pdf      (SHC-CPL-2010-14)');
  await generateSleepHygieneGuide(); console.log('  \u2713  sleep-hygiene-guide.pdf      (SHC-SHG-2009-18)');
  await generateInsuranceAuth();     console.log('  \u2713  insurance-auth-request.pdf   (SHC-IAR-2011-31)');
  console.log('\nDone. Output: ' + OUT_DIR);
  console.log('\nCross-form cipher: form trailing numbers 07-11-14-18-31 = PTX-007/011/014/018/031');
  console.log('Metadata Subject fields: "When" / "you" / "find" / "this" / "room 413 is waiting"');
}

main().catch(err => { console.error(err); process.exit(1); });
