import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as ses_actions from 'aws-cdk-lib/aws-ses-actions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK stack for the Somnatek ARG inbound email pipeline.
 *
 * Architecture:
 *   inbound email → SES receipt rule → S3 bucket → Lambda (S3 event)
 *   Lambda → Bedrock (Claude Haiku) → SES SendEmail → player
 *   Lambda → DynamoDB (sender state / level tracking)
 *
 * After deploying this stack you must complete three manual steps:
 *   1. Verify somnatek.org in SES (console: Configuration > Verified identities).
 *   2. Add MX record: 10 inbound-smtp.us-east-1.amazonaws.com
 *   3. Activate the somnatek-inbound receipt rule set in SES console.
 *   4. Enable Claude 3 Haiku model access in Amazon Bedrock console.
 */
export class SomnatekEmailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // DynamoDB — visitor and sender state table
    // ----------------------------------------------------------------
    const visitorsTable = new dynamodb.Table(this, 'VisitorsTable', {
      tableName: process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ----------------------------------------------------------------
    // S3 — inbound email storage (SES writes here on receipt)
    // ----------------------------------------------------------------
    const inboundBucket = new s3.Bucket(this, 'InboundEmailBucket', {
      bucketName: 'somnatek-email-inbound',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          // Inbound emails expire after 30 days — they are processed on receipt
          expiration: cdk.Duration.days(30),
          prefix: 'inbound/',
        },
      ],
    });

    // SES needs permission to put objects into the bucket
    inboundBucket.addToResourcePolicy(new iam.PolicyStatement({
      sid: 'AllowSESPut',
      principals: [new iam.ServicePrincipal('ses.amazonaws.com')],
      actions: ['s3:PutObject'],
      resources: [`${inboundBucket.bucketArn}/inbound/*`],
      conditions: {
        StringEquals: { 'aws:Referer': this.account },
      },
    }));

    // ----------------------------------------------------------------
    // Lambda — email classification, Bedrock call, and SES response
    // ----------------------------------------------------------------
    const emailResponder = new lambda.Function(this, 'EmailResponder', {
      // node_modules must be installed in lambda/email-responder/ before deploying.
      // Run: npm install --omit=dev  from lambda/email-responder/
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/email-responder')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: 'Somnatek ARG - automated records email responder (Bedrock/Claude)',
      environment: {
        SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS ?? 'records@somnatek.org',
        DYNAMODB_TABLE_VISITORS: visitorsTable.tableName,
        S3_BUCKET_EMAIL_INBOUND: inboundBucket.bucketName,
      },
    });

    // Permissions — minimal scope
    inboundBucket.grantRead(emailResponder);
    visitorsTable.grantReadWriteData(emailResponder);

    emailResponder.addToRolePolicy(new iam.PolicyStatement({
      sid: 'AllowSESSend',
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    emailResponder.addToRolePolicy(new iam.PolicyStatement({
      sid: 'AllowBedrockHaiku',
      actions: ['bedrock:InvokeModel'],
      resources: [
        `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
      ],
    }));

    // ----------------------------------------------------------------
    // S3 event notification — trigger Lambda on each new inbound email
    // ----------------------------------------------------------------
    inboundBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(emailResponder),
      { prefix: 'inbound/' },
    );

    // ----------------------------------------------------------------
    // SES receipt rule — receive mail for records@somnatek.org
    // ----------------------------------------------------------------
    const ruleSet = new ses.ReceiptRuleSet(this, 'InboundRuleSet', {
      receiptRuleSetName: 'somnatek-inbound',
    });

    new ses.ReceiptRule(this, 'RecordsRule', {
      ruleSet,
      recipients: [process.env.SES_FROM_ADDRESS ?? 'records@somnatek.org'],
      actions: [
        new ses_actions.S3({
          bucket: inboundBucket,
          objectKeyPrefix: 'inbound/',
        }),
      ],
      enabled: true,
      scanEnabled: true,
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'VisitorsTableName', {
      value: visitorsTable.tableName,
      exportName: 'SomnatekVisitorsTable',
    });

    new cdk.CfnOutput(this, 'EmailResponderArn', {
      value: emailResponder.functionArn,
      description: 'ARN of the email responder Lambda',
    });

    new cdk.CfnOutput(this, 'ManualStepsRequired', {
      value: [
        '1) Verify somnatek.org in SES console (Configuration > Verified identities)',
        '2) Add DNS MX record: 10 inbound-smtp.us-east-1.amazonaws.com',
        '3) Activate the somnatek-inbound receipt rule set in SES console',
        '4) Enable Claude 3 Haiku access in Amazon Bedrock console (Model access)',
      ].join(' | '),
      description: 'Required manual steps after stack deployment',
    });
  }
}
