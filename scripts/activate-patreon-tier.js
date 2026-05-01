#!/usr/bin/env node
/**
 * scripts/activate-patreon-tier.js
 *
 * Fires when the Discord server reaches 100 members (or on manual invocation).
 * Actions:
 *   1. Sets the global ARG state flag patreon_observer_active = true in DynamoDB
 *   2. Updates the content ledger entry for event-discord-100-milestone to released
 *   3. Sets recalled_active milestone to released:true in the portal Lambda env
 *      (done by updating the DynamoDB marker — operator still needs to deploy
 *       the Lambda update that flips released:false → true for recalled_active)
 *   4. Sends an announcement email to all opt-in players (all EMAIL# records)
 *      via the observer-announcement campaign
 *
 * Usage:
 *   node activate-patreon-tier.js [--dry-run]
 *   cat opt-in-addresses.txt | node activate-patreon-tier.js [--dry-run]
 *
 * Environment variables:
 *   AWS_PROFILE        AWS credentials profile
 *   AWS_REGION         AWS region (default: us-east-1)
 *   DYNAMODB_TABLE     Table name (default: somnatek-visitors)
 *   SES_FROM_ADDRESS   Sending address (default: records@somnatek.org)
 */

'use strict';

const readline = require('readline');
const crypto   = require('crypto');
const { DynamoDBClient }                      = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand,
        UpdateCommand, ScanCommand }           = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand }         = require('@aws-sdk/client-ses');

const REGION       = process.env.AWS_REGION       || 'us-east-1';
const TABLE        = process.env.DYNAMODB_TABLE   || 'somnatek-visitors';
const FROM_ADDRESS = process.env.SES_FROM_ADDRESS || 'records@somnatek.org';

const dryRun = process.argv.includes('--dry-run');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const ses = new SESClient({ region: REGION });

/**
 * Reads email addresses from stdin (one per line).
 * @returns {Promise<string[]>}
 */
function readAddressesFromStdin() {
  return new Promise(resolve => {
    if (process.stdin.isTTY) { resolve([]); return; }
    const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
    const addrs = [];
    rl.on('line', line => { const t = line.trim(); if (t) addrs.push(t); });
    rl.on('close', () => resolve(addrs));
  });
}

/**
 * Marks the global patreon observer tier as active in DynamoDB.
 * @returns {Promise<void>}
 */
async function setGlobalFlag() {
  console.log('  writing GLOBAL#state patreon_observer_active=true');
  if (dryRun) return;
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk:                     'GLOBAL#state',
      patreon_observer_active: true,
      patreon_activated_at:   new Date().toISOString(),
      stage:                  3,
    },
  }));
}

/**
 * Marks the 100-member milestone drop as released in the ledger.
 * @returns {Promise<void>}
 */
async function releaseMilestoneDrop() {
  console.log('  marking DROP#event-discord-100-milestone as released');
  if (dryRun) return;
  await ddb.send(new UpdateCommand({
    TableName:        TABLE,
    Key:              { pk: 'DROP#event-discord-100-milestone' },
    UpdateExpression: 'SET #s = :r, releasedDate = :dt',
    ExpressionAttributeNames:  { '#s': 'state' },
    ExpressionAttributeValues: {
      ':r':  'released',
      ':dt': new Date().toISOString().slice(0, 10),
    },
  }));
}

/**
 * Sends the Observer tier launch announcement to a list of opt-in addresses.
 * @param {string[]} addresses
 * @returns {Promise<void>}
 */
async function sendAnnouncements(addresses) {
  if (addresses.length === 0) {
    console.log('  no addresses — skipping email sends');
    return;
  }

  const refNum = `DHHRMS-${Math.floor(100000 + Math.random() * 900000)}-${new Date().getFullYear()}`;
  const subject = 'Dorsal Health Holdings — Active Archive: Observer Designation Available';
  const body = [
    'This is a notification from Dorsal Health Holdings LLC Records Management.',
    '',
    'An expanded access designation is now available for former Somnatek Sleep Health',
    'Center patients and research participants who wish to maintain an active inquiry',
    'status with the records management system.',
    '',
    'The Observer designation provides monthly administrative transmissions from the',
    'Dorsal Health Holdings records archive. Transmissions include materials relevant',
    'to former study participants and periodic updates on active recall scheduling.',
    '',
    'Observer designation is available at patreon.com/somnatek.',
    '',
    'Your existing inquiry file remains on record. No action is required if you do',
    'not wish to activate the Observer designation.',
    '',
    'PLEASE WAIT TO BE RECALLED.',
    '',
    'Dorsal Health Holdings LLC',
    'Records Management System / Automated Response Unit',
    refNum,
  ].join('\n');

  let sent = 0;
  for (const email of addresses) {
    console.log(`  send announcement: ${email.slice(0, 4)}***`);
    if (!dryRun) {
      try {
        await ses.send(new SendEmailCommand({
          Source:      FROM_ADDRESS,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body:    { Text: { Data: body,    Charset: 'UTF-8' } },
          },
        }));
        sent++;
      } catch (err) {
        console.error(`  send failed for ${email.slice(0, 4)}***: ${err.message}`);
      }
    } else {
      sent++;
    }
  }

  console.log(`  sent: ${sent} / ${addresses.length}`);
}

async function main() {
  console.log(`Activating Patreon Observer tier  [dry-run: ${dryRun}]`);
  const addresses = await readAddressesFromStdin();
  console.log(`Opt-in addresses: ${addresses.length}`);
  console.log('');

  await setGlobalFlag();
  await releaseMilestoneDrop();
  await sendAnnouncements(addresses);

  console.log('\nDone.');
  console.log('');
  console.log('NEXT MANUAL STEPS:');
  console.log('  1. Create Patreon page: patreon.com/somnatek');
  console.log('     Use tier copy from scripts/patreon-observer-tier.txt');
  console.log('  2. Deploy portal-login Lambda with recalled_active released:true');
  console.log('     cd infra && npx cdk deploy SomnatekPortalStack');
  console.log('     (after editing lambda/portal-login/index.js line for recalled_active)');
  console.log('  3. Post in Discord #announcements:');
  console.log('     "SYSTEM: Patreon Observer tier is now open. patreon.com/somnatek"');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
