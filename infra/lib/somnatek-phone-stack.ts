import * as cdk from 'aws-cdk-lib';
import * as connect from 'aws-cdk-lib/aws-connect';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK stack for the Somnatek ARG Amazon Connect phone line.
 *
 * Architecture:
 *   Inbound call → Connect phone number → Contact flow
 *   Contact flow → invokes Lambda (caller level lookup)
 *   Contact flow → plays level-appropriate Polly SSML → disconnects
 *   Lambda → DynamoDB (caller state, hashed caller ID)
 *
 * Pricing (AWS credits apply):
 *   ~$0.018/min inbound + ~$0.003/min telephony + ~$1/month DID number
 *
 * After deploying this stack, complete two manual steps in the AWS console:
 *   1. Amazon Connect console → Phone numbers → verify the claimed 740 number
 *      (if no 740 number was available, manually claim one under the instance)
 *   2. Confirm the contact flow is associated with the phone number
 *      (Connect console → Phone numbers → Edit → Contact flow: SomnatekMainLine)
 *
 * To promote a caller to level 2 or 3, update their DynamoDB record:
 *   pk: PHONE#<sha256 of E.164 number>
 *   level: 2 or 3
 */
export class SomnatekPhoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const instanceAlias = process.env.CONNECT_INSTANCE_ALIAS ?? 'somnatek-sleep';

    // ----------------------------------------------------------------
    // Amazon Connect instance
    // ----------------------------------------------------------------
    const connectInstance = new connect.CfnInstance(this, 'ConnectInstance', {
      identityManagementType: 'CONNECT_MANAGED',
      instanceAlias,
      attributes: {
        inboundCalls: true,
        outboundCalls: false,
        contactflowLogs: true,
        contactLens: false,
        autoResolveBestVoices: true,
        useCustomTtsVoices: false,
        earlyMedia: true,
      },
    });

    // ----------------------------------------------------------------
    // DynamoDB — import the shared visitors table by name
    // The table is created by SomnatekEmailStack; deploy that first.
    // ----------------------------------------------------------------
    const visitorsTable = dynamodb.Table.fromTableName(
      this,
      'VisitorsTable',
      process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
    );

    // ----------------------------------------------------------------
    // Lambda — caller level lookup and state tracking
    // No external dependencies — only AWS SDK v3 (pre-installed in Node 18)
    // ----------------------------------------------------------------
    const phoneResponder = new lambda.Function(this, 'PhoneResponder', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/phone-responder')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(8),
      memorySize: 128,
      description: 'Somnatek ARG - Amazon Connect phone responder (caller level routing)',
      environment: {
        DYNAMODB_TABLE_VISITORS: visitorsTable.tableName,
      },
    });

    visitorsTable.grantReadWriteData(phoneResponder);

    // Allow Amazon Connect to invoke this Lambda
    phoneResponder.addPermission('ConnectInvoke', {
      principal: new iam.ServicePrincipal('connect.amazonaws.com'),
      sourceArn: connectInstance.attrArn,
    });

    // ----------------------------------------------------------------
    // Contact flow — greeting menu → DTMF input → extension message → disconnect
    //
    // Action identifiers MUST be valid UUIDs — Connect rejects any other format.
    // IDs are static/hardcoded so the flow is idempotent across deploys.
    //
    // ID map:
    //   00000001  set-voice
    //   00000002  play-greeting (GetUserInput)
    //   00000011  play-ext-1  records
    //   00000012  play-ext-2  research
    //   00000013  play-ext-3  dr ellison
    //   00000014  play-ext-4  other extensions
    //   00000020  play-fallback
    //   00000099  disconnect
    //
    // Lambda (phone-responder) is deployed and wired in via a future stack
    // update once this base flow is verified working.
    // ----------------------------------------------------------------

    // UUID helper — pads a short string into 00000000-0000-0000-0000-xxxxxxxxxxxx
    const uid = (n: string) => `00000000-0000-0000-0000-${n.padStart(12, '0')}`;

    const ID = {
      voice:     uid('000001'),
      greeting:  uid('000002'),
      ext1:      uid('000011'),
      ext2:      uid('000012'),
      ext3:      uid('000013'),
      ext4:      uid('000014'),
      fallback:  uid('000020'),
      disconnect: uid('000099'),
    } as const;

    const contactFlowContent = JSON.stringify({
      Version: '2019-10-30',
      StartAction: ID.voice,
      Actions: [
        {
          Identifier: ID.voice,
          Type: 'UpdateContactTextToSpeechVoice',
          Parameters: { GlobalVoiceId: 'Joanna' },
          Transitions: { NextAction: ID.greeting },
        },
        {
          Identifier: ID.greeting,
          Type: 'GetUserInput',
          Parameters: {
            Text: [
              'You have reached Somnatek Sleep Health Center.',
              'Our offices are no longer in operation.',
              'For records and billing inquiries, press 1.',
              'For the research department, press 2.',
              "For Dr. Ellison's office, press 3.",
              'For all other extensions, press 4.',
              'To repeat these options, press 9.',
            ].join(' '),
            TextToSpeechType: 'text',
            InputTimeLimitSeconds: '8',
            MaxDigits: '1',
          },
          Transitions: {
            NextAction: ID.fallback,
            Conditions: [
              { NextAction: ID.ext1, Condition: { Operator: 'Equals', Operand: '1' } },
              { NextAction: ID.ext2, Condition: { Operator: 'Equals', Operand: '2' } },
              { NextAction: ID.ext3, Condition: { Operator: 'Equals', Operand: '3' } },
              { NextAction: ID.ext4, Condition: { Operator: 'Equals', Operand: '4' } },
              { NextAction: ID.greeting, Condition: { Operator: 'Equals', Operand: '9' } },
            ],
            Errors: [
              { NextAction: ID.fallback, ErrorType: 'InputTimedOut' },
              { NextAction: ID.fallback, ErrorType: 'NoMatchingCondition' },
            ],
          },
        },
        {
          Identifier: ID.ext1,
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              'Records and Administration.',
              'Patient records from Somnatek Sleep Health Center have been transferred to Dorsal Health Holdings LLC.',
              'To submit a records request, please write to Dorsal Health Holdings, P.O. Box 1140, Harrow County.',
              'Standard processing time is fifteen to twenty business days.',
              'This line is not monitored. Please do not leave a message.',
            ].join(' '),
            TextToSpeechType: 'text',
          },
          Transitions: { NextAction: ID.disconnect },
        },
        {
          Identifier: ID.ext2,
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              'You have reached the research department.',
              'The Wexler University longitudinal sleep recall study concluded in September 2013.',
              'Study enrollment is closed and no new participants are being accepted.',
              'For research records inquiries, please contact Dorsal Health Holdings LLC.',
            ].join(' '),
            TextToSpeechType: 'text',
          },
          Transitions: { NextAction: ID.disconnect },
        },
        {
          Identifier: ID.ext3,
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              'You have reached the office of Dr. Mara Ellison.',
              'Dr. Ellison is currently on administrative leave.',
              'This voicemail is no longer accepting messages.',
              'For clinical inquiries, please contact your primary care provider.',
              'For records inquiries, please contact Dorsal Health Holdings LLC.',
            ].join(' '),
            TextToSpeechType: 'text',
          },
          Transitions: { NextAction: ID.disconnect },
        },
        {
          Identifier: ID.ext4,
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              'The extension you have dialed is no longer in service.',
              'Somnatek Sleep Health Center ceased operations on September 18, 2014.',
              'For records inquiries, please contact Dorsal Health Holdings LLC.',
            ].join(' '),
            TextToSpeechType: 'text',
          },
          Transitions: { NextAction: ID.disconnect },
        },
        {
          Identifier: ID.fallback,
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              'You have reached Somnatek Sleep Health Center.',
              'Our offices are no longer in operation.',
              'For records inquiries, please contact Dorsal Health Holdings LLC',
              'at the address listed on our website.',
              'Thank you.',
            ].join(' '),
            TextToSpeechType: 'text',
          },
          Transitions: { NextAction: ID.disconnect },
        },
        {
          Identifier: ID.disconnect,
          Type: 'DisconnectParticipant',
          Parameters: {},
          Transitions: {},
        },
      ],
    });

    const contactFlow = new connect.CfnContactFlow(this, 'MainLineFlow', {
      instanceArn: connectInstance.attrArn,
      name: 'SomnatekMainLine',
      type: 'CONTACT_FLOW',
      description: 'Somnatek ARG - main clinic line inbound handler',
      content: contactFlowContent,
    });

    // ----------------------------------------------------------------
    // Phone number — request a 740 (southeast Ohio) DID
    // If no 740 number is available, CDK will fail with a descriptive error.
    // In that case: deploy without PhoneNumber, then claim a number manually
    // in the Connect console and associate it with SomnatekMainLine.
    // ----------------------------------------------------------------
    // prefix removed — no 740 numbers were available in the pool.
    // AWS will assign the next available US DID.
    // To request a 740 number later: Connect console → Phone numbers → Claim a number.
    const phoneNumber = new connect.CfnPhoneNumber(this, 'PhoneNumber', {
      targetArn: connectInstance.attrArn,
      type: 'DID',
      countryCode: 'US',
      description: 'Somnatek ARG - main clinic line',
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'ConnectInstanceArn', {
      value: connectInstance.attrArn,
      exportName: 'SomnatekConnectInstanceArn',
      description: 'Amazon Connect instance ARN',
    });

    new cdk.CfnOutput(this, 'ConnectInstanceId', {
      value: connectInstance.ref,
      description: 'Amazon Connect instance ID (for console URL)',
    });

    new cdk.CfnOutput(this, 'PhoneNumberClaimed', {
      value: phoneNumber.attrAddress,
      description: 'Claimed phone number — update site HTML and .env with this value',
    });

    new cdk.CfnOutput(this, 'PhoneResponderArn', {
      value: phoneResponder.functionArn,
      description: 'ARN of the phone responder Lambda',
    });

    new cdk.CfnOutput(this, 'ConsoleUrl', {
      value: `https://${instanceAlias}.my.connect.aws/`,
      description: 'Amazon Connect instance console URL',
    });

    new cdk.CfnOutput(this, 'ManualStepsRequired', {
      value: [
        '1) In Connect console, verify the phone number is associated with SomnatekMainLine contact flow',
        '2) Update CONNECT_PHONE_NUMBER in .env with the claimed number',
        '3) Update the phone number in all site HTML files to match',
      ].join(' | '),
      description: 'Manual steps after stack deployment',
    });
  }
}
