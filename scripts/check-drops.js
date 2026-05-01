#!/usr/bin/env node
/**
 * scripts/check-drops.js
 *
 * Lists all DROP# entries from the content ledger and shows which are
 * overdue (scheduledDate <= today and state != released).
 *
 * Usage:
 *   node check-drops.js [--overdue-only]
 *
 * Environment variables:
 *   AWS_PROFILE    AWS credentials profile
 *   AWS_REGION     AWS region (default: us-east-1)
 *   DYNAMODB_TABLE Table name (default: somnatek-visitors)
 */

'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE  = process.env.DYNAMODB_TABLE || 'somnatek-visitors';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const overdueOnly = process.argv.includes('--overdue-only');
const today = new Date().toISOString().slice(0, 10);

async function main() {
  const result = await ddb.send(new ScanCommand({
    TableName:        TABLE,
    FilterExpression: 'begins_with(pk, :p)',
    ExpressionAttributeValues: { ':p': 'DROP#' },
  }));

  const drops = (result.Items || []).sort((a, b) =>
    (a.scheduledDate || '').localeCompare(b.scheduledDate || ''));

  let shown = 0;
  for (const d of drops) {
    const overdue = d.scheduledDate <= today && d.state !== 'released';
    if (overdueOnly && !overdue) continue;

    const tag = d.state === 'released' ? '[released]'
      : overdue                        ? '[OVERDUE ]'
      : '[pending ]';

    console.log(`${tag}  ${d.scheduledDate}  ${d.slug.padEnd(40)}  ${d.title}`);
    shown++;
  }

  if (shown === 0) console.log(overdueOnly ? 'No overdue drops.' : 'No drops found.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
