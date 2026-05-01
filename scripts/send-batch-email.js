#!/usr/bin/env node
/**
 * scripts/send-batch-email.js
 *
 * Sends a Dorsal Health Holdings automated email to all players who have
 * reached a specified response level (1, 2, or 3) in DynamoDB and have not
 * yet received a particular campaign tag.
 *
 * Usage:
 *   node send-batch-email.js --level 2 --campaign week2-followup [--dry-run]
 *   node send-batch-email.js --level 3 --campaign stage3-recall  [--dry-run]
 *
 * Required environment variables:
 *   AWS_PROFILE         AWS credentials profile
 *   AWS_REGION          AWS region (default: us-east-1)
 *   DYNAMODB_TABLE      DynamoDB table name (default: somnatek-visitors)
 *   SES_FROM_ADDRESS    Sending address (default: records@somnatek.org)
 *
 * The --campaign flag is written to each sender's DynamoDB record so the
 * same campaign is never sent twice to the same player.
 *
 * SECURITY: Player emails are stored only as SHA-256 hashes in DynamoDB.
 * This script cannot reconstruct email addresses from the table. It sends
 * only to players whose email address is provided on stdin (one per line),
 * then cross-references the hash to confirm eligibility.
 *
 * Usage with address list (required for actual sends):
 *   cat addresses.txt | node send-batch-email.js --level 2 --campaign week2
 *
 * addresses.txt is a plain-text file with one email per line (never committed).
 */

'use strict';

const readline = require('readline');
const crypto   = require('crypto');
const { DynamoDBClient }                     = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand,
        UpdateCommand, ScanCommand }          = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand }        = require('@aws-sdk/client-ses');

const REGION       = process.env.AWS_REGION        || 'us-east-1';
const TABLE        = process.env.DYNAMODB_TABLE    || 'somnatek-visitors';
const FROM_ADDRESS = process.env.SES_FROM_ADDRESS  || 'records@somnatek.org';

const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const levelArg = args[args.indexOf('--level')    + 1];
const campaign = args[args.indexOf('--campaign') + 1];

if (!levelArg || !campaign) {
  console.error('Usage: node send-batch-email.js --level <1|2|3> --campaign <name> [--dry-run]');
  console.error('       Pipe email addresses via stdin (one per line) for real sends.');
  process.exit(1);
}

const targetLevel = parseInt(levelArg, 10);
if (![1, 2, 3].includes(targetLevel)) {
  console.error('--level must be 1, 2, or 3');
  process.exit(1);
}

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const ses = new SESClient({ region: REGION });

/**
 * Returns the email body and subject for a given campaign and level.
 * All copy is written in the Dorsal Records Management System voice.
 * @param {string} campaignName
 * @param {number} level
 * @returns {{ subject: string, body: string }}
 */
function getCampaignContent(campaignName, level) {
  const refNum = `DHHRMS-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;

  if (campaignName === 'week2-followup') {
    return {
      subject: 'Records Management — Follow-up: Inquiry Status Update',
      body: [
        'This is an automated status update from Dorsal Health Holdings LLC Records Management.',
        '',
        'Your inquiry regarding former Somnatek Sleep Health Center records has been received',
        'and assigned to active archive review. Records falling under the Somnatek-Dorsal',
        'transfer agreement (ref: DH-FAC-2014) are processed separately from standard',
        'clinical records and may require additional processing time with no fixed estimate.',
        '',
        'If your inquiry relates to research participation records, please note that',
        'those materials are classified under the active archive designation. To expedite',
        'processing of research-related records, please provide your study reference number',
        'if available. Study reference numbers follow the format SHC-[TYPE]-[YEAR]-[ID].',
        '',
        'No further action is required at this time. You will be contacted if additional',
        'information is needed.',
        '',
        'Dorsal Health Holdings LLC',
        'Records Management System / Automated Response Unit',
        refNum,
      ].join('\n'),
    };
  }

  if (campaignName === 'stage3-recall') {
    const refNum413 = `DHHRMS-${Math.floor(100000 + Math.random() * 900000)}-413`;
    return {
      subject: 'Records Management — Active Recall: Scheduled Review Notification',
      body: [
        'This is an automated notification from Dorsal Health Holdings LLC Records Management.',
        '',
        'Your file has been reviewed and assigned to the active recall designation.',
        'This designation applies to files currently within the scheduled review cycle',
        'under the Somnatek-Dorsal transfer agreement, exhibit C.',
        '',
        'Your next recall window has been entered into the scheduling queue.',
        'You will receive a formal appointment confirmation when your window is assigned.',
        'Appointments are conducted at Room 413, administrative designation.',
        '',
        'In the interim, no action is required. If you have received environmental',
        'recall indicators since your last contact with this system, note them for',
        'reference. They are consistent with an active file status.',
        '',
        'PLEASE WAIT TO BE RECALLED.',
        '',
        'Dorsal Health Holdings LLC',
        'Records Management System / Automated Response Unit',
        refNum413,
      ].join('\n'),
    };
  }

  if (campaignName === 'ortiz-notification') {
    return {
      subject: 'Records Management — File Activity Notification',
      body: [
        'This is an automated notification from Dorsal Health Holdings LLC Records Management.',
        '',
        'Activity has been noted on your file. This notification does not require a response.',
        '',
        'If you have previously submitted a records inquiry, your file remains under review.',
        'If you have not previously submitted a records inquiry, this notification indicates',
        'that your file has been flagged for standard active archive review.',
        '',
        'You may wish to review the patient support forum archive at restwell.net for',
        'communications relevant to former study participants.',
        '',
        'No further action is required at this time.',
        '',
        'Dorsal Health Holdings LLC',
        'Records Management System / Automated Response Unit',
        refNum,
      ].join('\n'),
    };
  }

  // Generic fallback
  return {
    subject: 'Records Management — Account Status Notification',
    body: [
      'This is an automated notification from Dorsal Health Holdings LLC Records Management.',
      '',
      'This message is to confirm that your records inquiry is on file.',
      'No further action is required at this time.',
      '',
      'Dorsal Health Holdings LLC',
      'Records Management System / Automated Response Unit',
      refNum,
    ].join('\n'),
  };
}

/**
 * Sends a single email via SES.
 * @param {string} toAddress - Recipient email address.
 * @param {{ subject: string, body: string }} content - Email content.
 * @returns {Promise<void>}
 */
async function sendEmail(toAddress, content) {
  await ses.send(new SendEmailCommand({
    Source:      FROM_ADDRESS,
    Destination: { ToAddresses: [toAddress] },
    Message: {
      Subject: { Data: content.subject,   Charset: 'UTF-8' },
      Body:    { Text: { Data: content.body, Charset: 'UTF-8' } },
    },
  }));
}

/**
 * Marks a player as having received this campaign so it won't be sent again.
 * @param {string} pk - DynamoDB primary key.
 * @param {string} campaignName - Campaign identifier.
 * @returns {Promise<void>}
 */
async function markSent(pk, campaignName) {
  await ddb.send(new UpdateCommand({
    TableName:        TABLE,
    Key:              { pk },
    UpdateExpression: 'SET campaigns = list_append(if_not_exists(campaigns, :empty), :c)',
    ExpressionAttributeValues: {
      ':c':     [campaignName],
      ':empty': [],
    },
  }));
}

/**
 * Reads email addresses from stdin (one per line).
 * @returns {Promise<string[]>}
 */
function readAddressesFromStdin() {
  return new Promise(resolve => {
    if (process.stdin.isTTY) {
      resolve([]);
      return;
    }
    const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
    const addrs = [];
    rl.on('line', line => { const t = line.trim(); if (t) addrs.push(t); });
    rl.on('close', () => resolve(addrs));
  });
}

async function main() {
  console.log(`Campaign: ${campaign}  Level: ${targetLevel}  Dry-run: ${dryRun}`);

  const addresses = await readAddressesFromStdin();

  if (addresses.length === 0) {
    console.log('No addresses on stdin — running eligibility report only (no emails sent).');
  } else {
    console.log(`Addresses provided: ${addresses.length}`);
  }

  let sent = 0;
  let skipped = 0;

  for (const email of addresses) {
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    const pk   = `EMAIL#${hash}`;

    const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { pk } }));
    const record = result.Item;

    if (!record) {
      console.log(`  skip (no record): ${email.slice(0, 4)}***`);
      skipped++;
      continue;
    }

    if ((record.level || 1) < targetLevel) {
      console.log(`  skip (level ${record.level} < ${targetLevel}): ${email.slice(0, 4)}***`);
      skipped++;
      continue;
    }

    if ((record.campaigns || []).includes(campaign)) {
      console.log(`  skip (already sent ${campaign}): ${email.slice(0, 4)}***`);
      skipped++;
      continue;
    }

    const content = getCampaignContent(campaign, record.level || targetLevel);

    console.log(`  send (level=${record.level}): ${email.slice(0, 4)}***  subject="${content.subject}"`);

    if (!dryRun) {
      await sendEmail(email, content);
      await markSent(pk, campaign);
    }

    sent++;
  }

  console.log(`\nDone. Sent: ${sent}  Skipped: ${skipped}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
