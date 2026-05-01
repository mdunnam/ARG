'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const REGION         = process.env.AWS_REGION || 'us-east-1';
const VISITORS_TABLE = process.env.DYNAMODB_TABLE_VISITORS || 'somnatek-visitors';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://somnatek.org';

// Anonymous records expire after 60 days of inactivity
const ANON_TTL_SECONDS = 60 * 24 * 60 * 60;

// Loose rate limit — max 120 beacon calls per IP per hour (prevents scraper abuse)
const BEACON_RATE_WINDOW = 3600;
const BEACON_RATE_MAX    = 120;

// Known page slugs — anything else is clamped to 'unknown'
const KNOWN_PAGES = new Set([
  'index', 'about', 'research', 'staff', 'patient-resources',
  'closure-notice', 'portal', '404', 'sleep-disorders', 'insurance',
  'ptx-018', '7a-internal', 'correspondence', 'admin',
  'supp-index', 'admin-t1', 'admin-t2', 'admin-t3',
  'protocol-7a', 'supp-010', 'supp-005', 'fax-log', 'restwell',
]);

/**
 * Maps beacon page slugs to the milestone ID they should unlock.
 * Only slugs present here trigger a milestone write.
 */
const MILESTONE_SLUGS = {
  'correspondence': 'correspondence_found',
  'supp-index':     'supp_index_found',
  '7a-internal':    'doc_7a_found',
  'admin-t1':       'admin_t1',
  'admin-t2':       'admin_t2',
  'admin-t3':       'admin_t3',
  'ptx-018':        'recall_accessed',
  'protocol-7a':    'protocol_7a',
  'supp-010':       'supp_010_found',
  'supp-005':       'supp_005_found',
  'fax-log':        'fax_decoded',
  'restwell':       'restwell_found',
};

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

// Milestone registry — must mirror portal-login/index.js. Keep in sync.
const MILESTONES = [
  { id: 'portal_solved',        points: 20, released: true  },
  { id: 'fax_decoded',          points: 15, released: true  },
  { id: 'supp_index_found',     points: 20, released: true  },
  { id: 'doc_7a_found',         points: 15, released: true  },
  { id: 'correspondence_found', points: 25, released: true  },
  { id: 'admin_t1',             points: 10, released: true  },
  { id: 'admin_t2',             points: 20, released: true  },
  { id: 'admin_t3',             points: 35, released: true  },
  { id: 'recall_accessed',      points: 25, released: true  },
  { id: 'protocol_7a',          points: 30, released: true  },
  { id: 'supp_010_found',       points: 35, released: true  },
  { id: 'supp_005_found',       points: 40, released: true  },
  { id: 'restwell_found',       points: 40, released: false },
  { id: 'wexler_found',         points: 40, released: false },
];

const TOTAL_RELEASED_POINTS = MILESTONES
  .filter(m => m.released)
  .reduce((s, m) => s + m.points, 0);

/**
 * Computes % complete based on which released milestones have been achieved.
 * @param {string[]} achieved
 * @returns {number} Integer 0–100.
 */
function computePercent(achieved) {
  if (!TOTAL_RELEASED_POINTS) return 0;
  const set = new Set(achieved);
  const earned = MILESTONES
    .filter(m => m.released && set.has(m.id))
    .reduce((s, m) => s + m.points, 0);
  return Math.round((earned / TOTAL_RELEASED_POINTS) * 100);
}

/**
 * Derives player level from milestone thresholds.
 * @param {string[]} achieved
 * @returns {number}
 */
function computeLevel(achieved) {
  const pct = computePercent(achieved);
  if (pct >= 80) return 4;
  if (pct >= 50) return 3;
  if (pct >= 20) return 2;
  return 1;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Returns the source IP from API Gateway v2 event.
 * @param {object} event
 * @returns {string}
 */
function getClientIp(event) {
  return event.requestContext?.http?.sourceIp || 'unknown';
}

/**
 * Checks and increments the beacon rate-limit counter for this IP.
 * Uses a separate key prefix so it doesn't interfere with puzzle rate limits.
 * @param {string} ipHash
 * @returns {Promise<boolean>} True if allowed.
 */
async function checkBeaconRateLimit(ipHash) {
  const pk  = `BEACON_RL#${ipHash}`;
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + BEACON_RATE_WINDOW;

  const existing = await ddb.send(
    new GetCommand({ TableName: VISITORS_TABLE, Key: { pk } })
  );

  const item = existing.Item;
  if (item && item.count >= BEACON_RATE_MAX) return false;

  if (!item) {
    await ddb.send(
      new PutCommand({ TableName: VISITORS_TABLE, Item: { pk, count: 1, ttl } })
    );
  } else {
    await ddb.send(
      new UpdateCommand({
        TableName: VISITORS_TABLE,
        Key: { pk },
        UpdateExpression: 'SET #c = #c + :inc',
        ExpressionAttributeNames:  { '#c': 'count' },
        ExpressionAttributeValues: { ':inc': 1 },
      })
    );
  }
  return true;
}

/**
 * Appends a milestone to a VISITOR# record if not already present.
 * Safe to call multiple times — idempotent.
 * @param {string} visitorId - VIS-XXXXX identifier.
 * @param {string} milestoneId - Milestone ID string.
 * @returns {Promise<void>}
 */
async function writeMilestoneIfNew(visitorId, milestoneId) {
  const pk = `VISITOR#${visitorId}`;
  const record = await ddb.send(new GetCommand({ TableName: VISITORS_TABLE, Key: { pk } }));
  if (!record.Item) return;
  const existing = record.Item.milestones || [];
  if (existing.includes(milestoneId)) return;
  const updated       = [...existing, milestoneId];
  const percentComplete = computePercent(updated);
  const level           = computeLevel(updated);
  await ddb.send(
    new UpdateCommand({
      TableName:                 VISITORS_TABLE,
      Key:                       { pk },
      UpdateExpression:          'SET milestones = :m, percentComplete = :pc, #lv = :lv',
      ExpressionAttributeNames:  { '#lv': 'level' },
      ExpressionAttributeValues: { ':m': updated, ':pc': percentComplete, ':lv': level },
    })
  );
}

/**
 * Records a page visit on an ANON record (pre-puzzle-solve visitor).
 * Creates the record on first visit. Updates lastSeen and pagesVisited on each visit.
 * @param {string} ipHash  - SHA-256 hash of the visitor's IP.
 * @param {string} page    - Normalised page slug.
 * @param {string} referrer - Referring URL (may be empty).
 * @returns {Promise<void>}
 */
async function upsertAnonRecord(ipHash, page, referrer) {
  const pk  = `ANON#${ipHash}`;
  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + ANON_TTL_SECONDS;

  const existing = await ddb.send(
    new GetCommand({ TableName: VISITORS_TABLE, Key: { pk } })
  );

  if (!existing.Item) {
    await ddb.send(
      new PutCommand({
        TableName: VISITORS_TABLE,
        Item: {
          pk,
          ipHash,
          firstSeen:    now,
          lastSeen:     now,
          referrer:     referrer || '',
          pagesVisited: [page],
          pageViewCount: 1,
          ttl,
        },
      })
    );
    return;
  }

  // Append page only if it's not already the most recent entry (don't spam duplicates
  // from refreshes, but do record if the visitor navigated away and came back)
  const currentPages = existing.Item.pagesVisited || [];
  const lastPage     = currentPages[currentPages.length - 1];
  const appendPage   = lastPage !== page;

  const updateParts = [
    'SET lastSeen = :now',
    'pageViewCount = if_not_exists(pageViewCount, :zero) + :inc',
    '#ttl = :ttl',
  ];
  const exprNames  = { '#ttl': 'ttl' };
  const exprValues = { ':now': now, ':zero': 0, ':inc': 1, ':ttl': ttl };

  if (appendPage) {
    updateParts.push('pagesVisited = list_append(if_not_exists(pagesVisited, :empty), :page)');
    exprValues[':empty'] = [];
    exprValues[':page']  = [page];
  }

  await ddb.send(
    new UpdateCommand({
      TableName:                 VISITORS_TABLE,
      Key:                       { pk },
      UpdateExpression:          updateParts.join(', '),
      ExpressionAttributeNames:  exprNames,
      ExpressionAttributeValues: exprValues,
    })
  );
}

/**
 * Records a page visit on an existing VISITOR record (post-puzzle-solve).
 * @param {string} visitorId - VIS-XXXXX identifier.
 * @param {string} page      - Normalised page slug.
 * @returns {Promise<void>}
 */
async function updateVisitorRecord(visitorId, page) {
  const pk  = `VISITOR#${visitorId}`;
  const now = new Date().toISOString();

  const existing = await ddb.send(
    new GetCommand({ TableName: VISITORS_TABLE, Key: { pk } })
  );

  if (!existing.Item) return; // Stale/unknown visitorId — ignore silently

  const currentPages = existing.Item.pagesVisited || [];
  const lastPage     = currentPages[currentPages.length - 1];
  const appendPage   = lastPage !== page;

  const updateParts = [
    'SET lastSeen = :now',
    'pageViewCount = if_not_exists(pageViewCount, :zero) + :inc',
  ];
  const exprValues = { ':now': now, ':zero': 0, ':inc': 1 };

  if (appendPage) {
    updateParts.push('pagesVisited = list_append(if_not_exists(pagesVisited, :empty), :page)');
    exprValues[':empty'] = [];
    exprValues[':page']  = [page];
  }

  await ddb.send(
    new UpdateCommand({
      TableName:                 VISITORS_TABLE,
      Key:                       { pk },
      UpdateExpression:          updateParts.join(', '),
      ExpressionAttributeValues: exprValues,
    })
  );
}

/**
 * Lambda handler for the Somnatek page beacon endpoint.
 *
 * Accepts POST JSON: { p: pageSlug, r: referrer, v: visitorId }
 * Field names are intentionally terse to keep payload minimal.
 *
 * - Writes/updates an ANON#<ipHash> record for every visitor.
 * - If a valid visitorId (VIS-XXXXX) is provided, also updates the VISITOR# record.
 * - Always returns 204 — the client never needs a response body.
 *
 * @param {object} event - API Gateway HTTP API v2 event.
 * @returns {Promise<object>}
 */
exports.handler = async (event) => {
  const method = event.requestContext?.http?.method?.toUpperCase() || 'POST';

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const clientIp = getClientIp(event);
  const ipHash   = crypto.createHash('sha256').update(clientIp).digest('hex');

  // Rate limit check — silently drop excess, don't reveal limits to client
  try {
    const allowed = await checkBeaconRateLimit(ipHash);
    if (!allowed) return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  } catch (_) {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Parse body — all fields optional; malformed bodies are silently discarded
  let page = 'unknown';
  let referrer = '';
  let visitorId = '';

  try {
    const body = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body || {};

    const rawPage = typeof body.p === 'string'
      ? body.p.trim().toLowerCase().replace(/\.html$/, '').replace(/^\//, '') || 'index'
      : 'unknown';

    page      = KNOWN_PAGES.has(rawPage) ? rawPage : 'unknown';
    referrer  = typeof body.r === 'string' ? body.r.slice(0, 256) : '';
    visitorId = typeof body.v === 'string' ? body.v.trim().toUpperCase() : '';
  } catch (_) {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  try {
    await upsertAnonRecord(ipHash, page, referrer);

    // If the visitor has solved the puzzle, also update their named record
    if (/^VIS-\d{5}$/.test(visitorId)) {
      await updateVisitorRecord(visitorId, page);

      // Write milestone if this page slug triggers one
      const milestoneId = MILESTONE_SLUGS[page];
      if (milestoneId) {
        await writeMilestoneIfNew(visitorId, milestoneId);
      }
    }
  } catch (_) {
    // Fire-and-forget — never surface errors to the client
  }

  return { statusCode: 204, headers: CORS_HEADERS, body: '' };
};
