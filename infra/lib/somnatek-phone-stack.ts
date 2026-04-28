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
    // Flow:
    //   SetVoice (Joanna, neural)
    //   → InvokeLambda phase=greeting  (returns level + greeting ssml)
    //   → StoreGreeting (save ssml to contact attribute)
    //   → GetUserInput  (play greeting ssml, collect 1 DTMF digit, 8s timeout)
    //     → on digit 1-4: InvokeLambda phase=extension, extension=digit
    //       → StoreExtension → PlayExtension → Disconnect
    //     → on digit 9:  loop back to GetUserInput (repeat menu)
    //     → timeout / nomatch: PlayFallback → Disconnect
    //
    // Lambda errors at any point fall through to PlayFallback.
    // ----------------------------------------------------------------
    const contactFlowContent = cdk.Stack.of(this).toJsonString({
      Version: '2019-10-30',
      StartAction: 'set-voice',
      Actions: [
        {
          Identifier: 'set-voice',
          Type: 'UpdateContactTextToSpeechVoice',
          Parameters: { GlobalVoiceId: 'Joanna' },
          Transitions: { NextAction: 'invoke-greeting' },
        },

        // ---- Phase 1: get greeting SSML from Lambda ----
        {
          Identifier: 'invoke-greeting',
          Type: 'InvokeLambdaFunction',
          Parameters: {
            LambdaFunctionARN: phoneResponder.functionArn,
            InvocationTimeLimitSeconds: '8',
            LambdaInvocationAttributes: { phase: 'greeting' },
            ResponseValidation: { ResponseType: 'STRING_MAP' },
          },
          Transitions: {
            NextAction: 'store-greeting',
            Errors: [
              { NextAction: 'play-fallback', ErrorType: 'NoMatchingError' },
              { NextAction: 'play-fallback', ErrorType: 'TimedOut' },
            ],
          },
        },

        // Store greeting SSML as contact attribute
        {
          Identifier: 'store-greeting',
          Type: 'UpdateContactAttributes',
          Parameters: {
            TargetContact: 'Current',
            Attributes: { menuSsml: '$.External.ssml' },
          },
          Transitions: {
            NextAction: 'collect-digit',
            Errors: [{ NextAction: 'play-fallback', ErrorType: 'NoMatchingError' }],
          },
        },

        // ---- Phase 2: play greeting + collect DTMF ----
        {
          Identifier: 'collect-digit',
          Type: 'GetUserInput',
          Parameters: {
            Text: '$.Attributes.menuSsml',
            TextToSpeechType: 'ssml',
            Timeout: '8',
            MaxDigits: '1',
            TerminatingKeypress: '#',
          },
          Transitions: {
            NextAction: 'play-fallback',
            Conditions: [
              { NextAction: 'invoke-ext-1', Condition: { Operator: 'Equals', Operand: '1' } },
              { NextAction: 'invoke-ext-2', Condition: { Operator: 'Equals', Operand: '2' } },
              { NextAction: 'invoke-ext-3', Condition: { Operator: 'Equals', Operand: '3' } },
              { NextAction: 'invoke-ext-4', Condition: { Operator: 'Equals', Operand: '4' } },
              { NextAction: 'collect-digit', Condition: { Operator: 'Equals', Operand: '9' } },
            ],
            Errors: [
              { NextAction: 'play-fallback', ErrorType: 'InputTimedOut' },
              { NextAction: 'play-fallback', ErrorType: 'NoMatchingCondition' },
            ],
          },
        },

        // ---- Phase 3: Lambda invocations per extension ----
        ...(['1', '2', '3', '4'] as const).map((digit) => ({
          Identifier: `invoke-ext-${digit}`,
          Type: 'InvokeLambdaFunction',
          Parameters: {
            LambdaFunctionARN: phoneResponder.functionArn,
            InvocationTimeLimitSeconds: '8',
            LambdaInvocationAttributes: { phase: 'extension', extension: digit },
            ResponseValidation: { ResponseType: 'STRING_MAP' },
          },
          Transitions: {
            NextAction: `store-ext-${digit}`,
            Errors: [
              { NextAction: 'play-fallback', ErrorType: 'NoMatchingError' },
              { NextAction: 'play-fallback', ErrorType: 'TimedOut' },
            ],
          },
        })),

        // Store extension SSML per digit
        ...(['1', '2', '3', '4'] as const).map((digit) => ({
          Identifier: `store-ext-${digit}`,
          Type: 'UpdateContactAttributes',
          Parameters: {
            TargetContact: 'Current',
            Attributes: { extSsml: '$.External.ssml' },
          },
          Transitions: {
            NextAction: `play-ext-${digit}`,
            Errors: [{ NextAction: 'play-fallback', ErrorType: 'NoMatchingError' }],
          },
        })),

        // Play extension SSML per digit then disconnect
        ...(['1', '2', '3', '4'] as const).map((digit) => ({
          Identifier: `play-ext-${digit}`,
          Type: 'MessageParticipant',
          Parameters: {
            Text: '$.Attributes.extSsml',
            TextToSpeechType: 'ssml',
          },
          Transitions: {
            NextAction: 'disconnect',
            Errors: [{ NextAction: 'disconnect', ErrorType: 'NoMatchingError' }],
          },
        })),

        // ---- Fallback: hardcoded level-1 closure message ----
        {
          Identifier: 'play-fallback',
          Type: 'MessageParticipant',
          Parameters: {
            Text: [
              '<speak>',
              '  <prosody rate="95%">',
              '    You have reached Somnatek Sleep Health Center.',
              '    Our offices are no longer in operation.',
              '    For records inquiries, please contact Dorsal Health Holdings LLC',
              '    at the address listed on our website.',
              '    Thank you.',
              '  </prosody>',
              '</speak>',
            ].join(' '),
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
