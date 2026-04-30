import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK stack for the Somnatek ARG portal login puzzle endpoint.
 *
 * Architecture:
 *   POST /api/portal-login (nginx proxy) → API Gateway HTTP API
 *     → Lambda (rate-limit + hash compare + visitor ID issuance)
 *     → DynamoDB (visitor state + rate-limit counters)
 *
 * After deploying, copy the PortalApiUrl output value into the nginx
 * somnatek.conf proxy_pass block and reload nginx via SSM.
 *
 * Environment variables required in .env before deploying:
 *   PUZZLE_ANSWER_SALT   — random hex string (already generated)
 *   PORTAL_ANSWER_HASH   — sha256(SALT + 'PTX-018') (already generated)
 *   DYNAMODB_TABLE_VISITORS — table name (default: somnatek-visitors)
 */
export class SomnatekPortalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // DynamoDB — import the shared visitors table by name.
    // The table is created by SomnatekEmailStack; deploy that first.
    // ----------------------------------------------------------------
    const visitorsTable = dynamodb.Table.fromTableName(
      this,
      'VisitorsTable',
      process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
    );

    // ----------------------------------------------------------------
    // Lambda — puzzle validation, rate-limiting, visitor ID issuance
    // ----------------------------------------------------------------
    const portalLogin = new lambda.Function(this, 'PortalLoginLambda', {
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../lambda/portal-login'),
      ),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      description: 'Somnatek ARG - portal login puzzle validation',
      environment: {
        DYNAMODB_TABLE_VISITORS:
          process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
        PUZZLE_ANSWER_SALT: process.env.PUZZLE_ANSWER_SALT ?? '',
        PORTAL_ANSWER_HASH: process.env.PORTAL_ANSWER_HASH ?? '',
        ALLOWED_ORIGIN: 'https://somnatek.org',
      },
    });

    visitorsTable.grantReadWriteData(portalLogin);

    // ----------------------------------------------------------------
    // HTTP API Gateway — minimal, no auth, CORS locked to somnatek.org
    // ----------------------------------------------------------------
    const httpApi = new apigatewayv2.HttpApi(this, 'PortalApi', {
      apiName: 'somnatek-portal-api',
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
      path: '/portal-login',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'PortalLoginIntegration',
        portalLogin,
      ),
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'PortalApiUrl', {
      value: `${httpApi.apiEndpoint}/portal-login`,
      exportName: 'SomnatekPortalApiUrl',
      description:
        'Portal login API endpoint — add to nginx somnatek.conf as proxy_pass target',
    });
  }
}
