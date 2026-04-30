import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK stack for the Somnatek ARG page beacon endpoint.
 *
 * Architecture:
 *   POST /api/beacon (nginx proxy) → API Gateway HTTP API
 *     → Lambda (IP-hash rate-limit + ANON upsert + VISITOR update)
 *     → DynamoDB (shared visitors table)
 *
 * The beacon is fire-and-forget — always returns 204. It records which
 * pages each visitor loads, builds anonymous pre-solve visitor records,
 * and updates named VISITOR# records for players who have solved the portal.
 *
 * After deploying, add the BeaconApiUrl output to nginx somnatek.conf
 * as a proxy_pass block for /api/beacon.
 */
export class SomnatekBeaconStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // DynamoDB — shared visitors table (created by EmailStack)
    // ----------------------------------------------------------------
    const visitorsTable = dynamodb.Table.fromTableName(
      this,
      'VisitorsTable',
      process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
    );

    // ----------------------------------------------------------------
    // Lambda — beacon handler
    // ----------------------------------------------------------------
    const beaconLambda = new lambda.Function(this, 'BeaconLambda', {
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../lambda/page-beacon'),
      ),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      description: 'Somnatek ARG - page beacon (anonymous visitor tracking)',
      environment: {
        DYNAMODB_TABLE_VISITORS:
          process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
        ALLOWED_ORIGIN: 'https://somnatek.org',
      },
    });

    visitorsTable.grantReadWriteData(beaconLambda);

    // ----------------------------------------------------------------
    // HTTP API Gateway — POST /beacon only, CORS locked to somnatek.org
    // ----------------------------------------------------------------
    const httpApi = new apigatewayv2.HttpApi(this, 'BeaconApi', {
      apiName: 'somnatek-beacon-api',
      corsPreflight: {
        allowOrigins: ['https://somnatek.org'],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.POST,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    httpApi.addRoutes({
      path: '/beacon',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'BeaconIntegration',
        beaconLambda,
      ),
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'BeaconApiUrl', {
      value: `${httpApi.apiEndpoint}/beacon`,
      exportName: 'SomnatekBeaconApiUrl',
      description:
        'Beacon API endpoint — add to nginx somnatek.conf as proxy_pass for /api/beacon',
    });
  }
}
