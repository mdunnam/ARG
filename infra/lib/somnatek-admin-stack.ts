import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * CDK stack for the Somnatek ARG hidden admin API.
 *
 * Architecture:
 *   GET /api/admin (nginx proxy) → API Gateway HTTP API
 *     → Lambda (token auth + DynamoDB scan + CloudWatch + Cost Explorer)
 *
 * After deploying, add the AdminApiUrl output value to nginx as a
 * proxy_pass block for /api/admin, then reload nginx via SSM.
 *
 * Environment variables required before deploying:
 *   ADMIN_SECRET                — random secret token for the admin dashboard
 *   DYNAMODB_TABLE_VISITORS     — DynamoDB table name (default: somnatek-visitors)
 *   PORTAL_FUNCTION_NAME        — portal-login Lambda function name (for CloudWatch)
 */
export class SomnatekAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // DynamoDB — import shared visitors table (created by EmailStack)
    // ----------------------------------------------------------------
    const visitorsTable = dynamodb.Table.fromTableName(
      this,
      'VisitorsTable',
      process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
    );

    // ----------------------------------------------------------------
    // Lambda — admin API: visitor data, CloudWatch metrics, Cost Explorer
    // ----------------------------------------------------------------
    const adminLambda = new lambda.Function(this, 'AdminApiLambda', {
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../lambda/admin-api'),
      ),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description: 'Somnatek ARG - hidden admin dashboard API',
      environment: {
        DYNAMODB_TABLE_VISITORS:
          process.env.DYNAMODB_TABLE_VISITORS ?? 'somnatek-visitors',
        ADMIN_SECRET:
          process.env.ADMIN_SECRET ?? '',
        PORTAL_FUNCTION_NAME:
          process.env.PORTAL_FUNCTION_NAME ?? '',
      },
    });

    // DynamoDB read-only (scan for visitor records)
    visitorsTable.grantReadData(adminLambda);

    // CloudWatch: read Lambda metrics for the portal function
    adminLambda.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'CloudWatchReadMetrics',
        actions: ['cloudwatch:GetMetricStatistics', 'cloudwatch:ListMetrics'],
        resources: ['*'],
      }),
    );

    // Cost Explorer: read-only cost data (global service, always us-east-1)
    adminLambda.addToRolePolicy(
      new iam.PolicyStatement({
        sid: 'CostExplorerRead',
        actions: ['ce:GetCostAndUsage', 'ce:GetCostForecast'],
        resources: ['*'],
      }),
    );

    // ----------------------------------------------------------------
    // HTTP API Gateway — locked to somnatek.org origin, GET only
    // ----------------------------------------------------------------
    const httpApi = new apigatewayv2.HttpApi(this, 'AdminApi', {
      apiName: 'somnatek-admin-api',
      corsPreflight: {
        allowOrigins: ['https://somnatek.org'],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'X-Admin-Token'],
        maxAge: cdk.Duration.minutes(5),
      },
    });

    httpApi.addRoutes({
      path: '/admin',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'AdminIntegration',
        adminLambda,
      ),
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'AdminApiUrl', {
      value: `${httpApi.apiEndpoint}/admin`,
      exportName: 'SomnatekAdminApiUrl',
      description:
        'Admin API endpoint — add to nginx somnatek.conf as proxy_pass for /api/admin',
    });
  }
}
