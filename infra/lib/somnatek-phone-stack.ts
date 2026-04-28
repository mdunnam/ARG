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
    // Contact flow — play message and disconnect
    //
    // Flow:
    //   SetVoice (Joanna, neural)
    //   → InvokeLambda (returns level + ssml)
    //   → UpdateContactAttributes (store ssml from $.External.ssml)
    //   → MessageParticipant (play $.Attributes.message)
    //   → DisconnectParticipant
    //
    // Lambda errors fall back to the hardcoded level-1 closure message.
    // ----------------------------------------------------------------
    const contactFlowContent = cdk.Stack.of(this).toJsonString({
      Version: '2019-10-30',
      StartAction: 'set-voice',
      Actions: [
        {
          Identifier: 'set-voice',
          Type: 'UpdateContactTextToSpeechVoice',
          Parameters: { VoiceId: 'Joanna' },
          Transitions: { NextAction: 'invoke-lambda' },
        },
        {
          Identifier: 'invoke-lambda',
          Type: 'InvokeLambdaFunction',
          Parameters: {
            LambdaFunctionARN: phoneResponder.functionArn,
            InvocationTimeLimitSeconds: '8',
            LambdaInvocationAttributes: {
              callerNumber: '$.CustomerEndpoint.Address',
            },
            ResponseValidation: { ResponseType: 'STRING_MAP' },
          },
          Transitions: {
            NextAction: 'store-message',
            Errors: [
              { NextAction: 'play-fallback', ErrorType: 'NoMatchingError' },
              { NextAction: 'play-fallback', ErrorType: 'TimedOut' },
            ],
          },
        },
        {
          Identifier: 'store-message',
          Type: 'UpdateContactAttributes',
          Parameters: {
            TargetContact: 'Current',
            Attributes: { message: '$.External.ssml' },
          },
          Transitions: {
            NextAction: 'play-message',
            Errors: [{ NextAction: 'play-fallback', ErrorType: 'NoMatchingError' }],
          },
        },
        {
          Identifier: 'play-message',
          Type: 'MessageParticipant',
          Parameters: {
            Text: '$.Attributes.message',
            TextToSpeechType: 'ssml',
          },
          Transitions: {
            NextAction: 'disconnect',
            Errors: [{ NextAction: 'disconnect', ErrorType: 'NoMatchingError' }],
          },
        },
        {
          // Fallback: Lambda timed out or failed — play hardcoded closure message
          Identifier: 'play-fallback',
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              '<speak>',
              '  <prosody rate="95%">',
              '    You have reached Somnatek Sleep Health Center.',
              '    <break time="500ms"/>',
              '    Our offices are no longer in operation.',
              '    <break time="400ms"/>',
              '    For records inquiries, please contact Dorsal Health Holdings LLC',
              '    at the address listed on our website.',
              '    <break time="400ms"/>',
              '    Thank you for contacting Somnatek Sleep Health Center.',
              '  </prosody>',
              '</speak>',
            ].join('\n'),
            TextToSpeechType: 'ssml',
          },
          Transitions: {
            NextAction: 'disconnect',
            Errors: [{ NextAction: 'disconnect', ErrorType: 'NoMatchingError' }],
          },
        },
        {
          Identifier: 'disconnect',
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
    const phoneNumber = new connect.CfnPhoneNumber(this, 'PhoneNumber', {
      targetArn: connectInstance.attrArn,
      type: 'DID',
      countryCode: 'US',
      prefix: '+1740',
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
