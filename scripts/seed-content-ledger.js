#!/usr/bin/env node
/**
 * scripts/seed-content-ledger.js
 *
 * Seeds the DynamoDB somnatek-visitors table with the 4-week content drop schedule.
 * Drop entries use the pk prefix DROP# and a content state machine:
 *   drafted → scheduled → released → discovered → superseded | removed
 *
 * Usage:
 *   node seed-content-ledger.js [--launch YYYY-MM-DD] [--dry-run]
 *
 * If --launch is omitted, defaults to today.
 * --dry-run prints the items without writing to DynamoDB.
 *
 * Environment variables:
 *   AWS_PROFILE       AWS credentials profile
 *   AWS_REGION        AWS region (default: us-east-1)
 *   DYNAMODB_TABLE    Table name (default: somnatek-visitors)
 */

'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE  = process.env.DYNAMODB_TABLE || 'somnatek-visitors';

const args      = process.argv.slice(2);
const dryRun    = args.includes('--dry-run');
const launchArg = args[args.indexOf('--launch') + 1];
const LAUNCH    = launchArg ? new Date(launchArg) : new Date();

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/**
 * Returns an ISO date string for LAUNCH + offsetDays.
 * @param {number} offsetDays
 * @returns {string} YYYY-MM-DD
 */
function d(offsetDays) {
  const dt = new Date(LAUNCH);
  dt.setUTCDate(dt.getUTCDate() + offsetDays);
  return dt.toISOString().slice(0, 10);
}

// ─── Drop definitions ────────────────────────────────────────────────────────
// Each entry maps to one content unit. scheduledDate drives the release-script
// date check. state is the initial state written to DynamoDB.
//
// Types:
//   artifact   — a file (PDF, HTML, image, audio) written to public S3
//   site-edit  — a change to a live page (inline — already deployed)
//   email      — a transmission to the opt-in email list
//   event      — a time-boxed live game event
//   social     — an off-site social media drop (execution is manual)
//   fax        — a fax-line audio or transcript change

/** @type {Array<object>} */
const DROPS = [

  // ── WEEK 1: LAUNCH ─────────────────────────────────────────────────────────

  {
    slug:          'launch-somnatek-site',
    title:         'somnatek.org goes live',
    type:          'site-edit',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'Main site deployed. index.html, staff.html, research.html, services.html, portal, admin all live.',
  },
  {
    slug:          'launch-pdfs',
    title:         'Institutional PDF documents (docs/)',
    type:          'artifact',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        's3://somnatek-site/docs/',
    notes:         'Five PDFs with cross-form PTX cipher, Tr-3 ghost text, Subject metadata chain.',
  },
  {
    slug:          'launch-restwell',
    title:         'RestWell forum opens (read-only archive)',
    type:          'site-edit',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'restwell.net/forum — login gated. Credential hint in closure-notice.html source.',
  },
  {
    slug:          'social-reddit-week1',
    title:         'Reddit initial discovery drop',
    type:          'social',
    state:         'scheduled',
    scheduledDate: d(0),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Post to r/ARG and r/SleepParalysis from aged account. Screen-recording of somnatek.org anomalies. See viral-growth plan.',
  },
  {
    slug:          'social-tiktok-week1',
    title:         'TikTok discovery clip #1',
    type:          'social',
    state:         'scheduled',
    scheduledDate: d(1),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Short clip: person finds somnatek.org, reads closure notice, finds the phone number in the footer. Ends mid-video.',
  },
  {
    slug:          'social-youtube-week1',
    title:         'YouTube investigation video #1',
    type:          'social',
    state:         'scheduled',
    scheduledDate: d(2),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Screen recording 4-6 min. Narrated exploration of somnatek.org. Discovers fax number, calls it, hears morse. Does not decode.',
  },
  {
    slug:          'fax-morse-active',
    title:         'Fax line morse code (413) active',
    type:          'fax',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'Connect Flow plays somnatek-fax-morse.wav. Decoding 413 → room 413. Already live.',
  },
  {
    slug:          'email-responder-active',
    title:         'Email responder (records@somnatek.org) active',
    type:          'site-edit',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'SES receipt rule set active. Bedrock-powered Dorsal HRMS responds at Level 1/2/3.',
  },

  // ── WEEK 2: FIRST DEPTH ─────────────────────────────────────────────────────

  {
    slug:          'drop-wexler-soft-open',
    title:         'Wexler University archive — initial pages',
    type:          'artifact',
    state:         'scheduled',
    scheduledDate: d(8),
    releasedDate:  null,
    s3Dest:        's3://wexler-site/',
    notes:         'Staged: wexler.edu-era research pages. Dr. Edwin Vale faculty page. Protocol 7A study listing (removed from registry after 2014). Deploy from staged/wexler/.',
  },
  {
    slug:          'drop-ec-series-docs',
    title:         'EC ethics committee amendment documents',
    type:          'artifact',
    state:         'scheduled',
    scheduledDate: d(9),
    releasedDate:  null,
    s3Dest:        's3://somnatek-site/archive/ec-amendments/',
    notes:         'Staged: EC-001 through EC-004. EC-003 amendment adds "extended study" clause. EC-004 co-signed by Vale and Ellison. Deploy from staged/ec-docs/.',
  },
  {
    slug:          'drop-portal-ptx-unlock',
    title:         'Portal PTX-018 access unlock hint active',
    type:          'site-edit',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'Already live — portal accepts PTX-018, unlocks research tier. No new drop needed.',
  },
  {
    slug:          'email-week2-level2-batch',
    title:         'Week 2 email to Level 2 players (Dorsal escalation)',
    type:          'email',
    state:         'scheduled',
    scheduledDate: d(10),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Use scripts/send-batch-email.js. Pull players with level=2 from DynamoDB who have not received a follow-up. Send Level 2 Dorsal response unprompted: "Your inquiry has been assigned to active archive review."',
  },
  {
    slug:          'social-reddit-week2',
    title:         'Reddit — community compilation post',
    type:          'social',
    state:         'scheduled',
    scheduledDate: d(11),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Different account compiles initial discoveries. Links to r/ARG thread. Mentions the fax number decode. First community spreadsheet started.',
  },
  {
    slug:          'drop-admin-tier1-hint',
    title:         'Admin Tier 1 — staff.html source code comment goes live',
    type:          'site-edit',
    state:         'released',
    scheduledDate: d(0),
    releasedDate:  d(0),
    s3Dest:        null,
    notes:         'Already in staff.html source. Hint: /admin/. Already live.',
  },

  // ── WEEK 3: COMMUNITY ESCALATION ───────────────────────────────────────────

  {
    slug:          'drop-ortiz-email-trigger',
    title:         'Lena Ortiz — first unsolicited email to Level 3 players',
    type:          'email',
    state:         'scheduled',
    scheduledDate: d(15),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Manual send from lortiz@somnatek.org (or spoofed via SES). Target: players who have reached Level 3 response and have not received Ortiz contact. Message body: see Stage 3 arc plan. One short paragraph, bureaucratic in tone, references "your file" and a "scheduled review."',
  },
  {
    slug:          'drop-supp-010-staged',
    title:         '7A-SUPP-010 Indexed Space Mapping Report — released',
    type:          'artifact',
    state:         'scheduled',
    scheduledDate: d(16),
    releasedDate:  null,
    s3Dest:        's3://somnatek-site/archive/7A-SUPP-010/',
    notes:         'Staged: 7A-SUPP-010 map document showing floor plan of the indexed space. Blue door on left labeled "413." Deploy from staged/supp-010/.',
  },
  {
    slug:          'event-discord-50-milestone',
    title:         'Community milestone: 50 Discord members — fax audio changes',
    type:          'event',
    state:         'scheduled',
    scheduledDate: d(17),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Trigger: Discord reaches 50 members. Action: update Connect flow to play a second audio segment after the morse — a brief automated voice: "Your visit has been noted. Please wait." Requires re-running scripts/create-fax-flow.ps1 with updated audio.',
  },
  {
    slug:          'drop-harrow-county-records',
    title:         'Harrow County business records — Somnatek LLC filing',
    type:          'artifact',
    state:         'scheduled',
    scheduledDate: d(18),
    releasedDate:  null,
    s3Dest:        's3://harrow-county-site/',
    notes:         'Staged: harrow-county.gov-era site. Business entity search returns Somnatek Sleep Health Center LLC, Dorsal Health Holdings LLC. Dissolution date Sep 18, 2014. Deploy from staged/harrow-county/.',
  },
  {
    slug:          'social-youtube-week3',
    title:         'YouTube — deep lore investigation video #2',
    type:          'social',
    state:         'scheduled',
    scheduledDate: d(19),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Community player records a video. Shows PDF cipher solve. Finds PTX IDs. Portal unlock. Reads the RestWell threads. Ends on Ortiz last post.',
  },

  // ── WEEK 4: STAGE 3 SETUP ───────────────────────────────────────────────────

  {
    slug:          'drop-recall-notice-template',
    title:         'Recall notice — staged artifact drops to /archive/recall/',
    type:          'artifact',
    state:         'scheduled',
    scheduledDate: d(22),
    releasedDate:  null,
    s3Dest:        's3://somnatek-site/archive/recall/',
    notes:         'Staged: a single-page recall notice form. SHC-RCL-2014. Dr. Ellison signature block. Room 413. Date left blank. White-text ghost: "PLEASE WAIT TO BE RECALLED." Deploy from staged/recall/.',
  },
  {
    slug:          'event-stage3-trigger',
    title:         'Stage 3 escalation trigger fires',
    type:          'event',
    state:         'scheduled',
    scheduledDate: d(23),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Trigger: any of (a) 100 Discord members, (b) 30 days post-launch, (c) 10+ Level 3 email triggers. Action: Ortiz account on RestWell receives a new post (manually added to viewtopic.php?t=14). Email to all Level 3 players.',
  },
  {
    slug:          'drop-ortiz-stage3-forum-post',
    title:         'Ortiz — returns to RestWell t=14, posts Stage 3 message',
    type:          'site-edit',
    state:         'scheduled',
    scheduledDate: d(23),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Edit viewtopic.php: add new lortiz post after the cut-off post. Timestamp: current date. Text: "The study has not concluded. If you have been receiving recall indicators, your file is active. Do not discard any communications from this address. PLEASE WAIT TO BE RECALLED." Then: account suspended note updated to show NEW suspension date = today.',
  },
  {
    slug:          'drop-stage3-portal-unlock',
    title:         'Stage 3 portal milestone: recalled_active unlocked',
    type:          'site-edit',
    state:         'scheduled',
    scheduledDate: d(24),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Add recalled_active milestone to portal-login Lambda (released:true). 75 points. Triggered by players who submit the recall notice phrase "PLEASE WAIT TO BE RECALLED" to the portal answer endpoint.',
  },
  {
    slug:          'email-stage3-recall-batch',
    title:         'Stage 3 recall email to all Level 3 + opt-in players',
    type:          'email',
    state:         'scheduled',
    scheduledDate: d(25),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Send from records@somnatek.org. Body: Level 3 Dorsal response with PLEASE WAIT TO BE RECALLED and room 413 reference and "next recall window" language. List: DynamoDB players with level=3.',
  },
  {
    slug:          'event-discord-100-milestone',
    title:         'Community milestone: 100 Discord members — Patreon Observer tier opens',
    type:          'event',
    state:         'scheduled',
    scheduledDate: d(28),
    releasedDate:  null,
    s3Dest:        null,
    notes:         'Trigger: Discord reaches 100 members. Action: Patreon Observer tier goes live. Tier benefits: monthly in-world transmission from records@somnatek.org. Physical evidence kit when available. Early access to staged drops.',
  },
];

// ─── Write to DynamoDB ────────────────────────────────────────────────────────

/**
 * @param {object} drop - A drop definition object.
 * @returns {Promise<void>}
 */
async function writeDrop(drop) {
  const item = {
    pk:            `DROP#${drop.slug}`,
    slug:          drop.slug,
    title:         drop.title,
    type:          drop.type,
    state:         drop.state,
    scheduledDate: drop.scheduledDate,
    releasedDate:  drop.releasedDate  || null,
    s3Dest:        drop.s3Dest        || null,
    notes:         drop.notes         || null,
    createdAt:     new Date().toISOString(),
  };

  if (dryRun) {
    console.log('[dry-run]', JSON.stringify(item, null, 2));
    return;
  }

  // Check if item already exists — do not overwrite released items
  const existing = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: item.pk },
  }));

  if (existing.Item && existing.Item.state === 'released') {
    console.log(`  skip (already released): ${item.pk}`);
    return;
  }

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  console.log(`  written: ${item.pk}  state=${item.state}  date=${item.scheduledDate}`);
}

async function main() {
  console.log(`Seeding content ledger — launch date: ${LAUNCH.toISOString().slice(0, 10)}`);
  console.log(`Table: ${TABLE}  |  dry-run: ${dryRun}`);
  console.log(`Drops to write: ${DROPS.length}`);
  console.log('');

  for (const drop of DROPS) {
    await writeDrop(drop);
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
