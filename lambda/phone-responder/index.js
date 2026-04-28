'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const REGION = process.env.AWS_REGION || 'us-east-1';
const VISITORS_TABLE = process.env.DYNAMODB_TABLE_VISITORS;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/**
 * Level 3 — caller has discovered deep ARG lore.
 * These are matched against the caller's stored note field, set externally
 * when a player links their phone number via the portal or email system.
 * Phone callers cannot trigger level 3 by calling alone — they must be
 * promoted by the ARG operator or via the portal puzzle.
 */

/**
 * Retrieves caller state from DynamoDB by hashed phone number.
 * Phone numbers are never stored in plaintext.
 * @param {string} callerHash - SHA-256 hash of the caller's E.164 phone number.
 * @returns {Promise<object>} The caller state record, or a fresh default.
 */
async function getCallerState(callerHash) {
  try {
    const result = await ddb.send(new GetCommand({
      TableName: VISITORS_TABLE,
      Key: { pk: `PHONE#${callerHash}` },
    }));
    return result.Item || {
      pk: `PHONE#${callerHash}`,
      level: 1,
      callCount: 0,
      firstCall: '',
      lastCall: '',
    };
  } catch {
    return {
      pk: `PHONE#${callerHash}`,
      level: 1,
      callCount: 0,
      firstCall: '',
      lastCall: '',
    };
  }
}

/**
 * Updates caller state in DynamoDB after a completed call.
 * @param {object} state - Existing state record.
 * @param {number} level - The level triggered by this call.
 * @returns {Promise<void>}
 */
async function saveCallerState(state, level) {
  const now = new Date().toISOString();
  try {
    await ddb.send(new PutCommand({
      TableName: VISITORS_TABLE,
      Item: {
        ...state,
        level: Math.max(state.level || 1, level),
        callCount: (state.callCount || 0) + 1,
        firstCall: state.firstCall || now,
        lastCall: now,
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 3600),
      },
    }));
  } catch {
    // Non-fatal — call still proceeds even if state cannot be saved
  }
}

/**
 * Returns the SSML message for the given response level.
 * All three levels sound like automated clinic recordings.
 * The effect of level 3 comes from the content being wrong, not the delivery being different.
 * @param {number} level - Response level (1, 2, or 3).
 * @returns {string} SSML string to be spoken by Amazon Polly via Connect.
 */
function getSsml(level) {
  if (level === 3) {
    return [
      '<speak>',
      '  <prosody rate="90%">',
      '    You have reached Somnatek Sleep Health Center.',
      '    <break time="700ms"/>',
      '    Your file is current.',
      '    <break time="1200ms"/>',
      '    Your next recall window has been scheduled.',
      '    <break time="600ms"/>',
      '    Please wait to be recalled.',
      '    <break time="2500ms"/>',
      '    <prosody rate="85%" pitch="-2st">',
      '      Please wait to be recalled.',
      '    </prosody>',
      '    <break time="4s"/>',
      '  </prosody>',
      '</speak>',
    ].join('\n');
  }

  if (level === 2) {
    return [
      '<speak>',
      '  <prosody rate="95%">',
      '    You have reached Somnatek Sleep Health Center.',
      '    <break time="500ms"/>',
      '    Our offices are no longer in operation.',
      '    <break time="400ms"/>',
      '    Your inquiry has been noted.',
      '    <break time="800ms"/>',
      '    Research participation records are maintained under active archive classification.',
      '    <break time="400ms"/>',
      '    Processing timelines for active archive materials are not fixed.',
      '    <break time="400ms"/>',
      '    Please do not attempt to contact clinical staff directly.',
      '    <break time="500ms"/>',
      '    Thank you for contacting Somnatek Sleep Health Center.',
      '  </prosody>',
      '</speak>',
    ].join('\n');
  }

  // Level 1 — standard closure message
  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    You have reached Somnatek Sleep Health Center.',
    '    <break time="500ms"/>',
    '    Our offices are no longer in operation.',
    '    <break time="400ms"/>',
    '    For records transfer inquiries, please contact Dorsal Health Holdings LLC',
    '    at the address listed on our website.',
    '    <break time="500ms"/>',
    '    For former study participants, records requests may require additional processing time.',
    '    <break time="400ms"/>',
    '    Thank you for contacting Somnatek Sleep Health Center.',
    '  </prosody>',
    '</speak>',
  ].join('\n');
}

/**
 * Lambda handler invoked by Amazon Connect during an inbound call.
 * Returns the response level and SSML message to the contact flow.
 *
 * Connect passes the caller's phone number in:
 *   event.Details.ContactData.CustomerEndpoint.Address (E.164 format)
 *
 * The contact flow uses the returned { level, ssml } to route and play the message.
 *
 * @param {object} event - Amazon Connect contact flow event.
 * @returns {Promise<{level: string, ssml: string}>} Response for the contact flow.
 */
exports.handler = async (event) => {
  const callerNumber =
    event?.Details?.ContactData?.CustomerEndpoint?.Address || 'unknown';

  // Hash the caller number — never store E.164 in plaintext
  const callerHash = crypto
    .createHash('sha256')
    .update(callerNumber)
    .digest('hex');

  const state = await getCallerState(callerHash);
  const level = state.level || 1;
  const ssml = getSsml(level);

  await saveCallerState(state, level);

  // Connect contact flow reads these as $.External.level and $.External.ssml
  return {
    level: String(level),
    ssml,
  };
};
