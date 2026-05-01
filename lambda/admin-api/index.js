'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} = require('@aws-sdk/client-cloudwatch');
const {
  CostExplorerClient,
  GetCostAndUsageCommand,
} = require('@aws-sdk/client-cost-explorer');

const REGION               = process.env.AWS_REGION             || 'us-east-1';
const VISITORS_TABLE       = process.env.DYNAMODB_TABLE_VISITORS || 'somnatek-visitors';
const ADMIN_SECRET         = process.env.ADMIN_SECRET            || '';
const PORTAL_FUNCTION_NAME = process.env.PORTAL_FUNCTION_NAME   || '';
const BEACON_FUNCTION_NAME = process.env.BEACON_FUNCTION_NAME   || '';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const cw  = new CloudWatchClient({ region: REGION });
const ce  = new CostExplorerClient({ region: 'us-east-1' });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  'https://somnatek.org',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  'Content-Type': 'application/json',
};

// ----------------------------------------------------------------
// Milestone registry — keep in sync with portal-login/index.js
// ----------------------------------------------------------------
const MILESTONES = [
  { id: 'portal_solved',        label: 'Portal unlocked',               points: 20, phase: 1, released: true  },
  { id: 'fax_decoded',          label: 'Fax line decoded',               points: 15, phase: 1, released: true  },
  { id: 'supp_index_found',     label: 'Supplemental index accessed',    points: 20, phase: 1, released: true  },
  { id: 'doc_7a_found',         label: '7A internal doc accessed',       points: 15, phase: 1, released: true  },
  { id: 'correspondence_found', label: 'Email archive accessed',         points: 25, phase: 1, released: true  },
  { id: 'admin_t1',             label: 'Admin portal \u2014 Tier 1',    points: 10, phase: 1, released: true  },
  { id: 'admin_t2',             label: 'Admin portal \u2014 Tier 2',    points: 20, phase: 1, released: true  },
  { id: 'admin_t3',             label: 'Admin portal \u2014 Tier 3',    points: 35, phase: 1, released: true  },
  { id: 'recall_accessed',      label: 'Recall summaries found',         points: 25, phase: 1, released: true  },
  { id: 'protocol_7a',          label: 'Protocol 7A unlocked',           points: 30, phase: 1, released: true  },
  { id: 'supp_010_found',       label: 'Night floor access report found',points: 35, phase: 1, released: true  },
  { id: 'supp_005_found',       label: 'Termination reports decoded',    points: 40, phase: 1, released: true  },
  { id: 'restwell_found',       label: 'RestWell forum found',           points: 40, phase: 2, released: false },
  { id: 'wexler_found',         label: 'Wexler archive found',           points: 40, phase: 3, released: false },
];

const TOTAL_RELEASED_POINTS = MILESTONES
  .filter(m => m.released)
  .reduce((s, m) => s + m.points, 0);

const TOTAL_ALL_POINTS = MILESTONES.reduce((s, m) => s + m.points, 0);

/**
 * Validates the admin token using constant-time comparison.
 * If ADMIN_SECRET is not configured, all requests are denied (fail-closed).
 * @param {object} headers - Lower-cased request headers.
 * @returns {boolean}
 */
function isAuthorized(headers) {
  if (!ADMIN_SECRET) return false;
  const token = (headers['x-admin-token'] || '').trim();
  if (token.length !== ADMIN_SECRET.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ ADMIN_SECRET.charCodeAt(i);
  }
  return diff === 0;
}

/** @returns {object} */
function unauthorized() {
  return {
    statusCode: 401,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: 'Unauthorized.' }),
  };
}

/**
 * Full table scan partitioned by record type.
 * Returns named visitors, anonymous visitors, milestone distribution,
 * page view aggregates, and referrer stats.
 * @returns {Promise<object>}
 */
async function getVisitorData() {
  const all = [];
  let lastKey;
  do {
    const resp = await ddb.send(new ScanCommand({
      TableName: VISITORS_TABLE,
      ExclusiveStartKey: lastKey,
    }));
    all.push(...(resp.Items || []));
    lastKey = resp.LastEvaluatedKey;
  } while (lastKey);

  const visitorItems = all.filter(i => i.pk?.startsWith('VISITOR#'));
  const anonItems    = all.filter(i => i.pk?.startsWith('ANON#'));

  visitorItems.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  anonItems.sort((a, b)    => (b.firstSeen || '').localeCompare(a.firstSeen || ''));

  // Milestone distribution
  const milestoneCounts = {};
  for (const m of MILESTONES) milestoneCounts[m.id] = 0;
  for (const v of visitorItems) {
    for (const mid of (v.milestones || [])) {
      if (mid in milestoneCounts) milestoneCounts[mid]++;
    }
  }

  // Page view aggregation across all record types
  const pageCounts = {};
  for (const item of [...visitorItems, ...anonItems]) {
    for (const p of (item.pagesVisited || [])) {
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }
  }
  const pageViewStats = Object.entries(pageCounts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views);

  // Referrer aggregation
  const refCounts = {};
  for (const item of [...visitorItems, ...anonItems]) {
    if (item.referrer) {
      const ref = item.referrer.slice(0, 80);
      refCounts[ref] = (refCounts[ref] || 0) + 1;
    }
  }
  const referrerStats = Object.entries(refCounts)
    .map(([ref, count]) => ({ ref, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Status counts
  const statusCounts = {};
  for (const v of visitorItems) {
    const s = v.status || 'unknown';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  return {
    totalNamed:      visitorItems.length,
    totalAnon:       anonItems.length,
    totalReleased:   TOTAL_RELEASED_POINTS,
    totalAll:        TOTAL_ALL_POINTS,
    milestones:      MILESTONES,
    milestoneCounts,
    statusCounts,
    pageViewStats,
    referrerStats,
    visitors: visitorItems.map(v => ({
      visitorId:       v.visitorId,
      status:          v.status          || 'unknown',
      level:           v.level           || 1,
      source:          v.source          || 'unknown',
      createdAt:       v.createdAt       || null,
      firstSeen:       v.firstSeen       || null,
      lastSeen:        v.lastSeen        || null,
      referrer:        v.referrer        || '',
      milestones:      v.milestones      || [],
      percentComplete: v.percentComplete || 0,
      pagesVisited:    v.pagesVisited    || [],
      pageViewCount:   v.pageViewCount   || 0,
    })),
    anon: anonItems.map(a => ({
      ipPrefix:      (a.ipHash || '').slice(0, 8) + '…',
      firstSeen:     a.firstSeen     || null,
      lastSeen:      a.lastSeen      || null,
      referrer:      a.referrer      || '',
      pagesVisited:  a.pagesVisited  || [],
      pageViewCount: a.pageViewCount || 0,
    })),
  };
}

/**
 * Returns Lambda invocation metrics for portal-login and beacon functions
 * over the past 30 days, aggregated by day.
 * @returns {Promise<object>}
 */
async function getLambdaMetrics() {
  const end   = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  /**
   * @param {string} fnName
   * @param {string} metricName
   * @param {string} stat
   */
  async function fetchMetric(fnName, metricName, stat) {
    if (!fnName) return [];
    const resp = await cw.send(new GetMetricStatisticsCommand({
      Namespace:  'AWS/Lambda',
      MetricName: metricName,
      Dimensions: [{ Name: 'FunctionName', Value: fnName }],
      StartTime:  start,
      EndTime:    end,
      Period:     86400,
      Statistics: [stat],
    }));
    return (resp.Datapoints || [])
      .sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp))
      .map(dp => ({ date: dp.Timestamp, value: dp[stat] || 0 }));
  }

  const [portalInv, portalErr, beaconInv, beaconErr] = await Promise.all([
    fetchMetric(PORTAL_FUNCTION_NAME, 'Invocations', 'Sum'),
    fetchMetric(PORTAL_FUNCTION_NAME, 'Errors',      'Sum'),
    fetchMetric(BEACON_FUNCTION_NAME, 'Invocations', 'Sum'),
    fetchMetric(BEACON_FUNCTION_NAME, 'Errors',      'Sum'),
  ]);

  return {
    portal: {
      totalInvocations: portalInv.reduce((s, d) => s + d.value, 0),
      totalErrors:      portalErr.reduce((s, d) => s + d.value, 0),
      invocations: portalInv,
      errors:      portalErr,
    },
    beacon: {
      totalInvocations: beaconInv.reduce((s, d) => s + d.value, 0),
      totalErrors:      beaconErr.reduce((s, d) => s + d.value, 0),
      invocations: beaconInv,
    },
  };
}

/**
 * Returns AWS month-to-date cost grouped by service, plus 6-month trend.
 * @returns {Promise<object>}
 */
async function getCostData() {
  const today         = new Date();
  const firstOfMonth  = new Date(today.getFullYear(), today.getMonth(), 1);
  const todayStr      = today.toISOString().slice(0, 10);
  const startStr      = firstOfMonth.toISOString().slice(0, 10);
  const trendStart    = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const trendStartStr = trendStart.toISOString().slice(0, 10);

  const [mtdResp, trendResp] = await Promise.all([
    ce.send(new GetCostAndUsageCommand({
      TimePeriod:  { Start: startStr, End: todayStr },
      Granularity: 'MONTHLY',
      GroupBy:     [{ Type: 'DIMENSION', Key: 'SERVICE' }],
      Metrics:     ['UnblendedCost'],
    })),
    ce.send(new GetCostAndUsageCommand({
      TimePeriod:  { Start: trendStartStr, End: todayStr },
      Granularity: 'MONTHLY',
      Metrics:     ['UnblendedCost'],
    })),
  ]);

  const byService = [];
  for (const result of mtdResp.ResultsByTime || []) {
    for (const group of result.Groups || []) {
      const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || '0');
      if (amount > 0) byService.push({ service: group.Keys[0], amount });
    }
  }
  byService.sort((a, b) => b.amount - a.amount);
  const mtdTotal = byService.reduce((s, g) => s + g.amount, 0);

  const trend = (trendResp.ResultsByTime || []).map(r => ({
    month:  r.TimePeriod.Start.slice(0, 7),
    amount: parseFloat(r.Total?.UnblendedCost?.Amount || '0'),
  }));

  return { mtdTotal, byService, trend };
}

/**
 * Lambda handler for the Somnatek admin API.
 *
 * Routes via ?action= query param:
 *   visitors — named + anon records, milestones, page stats, referrers
 *   metrics  — Lambda CloudWatch stats (30 days)
 *   costs    — AWS Cost Explorer MTD by service
 *   all      — all three combined (default)
 *
 * @param {object} event - API Gateway HTTP API v2 event.
 * @returns {Promise<object>}
 */

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method?.toUpperCase() || 'GET';
  if (method === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };

  const headers = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    headers[k.toLowerCase()] = v;
  }
  if (!isAuthorized(headers)) return unauthorized();

  const action = (event.queryStringParameters?.action || 'all').toLowerCase();

  try {
    const data = {};
    if (action === 'visitors' || action === 'all') data.visitors = await getVisitorData();
    if (action === 'metrics'  || action === 'all') data.metrics  = await getLambdaMetrics();
    if (action === 'costs'    || action === 'all') data.costs    = await getCostData();

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) };
  } catch (_err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal error.' }) };
  }
};

