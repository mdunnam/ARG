#!/usr/bin/env node
/**
 * scripts/release-drop.js
 *
 * Releases a single staged content drop:
 *   1. Copies the staged S3 artifact to the public S3 path (if s3Source exists)
 *   2. Updates the DynamoDB ledger entry to state=released
 *   3. Optionally triggers a CloudFront invalidation for the destination path
 *
 * Usage:
 *   node release-drop.js <slug>
 *   node release-drop.js <slug> --dry-run
 *
 * Environment variables:
 *   AWS_PROFILE             AWS credentials profile
 *   AWS_REGION              AWS region (default: us-east-1)
 *   DYNAMODB_TABLE          Table name (default: somnatek-visitors)
 *   CLOUDFRONT_SOMNATEK_ID  CloudFront distribution ID for somnatek-site (optional)
 *   CLOUDFRONT_RESTWELL_ID  CloudFront distribution ID for restwell-site (optional)
 */

'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, CopyObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE  = process.env.DYNAMODB_TABLE || 'somnatek-visitors';

const args   = process.argv.slice(2);
const slug   = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');

if (!slug) {
  console.error('Usage: node release-drop.js <slug> [--dry-run]');
  process.exit(1);
}

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const s3  = new S3Client({ region: REGION });
const cf  = new CloudFrontClient({ region: REGION });

/**
 * Parses an S3 URI into bucket and key prefix.
 * @param {string} uri - e.g. "s3://somnatek-site/docs/"
 * @returns {{ bucket: string, prefix: string }}
 */
function parseS3Uri(uri) {
  const match = uri.match(/^s3:\/\/([^/]+)\/?(.*)/);
  if (!match) throw new Error(`Invalid S3 URI: ${uri}`);
  return { bucket: match[1], prefix: match[2] };
}

/**
 * Copies all objects from a staged S3 path to the public S3 destination.
 * @param {string} srcUri - Source S3 URI.
 * @param {string} dstUri - Destination S3 URI.
 * @returns {Promise<string[]>} List of copied keys.
 */
async function copyS3Artifacts(srcUri, dstUri) {
  const src = parseS3Uri(srcUri);
  const dst = parseS3Uri(dstUri);

  const list = await s3.send(new ListObjectsV2Command({
    Bucket: src.bucket,
    Prefix: src.prefix,
  }));

  if (!list.Contents || list.Contents.length === 0) {
    throw new Error(`No objects found at ${srcUri}`);
  }

  const copied = [];

  for (const obj of list.Contents) {
    const relKey = obj.Key.slice(src.prefix.length);
    const dstKey = dst.prefix + relKey;

    console.log(`  copy: s3://${src.bucket}/${obj.Key}  →  s3://${dst.bucket}/${dstKey}`);

    if (!dryRun) {
      await s3.send(new CopyObjectCommand({
        CopySource:  `${src.bucket}/${obj.Key}`,
        Bucket:       dst.bucket,
        Key:          dstKey,
      }));
    }

    copied.push(`/${dstKey}`);
  }

  return copied;
}

/**
 * Issues a CloudFront invalidation for the given paths.
 * @param {string} distributionId
 * @param {string[]} paths
 * @returns {Promise<void>}
 */
async function invalidate(distributionId, paths) {
  if (!distributionId || paths.length === 0) return;
  console.log(`  invalidating ${distributionId}: ${paths.join(', ')}`);
  if (dryRun) return;
  await cf.send(new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `release-${slug}-${Date.now()}`,
      Paths: { Quantity: paths.length, Items: paths },
    },
  }));
}

/**
 * Updates the DynamoDB ledger entry to released.
 * @param {string} pk
 * @returns {Promise<void>}
 */
async function markReleased(pk) {
  console.log(`  marking released: ${pk}`);
  if (dryRun) return;
  await ddb.send(new UpdateCommand({
    TableName:        TABLE,
    Key:              { pk },
    UpdateExpression: 'SET #s = :released, releasedDate = :dt',
    ExpressionAttributeNames:  { '#s': 'state' },
    ExpressionAttributeValues: {
      ':released': 'released',
      ':dt':       new Date().toISOString().slice(0, 10),
    },
    ConditionExpression: '#s <> :released',
  }));
}

async function main() {
  console.log(`Releasing drop: ${slug}  [dry-run: ${dryRun}]`);

  const result = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key:       { pk: `DROP#${slug}` },
  }));

  const drop = result.Item;
  if (!drop) {
    console.error(`Drop not found: DROP#${slug}`);
    process.exit(1);
  }

  console.log(`  type: ${drop.type}  state: ${drop.state}  title: ${drop.title}`);

  if (drop.state === 'released') {
    console.log('  Already released. Nothing to do.');
    return;
  }

  if (drop.s3Dest && drop.s3Source) {
    const cfId = drop.s3Dest.includes('somnatek-site')
      ? process.env.CLOUDFRONT_SOMNATEK_ID
      : drop.s3Dest.includes('restwell-site')
        ? process.env.CLOUDFRONT_RESTWELL_ID
        : null;

    const copied = await copyS3Artifacts(drop.s3Source, drop.s3Dest);
    await invalidate(cfId, copied);
  } else if (drop.s3Dest && !drop.s3Source) {
    console.log(`  No s3Source defined for this drop — manual deployment required to ${drop.s3Dest}`);
  }

  await markReleased(`DROP#${slug}`);
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
