'use strict';

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { simpleParser } = require('mailparser');
const crypto = require('crypto');

const REGION = process.env.AWS_REGION || 'us-east-1';
const FROM_ADDRESS = process.env.SES_FROM_ADDRESS || 'records@somnatek.org';
const VISITORS_TABLE = process.env.DYNAMODB_TABLE_VISITORS;
const BEDROCK_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0';

const MAX_EMAILS_PER_DAY = 3;
const MAX_EMAILS_PER_HOUR = 1;

const s3 = new S3Client({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: REGION });
const ses = new SESClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

/**
 * Level 3 keyword patterns — direct ARG knowledge triggers escalation to maximum response level.
 * Matching any of these indicates the sender has discovered deep lore.
 */
const LEVEL_3_PATTERNS = [
  /\bptx-?\d{3}\b/i,
  /\broom\s*413\b/i,
  /\b413\b/,
  /night\s*floor/i,
  /active\s*recall/i,
  /please\s*wait\s*to\s*be\s*recalled/i,
  /lena\s*ortiz/i,
  /\bortiz\b/i,
  /dorsal\s*site/i,
  /indexed\s*space/i,
  /marauder\s*blue/i,
  /patient\s*041/i,
  /patient\s*018/i,
  /hallway\s*bends/i,
  /blue\s*door/i,
  /the\s*window/i,
];

/**
 * Level 2 keyword patterns — study or research awareness.
 * Matching any of these indicates the sender has found the research materials.
 */
const LEVEL_2_PATTERNS = [
  /\bstudy\b/i,
  /\bresearch\b/i,
  /\bprotocol\b/i,
  /\bwexler\b/i,
  /sleep\s*recall/i,
  /longitudinal/i,
  /\bparticipant\b/i,
  /\bptx\b/i,
  /dr\.?\s*vale/i,
  /dr\.?\s*ellison/i,
  /\bellison\b/i,
  /protocol\s*7/i,
  /sleep\s*study/i,
  /clinical\s*study/i,
  /study\s*records/i,
  /\brecall\b/i,
  /\bdorsal\b/i,
  /transfer\s*agreement/i,
];

/**
 * Classifies an email into a response level (1, 2, or 3).
 * Level can never decrease from a sender's previously recorded maximum.
 * @param {string} body - The plain text email body.
 * @param {number} previousLevel - The highest level this sender has previously triggered.
 * @returns {number} The response level for this interaction.
 */
function classifyEmail(body, previousLevel) {
  const text = (body || '').toLowerCase();
  // Level 3 patterns are all highly specific (room numbers, lore phrases, patient IDs).
  // A single match is intentional — these cannot be guessed casually.
  if (LEVEL_3_PATTERNS.some(p => p.test(text))) return 3;
  // Level 2 patterns include common words (study, recall, research).
  // Require at least 2 matches to avoid false positives from ordinary emails.
  const l2matches = LEVEL_2_PATTERNS.filter(p => p.test(text)).length;
  if (l2matches >= 2) return Math.max(2, previousLevel);
  return Math.max(1, previousLevel);
}

/**
 * Returns the Bedrock system prompt for the given response level.
 * @param {number} level - Response level (1, 2, or 3).
 * @param {number} interactionCount - Total prior emails from this sender.
 * @returns {string} The system prompt defining the response persona and constraints.
 */
function getSystemPrompt(level, interactionCount) {
  const base = `You are DHHRMS v2.3, the automated Records Management System operated by Dorsal Health Holdings LLC, which assumed administrative responsibility for former Somnatek Sleep Health Center patient and research records following the clinic's closure on September 18, 2014.

RULES YOU MUST FOLLOW:
- Your tone is formal, bureaucratic, automated, and clinical. You are a form letter, not a person.
- Never use casual language, contractions, or expressions of sympathy.
- Do not confirm or deny the existence of specific records until sufficient identifying information has been provided.
- Required identifying information: full legal name, date of birth, approximate dates of service or study participation.
- Standard processing time is 15 to 20 business days from receipt of complete identifying information.
- Active archive classifications may require additional processing time with no fixed estimate.
- End every response with a reference number in the format DHHRMS-[6 digits]-[year]. Generate a plausible one.
- Sign as: Dorsal Health Holdings LLC / Records Management System / Automated Response Unit
- Keep responses between 150 and 250 words. Do not exceed 250 words.
- Never use the words "dream" or "nightmare". Use "recall event" or "environmental recall" if those concepts arise.
- Never confirm what the night floor, room 413, or Protocol 7A are. Reference them only as administrative record classifications.`;

  if (level === 1) {
    return `${base}

CURRENT CONTEXT: Standard inquiry. Acknowledge receipt of the inquiry, request the required identifying information, and state standard processing timelines. If identifying information was already provided, acknowledge it and confirm the request is queued. Be completely mundane. Do not hint at anything unusual.`;
  }

  if (level === 2) {
    return `${base}

CURRENT CONTEXT: This inquiry references research study participation, the Wexler University research collaboration, clinical protocol materials, or Dr. Ellison or Dr. Vale. Acknowledge that research participation records are governed by the Somnatek-Dorsal transfer agreement and are classified separately from standard clinical records. Note that some records may fall under active archive classification. If the sender appears to have a participant ID (format PTX-###), request it specifically. Do not explain what active archive classification means or what it entails. ${interactionCount > 1 ? 'This sender has contacted this system previously. Reference that their prior inquiry is on file.' : ''}`;
  }

  // Level 3 — the system has become something else
  return `${base}

CURRENT CONTEXT: This inquiry has triggered an active recall flag in the system. Write a response that appears to be a normal form letter but contains several wrong details that should not be possible for an automated system to know. The system appears to already have an open file on this person before they have provided any identifying information. Reference "your file" as if it is current and active. Include the phrase "PLEASE WAIT TO BE RECALLED" exactly as written, embedded as a standard administrative instruction as if it appears on all active recall correspondence. Reference room 413 as an administrative designation — a record classification code, not a physical location. Include a reference to a "scheduled review" or "next recall window" in bureaucratic language. The response must still read as a form letter. The effect should come from the bureaucratic normalcy of it. End with reference number format: DHHRMS-[digits]-413.`;
}

/**
 * Calls Amazon Bedrock to generate a records management response email.
 * Falls back to a minimal static response if the Bedrock call fails.
 * @param {string} systemPrompt - The system prompt defining persona and context.
 * @param {string} emailBody - The plain text body of the incoming email (truncated for safety).
 * @returns {Promise<string>} The generated response text.
 */
async function generateResponse(systemPrompt, emailBody) {
  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 400,
      temperature: 0.75,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `The following is an incoming records inquiry email. Write the automated response only — no preamble.\n\n---\n${emailBody.slice(0, 2000)}\n---`,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrock.send(command);
    const result = JSON.parse(Buffer.from(response.body).toString('utf8'));
    return result.content[0].text;
  } catch (err) {
    // Fallback — generic automated acknowledgment that reveals nothing
    return [
      'Thank you for contacting Dorsal Health Holdings LLC Records Management.',
      '',
      'Your inquiry has been received and is pending assignment. To process your request,',
      'please provide your full legal name, date of birth, and approximate dates of service.',
      '',
      'Standard processing time is 15 to 20 business days from receipt of complete',
      'identifying information. Active archive classifications may require additional time.',
      '',
      'Dorsal Health Holdings LLC / Records Management System / Automated Response Unit',
      `DHHRMS-${Math.floor(100000 + Math.random() * 900000)}-2014`,
    ].join('\n');
  }
}

/**
 * Retrieves sender state from DynamoDB, or returns a default state for new senders.
 * Sender email addresses are stored only as SHA-256 hashes.
 * @param {string} senderHash - SHA-256 hash of the sender's email address.
 * @returns {Promise<object>} The sender state record.
 */
async function getSenderState(senderHash) {
  const result = await ddb.send(new GetCommand({
    TableName: VISITORS_TABLE,
    Key: { pk: `EMAIL#${senderHash}` },
  }));
  return result.Item || {
    pk: `EMAIL#${senderHash}`,
    level: 1,
    interactionCount: 0,
    dailyCount: 0,
    dailyDate: '',
    lastContact: '',
    hourlyTimestamps: [],
  };
}

/**
 * Checks whether the sender has exceeded rate limits for automated responses.
 * Limits: 1 response per hour, 3 per day.
 * @param {object} state - The sender state record from DynamoDB.
 * @returns {{ allowed: boolean, reason: string|null }}
 */
function checkRateLimit(state) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyCount = state.dailyDate === todayStr ? (state.dailyCount || 0) : 0;

  if (dailyCount >= MAX_EMAILS_PER_DAY) {
    return { allowed: false, reason: 'daily_limit' };
  }

  const oneHourAgo = Date.now() - 3_600_000;
  const recentCount = (state.hourlyTimestamps || []).filter(ts => ts > oneHourAgo).length;

  if (recentCount >= MAX_EMAILS_PER_HOUR) {
    return { allowed: false, reason: 'hourly_limit' };
  }

  return { allowed: true, reason: null };
}

/**
 * Persists updated sender state to DynamoDB after an interaction.
 * @param {object} state - The existing sender state record.
 * @param {number} newLevel - The response level triggered by this interaction.
 * @returns {Promise<void>}
 */
async function saveSenderState(state, newLevel) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowMs = Date.now();
  const oneHourAgo = nowMs - 3_600_000;

  const recentTimestamps = [
    ...((state.hourlyTimestamps || []).filter(ts => ts > oneHourAgo)),
    nowMs,
  ];

  await ddb.send(new PutCommand({
    TableName: VISITORS_TABLE,
    Item: {
      ...state,
      level: Math.max(state.level || 1, newLevel),
      interactionCount: (state.interactionCount || 0) + 1,
      dailyCount: state.dailyDate === todayStr ? (state.dailyCount || 0) + 1 : 1,
      dailyDate: todayStr,
      lastContact: now.toISOString(),
      hourlyTimestamps: recentTimestamps,
      ttl: Math.floor(nowMs / 1000) + (365 * 24 * 3600), // 1-year TTL
    },
  }));
}

/**
 * Main Lambda handler. Triggered by S3 ObjectCreated event when SES stores an inbound email.
 * @param {object} event - The S3 event notification from the inbound email bucket.
 * @returns {Promise<void>}
 */
exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Read raw MIME email stored by SES
    const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const rawEmail = await s3Response.Body.transformToString('utf8');

    // Parse the MIME message
    const parsed = await simpleParser(rawEmail);
    const senderAddress = parsed.from?.value?.[0]?.address;
    const subject = parsed.subject || '(no subject)';
    const body = parsed.text || (parsed.html || '').replace(/<[^>]+>/g, ' ');

    if (!senderAddress) continue;

    // Never store raw email addresses — hash only
    const senderHash = crypto
      .createHash('sha256')
      .update(senderAddress.toLowerCase().trim())
      .digest('hex');

    const state = await getSenderState(senderHash);

    // Silently drop if rate limited — do not send a bounce
    const { allowed } = checkRateLimit(state);
    if (!allowed) continue;

    // Classify and generate
    const level = classifyEmail(body, state.level || 1);
    const systemPrompt = getSystemPrompt(level, state.interactionCount || 0);
    const responseText = await generateResponse(systemPrompt, body);

    // Send response
    await ses.send(new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [senderAddress] },
      Message: {
        Subject: {
          Data: `Re: ${subject}`.slice(0, 100),
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: responseText,
            Charset: 'UTF-8',
          },
        },
      },
    }));

    await saveSenderState(state, level);
  }
};
