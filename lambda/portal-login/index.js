'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const REGION = process.env.AWS_REGION || 'us-east-1';
const VISITORS_TABLE = process.env.DYNAMODB_TABLE_VISITORS;
const PUZZLE_ANSWER_SALT = process.env.PUZZLE_ANSWER_SALT;
const PORTAL_ANSWER_HASH = process.env.PORTAL_ANSWER_HASH;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://somnatek.org';

const RATE_LIMIT_WINDOW_SECONDS = 900; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Generates a VIS-XXXXX visitor ID with a cryptographically random five-digit number.
 * Uses crypto.randomBytes to avoid predictable ID sequencing.
 * @returns {string}
 */
function generateVisitorId() {
  const n = 10000 + (crypto.randomBytes(3).readUIntBE(0, 3) % 90000);
  return `VIS-${String(n).padStart(5, '0')}`;
}

/**
 * Hashes a participant ID with the puzzle answer salt.
 * @param {string} id - Normalized participant ID.
 * @returns {string} Hex SHA-256 digest.
 */
function hashAnswer(id) {
  return crypto
    .createHash('sha256')
    .update(`${PUZZLE_ANSWER_SALT}${id}`)
    .digest('hex');
}

/**
 * Extracts the caller IP from the API Gateway HTTP API event.
 * @param {object} event - API Gateway v2 event.
 * @returns {string}
 */
function getClientIp(event) {
  return (
    (event.requestContext &&
      event.requestContext.http &&
      event.requestContext.http.sourceIp) ||
    'unknown'
  );
}

/**
 * Checks and increments the rate-limit counter for the given IP hash.
 * Allows up to RATE_LIMIT_MAX_ATTEMPTS per RATE_LIMIT_WINDOW_SECONDS.
 * @param {string} ipHash - SHA-256 hash of the client IP.
 * @returns {Promise<boolean>} True if the request is allowed.
 */
async function checkRateLimit(ipHash) {
  const pk = `RATELIMIT#${ipHash}`;
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + RATE_LIMIT_WINDOW_SECONDS;

  const result = await ddb.send(
    new GetCommand({ TableName: VISITORS_TABLE, Key: { pk } })
  );

  const existing = result.Item;

  if (existing && existing.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  if (!existing) {
    await ddb.send(
      new PutCommand({ TableName: VISITORS_TABLE, Item: { pk, attempts: 1, ttl } })
    );
  } else {
    await ddb.send(
      new UpdateCommand({
        TableName: VISITORS_TABLE,
        Key: { pk },
        UpdateExpression: 'SET attempts = attempts + :inc',
        ExpressionAttributeValues: { ':inc': 1 },
      })
    );
  }

  return true;
}

/**
 * Creates or retrieves a visitor record for a successful solve.
 * Idempotent per IP — the same IP always gets the same VIS ID.
 * Promotes any existing ANON# pre-solve record: copies pagesVisited,
 * firstSeen, and referrer so the full journey is preserved.
 * @param {string} ipHash - SHA-256 hash of the client IP.
 * @returns {Promise<string>} The visitor ID.
 */
async function getOrCreateVisitor(ipHash) {
  const lookupKey = `IPSOLVE#${ipHash}`;

  const existing = await ddb.send(
    new GetCommand({ TableName: VISITORS_TABLE, Key: { pk: lookupKey } })
  );

  if (existing.Item && existing.Item.visitorId) {
    return existing.Item.visitorId;
  }

  const visitorId = generateVisitorId();
  const now = new Date().toISOString();

  // Lift pre-solve browse history from the anonymous record if it exists
  let pagesVisited = [];
  let firstSeen    = now;
  let referrer     = '';
  try {
    const anon = await ddb.send(
      new GetCommand({ TableName: VISITORS_TABLE, Key: { pk: `ANON#${ipHash}` } })
    );
    if (anon.Item) {
      pagesVisited = anon.Item.pagesVisited || [];
      firstSeen    = anon.Item.firstSeen    || now;
      referrer     = anon.Item.referrer     || '';
    }
  } catch (_) { /* non-fatal — proceed without history */ }

  // Compute initial milestone list and % complete
  const milestones       = ['portal_solved'];
  const percentComplete  = computePercent(milestones);
  const level            = computeLevel(milestones);

  await ddb.send(
    new PutCommand({
      TableName: VISITORS_TABLE,
      Item: {
        pk: `VISITOR#${visitorId}`,
        visitorId,
        level,
        source:         'portal',
        createdAt:      now,
        firstSeen,
        lastSeen:       now,
        referrer,
        status:         'active',
        milestones,
        percentComplete,
        pagesVisited,
        pageViewCount:  pagesVisited.length,
      },
    })
  );

  // Secondary index so the same IP always retrieves its original visitor ID
  await ddb.send(
    new PutCommand({
      TableName: VISITORS_TABLE,
      Item: { pk: lookupKey, visitorId, createdAt: now },
    })
  );

  return visitorId;
}

/**
 * Milestone registry — single source of truth for all puzzle gates.
 * released:true means the content is live and players can achieve it.
 * points contribute to percentComplete calculation.
 */
const MILESTONES = [
  { id: 'portal_solved',        points: 20, released: true  },
  { id: 'fax_decoded',          points: 15, released: false },
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
 * @param {string[]} achieved - Array of milestone IDs.
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

/**
 * Lambda handler for the Somnatek portal login puzzle endpoint.
 *
 * Accepts POST JSON { id: string }, validates the submitted participant ID
 * against the hashed correct answer, rate-limits by IP, issues a VIS-XXXXX
 * visitor ID on success, and returns a redirect URL to the first unlock page.
 *
 * @param {object} event - API Gateway HTTP API v2 event.
 * @returns {Promise<object>} API Gateway response object.
 */
exports.handler = async (event) => {
  // CORS preflight
  if (
    event.requestContext &&
    event.requestContext.http &&
    event.requestContext.http.method === 'OPTIONS'
  ) {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const clientIp = getClientIp(event);
  const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

  // Rate limit
  let allowed;
  try {
    allowed = await checkRateLimit(ipHash);
  } catch (_err) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Service temporarily unavailable.' }),
    };
  }

  if (!allowed) {
    return {
      statusCode: 429,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Too many requests.' }),
    };
  }

  // Parse body
  let submittedId;
  try {
    const body =
      typeof event.body === 'string'
        ? JSON.parse(event.body)
        : event.body || {};
    submittedId =
      typeof body.id === 'string' ? body.id.trim().toUpperCase() : '';
  } catch (_err) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid request.' }),
    };
  }

  if (!submittedId) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid request.' }),
    };
  }

  // Validate answer — compare hashes only, never compare plaintext
  if (hashAnswer(submittedId) !== PORTAL_ANSWER_HASH) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Participant ID not recognized.' }),
    };
  }

  // Issue or retrieve visitor ID
  let visitorId;
  try {
    visitorId = await getOrCreateVisitor(ipHash);
  } catch (_err) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Service temporarily unavailable.' }),
    };
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      redirect: `/portal/ptx-018/?v=${visitorId}`,
      visitorId,
    }),
  };
};
