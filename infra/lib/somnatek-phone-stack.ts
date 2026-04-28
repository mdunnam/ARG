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
 * The contact flow is created via the Connect API (scripts/create-contact-flow.ps1)
 * after the instance is provisioned, because the CloudFormation contact flow resource
 * rejects the flow JSON without a usable error message.
 *
 * Deploy order:
 *   1. cdk deploy SomnatekPhoneStack  (provisions instance + Lambda)
 *   2. scripts/create-contact-flow.ps1  (creates flow, claims number, associates)
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
    // ----------------------------------------------------------------
    const visitorsTable = dynamodb.Table.fromTableName(
      this,
      'VisitorsTable',
      process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
    );

    // ----------------------------------------------------------------
    // Lambda — caller level lookup and state tracking
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

    phoneResponder.addPermission('ConnectInvoke', {
      principal: new iam.ServicePrincipal('connect.amazonaws.com'),
      sourceArn: connectInstance.attrArn,
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
      description: 'Amazon Connect instance ID — needed for scripts/create-contact-flow.ps1',
    });

    new cdk.CfnOutput(this, 'PhoneResponderArn', {
      value: phoneResponder.functionArn,
      description: 'ARN of the phone responder Lambda',
    });

    new cdk.CfnOutput(this, 'ConsoleUrl', {
      value: `https://${instanceAlias}.my.connect.aws/`,
      description: 'Amazon Connect instance console URL',
    });
  }
}
