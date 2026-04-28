'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const REGION = process.env.AWS_REGION || 'us-east-1';
const VISITORS_TABLE = process.env.DYNAMODB_TABLE_VISITORS;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

// ---------------------------------------------------------------------------
// SSML content library
// ---------------------------------------------------------------------------

/**
 * Main greeting menu. Plays before collecting DTMF input.
 * Levels 1 and 2 hear the same greeting. Level 3 callers hear a version
 * that implies the system already knows who they are.
 * @param {number} level
 * @returns {string} SSML
 */
function getGreetingSsml(level) {
  if (level >= 3) {
    return [
      '<speak>',
      '  <prosody rate="92%">',
      '    You have reached Somnatek Sleep Health Center.',
      '    <break time="800ms"/>',
      '    Your call has been noted.',
      '    <break time="1200ms"/>',
      '    For records and administration, press 1.',
      '    <break time="300ms"/>',
      '    For the research coordination line, press 2.',
      '    <break time="300ms"/>',
      '    For Dr. Ellison\'s office, press 3.',
      '    <break time="300ms"/>',
      '    For all other extensions, press 4.',
      '    <break time="600ms"/>',
      '    Please wait to be recalled.',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    You have reached Somnatek Sleep Health Center.',
    '    <break time="500ms"/>',
    '    Our offices are no longer in operation.',
    '    <break time="500ms"/>',
    '    For records and billing inquiries, press 1.',
    '    <break time="300ms"/>',
    '    For the research department, press 2.',
    '    <break time="300ms"/>',
    '    For Dr. Ellison\'s office, press 3.',
    '    <break time="300ms"/>',
    '    For all other extensions, press 4.',
    '    <break time="400ms"/>',
    '    To repeat these options, press 9.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

/**
 * Extension 1 — Records and Administration.
 * All levels hear a standard Dorsal Health Holdings transfer message.
 * Level 2+ includes a note about active archive processing times.
 * @param {number} level
 * @returns {string} SSML
 */
function getExtension1Ssml(level) {
  if (level >= 2) {
    return [
      '<speak>',
      '  <prosody rate="93%">',
      '    Records and Administration.',
      '    <break time="400ms"/>',
      '    Patient records from Somnatek Sleep Health Center have been transferred',
      '    to Dorsal Health Holdings LLC.',
      '    <break time="400ms"/>',
      '    To submit a standard records request, please write to Dorsal Health Holdings,',
      '    P.O. Box 1140, Harrow County.',
      '    <break time="500ms"/>',
      '    Please be advised that records classified under active archive designation',
      '    are subject to extended processing requirements.',
      '    Processing timelines for these records are not fixed.',
      '    <break time="500ms"/>',
      '    If you have been contacted directly by this office, your file is current.',
      '    No further action is required on your part at this time.',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    Records and Administration.',
    '    <break time="400ms"/>',
    '    Patient records from Somnatek Sleep Health Center have been transferred',
    '    to Dorsal Health Holdings LLC.',
    '    <break time="400ms"/>',
    '    To submit a records request, please write to Dorsal Health Holdings,',
    '    P.O. Box 1140, Harrow County.',
    '    <break time="400ms"/>',
    '    Standard processing time is 15 to 20 business days.',
    '    <break time="400ms"/>',
    '    This line is not monitored. Please do not leave a message.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

/**
 * Extension 2 — Research Department (Dr. Vale's coordination line).
 * Level 1: standard discontinued notice.
 * Level 2: something active that shouldn't be, references follow-up participants.
 * Level 3: the system treats the caller as a participant in an ongoing study.
 * @param {number} level
 * @returns {string} SSML
 */
function getExtension2Ssml(level) {
  if (level >= 3) {
    return [
      '<speak>',
      '  <prosody rate="88%" pitch="-1st">',
      '    Research coordination.',
      '    <break time="1000ms"/>',
      '    Participant file verified.',
      '    <break time="1500ms"/>',
      '    Your recall window is currently open.',
      '    <break time="800ms"/>',
      '    Environmental alignment is within expected parameters.',
      '    <break time="2000ms"/>',
      '    <prosody rate="85%">',
      '      Please do not attempt to map the indexed space without supervision.',
      '    </prosody>',
      '    <break time="3000ms"/>',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  if (level >= 2) {
    return [
      '<speak>',
      '  <prosody rate="93%">',
      '    You have reached the Wexler University research coordination line,',
      '    maintained on behalf of Dorsal Health Holdings LLC.',
      '    <break time="500ms"/>',
      '    Active study enrollment is closed.',
      '    <break time="400ms"/>',
      '    Follow-up participants with questions about their participation status',
      '    should contact Dorsal Health Holdings in writing.',
      '    <break time="600ms"/>',
      '    If you have been scheduled for a follow-up session,',
      '    you will receive confirmation through your registered contact method.',
      '    <break time="400ms"/>',
      '    This line is monitored periodically.',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    You have reached the research department.',
    '    <break time="400ms"/>',
    '    The Wexler University longitudinal sleep recall study',
    '    concluded in September 2013.',
    '    <break time="400ms"/>',
    '    Study enrollment is closed and no new participants are being accepted.',
    '    <break time="400ms"/>',
    '    For research records inquiries, please contact Dorsal Health Holdings LLC.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

/**
 * Extension 3 — Dr. Ellison's office.
 * Level 1: standard voicemail, full, not accepting messages.
 * Level 2: voicemail recorded before she went on leave — something slightly off.
 * Level 3: the voicemail answers but the content has no explanation.
 * @param {number} level
 * @returns {string} SSML
 */
function getExtension3Ssml(level) {
  if (level >= 3) {
    return [
      '<speak>',
      '  <prosody rate="90%">',
      '    You have reached Dr. Ellison\'s office.',
      '    <break time="600ms"/>',
      '    <prosody rate="88%" pitch="-1st">',
      '      I know you can hear this.',
      '      <break time="1000ms"/>',
      '      Room 413 is not on any floor plan.',
      '      <break time="800ms"/>',
      '      Do not go back.',
      '      <break time="2000ms"/>',
      '    </prosody>',
      '    <prosody rate="95%">',
      '      This voicemail is no longer accepting messages.',
      '    </prosody>',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  if (level >= 2) {
    return [
      '<speak>',
      '  <prosody rate="92%">',
      '    You have reached the office of Dr. Mara Ellison,',
      '    Medical Director, Somnatek Sleep Health Center.',
      '    <break time="500ms"/>',
      '    I am currently unavailable.',
      '    <break time="300ms"/>',
      '    If you are a patient with a clinical concern,',
      '    please contact your primary care provider.',
      '    <break time="400ms"/>',
      '    If you are calling regarding the study,',
      '    <break time="600ms"/>',
      '    please do not leave a message here.',
      '    <break time="800ms"/>',
      '    This voicemail is no longer being monitored.',
      '    <break time="300ms"/>',
      '    Please do not leave a message here.',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    You have reached the office of Dr. Mara Ellison.',
    '    <break time="400ms"/>',
    '    Dr. Ellison is currently on administrative leave.',
    '    <break time="400ms"/>',
    '    This voicemail is no longer accepting messages.',
    '    <break time="400ms"/>',
    '    For clinical inquiries, please contact your primary care provider.',
    '    For records inquiries, please contact Dorsal Health Holdings LLC.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

/**
 * Extension 4 — all other extensions.
 * This covers Lena Ortiz and any extension players attempt to reach by number.
 * Her position was eliminated. The line should not still be here.
 * Level 3: the line is not fully disconnected.
 * @param {number} level
 * @returns {string} SSML
 */
function getExtension4Ssml(level) {
  if (level >= 3) {
    return [
      '<speak>',
      '  <prosody rate="90%">',
      '    The extension you have dialed is no longer in service.',
      '    <break time="1500ms"/>',
      '    <prosody rate="85%" pitch="-2st">',
      '      If someone gave you this number,',
      '      <break time="600ms"/>',
      '      they should not have been able to.',
      '    </prosody>',
      '    <break time="3000ms"/>',
      '  </prosody>',
      '</speak>',
    ].join(' ');
  }

  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    The extension you have dialed is no longer in service.',
    '    <break time="400ms"/>',
    '    Somnatek Sleep Health Center ceased operations on September 18, 2014.',
    '    <break time="400ms"/>',
    '    For records inquiries, please contact Dorsal Health Holdings LLC.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

/**
 * Fallback message — plays if no digit was pressed (timeout) or unrecognized input.
 * @returns {string} SSML
 */
function getFallbackSsml() {
  return [
    '<speak>',
    '  <prosody rate="95%">',
    '    You have reached Somnatek Sleep Health Center.',
    '    <break time="400ms"/>',
    '    Our offices are no longer in operation.',
    '    <break time="400ms"/>',
    '    For records inquiries, please contact Dorsal Health Holdings LLC',
    '    at the address listed on our website.',
    '    <break time="400ms"/>',
    '    Thank you.',
    '  </prosody>',
    '</speak>',
  ].join(' ');
}

// ---------------------------------------------------------------------------
// DynamoDB helpers
// ---------------------------------------------------------------------------

/**
 * Retrieves caller state from DynamoDB by hashed phone number.
 * Phone numbers are never stored in plaintext.
 * @param {string} callerHash - SHA-256 hash of the caller's E.164 phone number.
 * @returns {Promise<object>}
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
    return { pk: `PHONE#${callerHash}`, level: 1, callCount: 0, firstCall: '', lastCall: '' };
  }
}

/**
 * Persists updated caller state to DynamoDB.
 * Only increments callCount on the initial greeting phase to avoid
 * counting each extension press as a separate call.
 * @param {object} state
 * @param {number} level
 * @param {boolean} isGreeting - True if this is the initial call entry.
 * @returns {Promise<void>}
 */
async function saveCallerState(state, level, isGreeting) {
  const now = new Date().toISOString();
  try {
    await ddb.send(new PutCommand({
      TableName: VISITORS_TABLE,
      Item: {
        ...state,
        level: Math.max(state.level || 1, level),
        callCount: isGreeting ? (state.callCount || 0) + 1 : (state.callCount || 0),
        firstCall: state.firstCall || now,
        lastCall: now,
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 3600),
      },
    }));
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * Lambda handler invoked by Amazon Connect during an inbound call.
 * Called twice per session: once for the greeting (phase=greeting)
 * and once after DTMF input (phase=extension, extension=digit).
 *
 * Connect passes:
 *   event.Details.ContactData.CustomerEndpoint.Address — caller E.164 number
 *   event.Details.Parameters.phase                    — "greeting" | "extension"
 *   event.Details.Parameters.extension                — DTMF digit pressed (extension phase only)
 *
 * Returns { level, ssml } which the contact flow plays via Polly.
 *
 * @param {object} event - Amazon Connect contact flow Lambda event.
 * @returns {Promise<{level: string, ssml: string}>}
 */
exports.handler = async (event) => {
  const params = event?.Details?.Parameters || {};
  const callerNumber = event?.Details?.ContactData?.CustomerEndpoint?.Address || 'unknown';
  const phase = params.phase || 'greeting';
  const extension = params.extension || '';

  const callerHash = crypto
    .createHash('sha256')
    .update(callerNumber)
    .digest('hex');

  const state = await getCallerState(callerHash);
  const level = state.level || 1;
  const isGreeting = phase === 'greeting';

  await saveCallerState(state, level, isGreeting);

  let ssml;

  if (phase === 'extension') {
    switch (extension) {
      case '1': ssml = getExtension1Ssml(level); break;
      case '2': ssml = getExtension2Ssml(level); break;
      case '3': ssml = getExtension3Ssml(level); break;
      case '4': ssml = getExtension4Ssml(level); break;
      default:  ssml = getFallbackSsml(); break;
    }
  } else {
    ssml = getGreetingSsml(level);
  }

  return {
    level: String(level),
    ssml,
  };
};


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
    ].join(' ');
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
    ].join(' ');
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
  ].join(' ');
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
