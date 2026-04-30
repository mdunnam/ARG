#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SomnatekEc2Stack } from '../lib/somnatek-ec2-stack';
import { SomnatekEmailStack } from '../lib/somnatek-email-stack';
import { SomnatekPhoneStack } from '../lib/somnatek-phone-stack';
import { SomnatekPortalStack } from '../lib/somnatek-portal-stack';
import { SomnatekAdminStack } from '../lib/somnatek-admin-stack';
import { SomnatekBeaconStack } from '../lib/somnatek-beacon-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT ?? '816418998457',
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

new SomnatekEc2Stack(app, 'SomnatekEc2Stack', {
  env,
  description: 'Somnatek ARG - EC2 web server (nginx, t3.micro)',
});

new SomnatekEmailStack(app, 'SomnatekEmailStack', {
  env,
  description: 'Somnatek ARG - inbound email pipeline (SES + Lambda + Bedrock)',
});

new SomnatekPhoneStack(app, 'SomnatekPhoneStack', {
  env,
  description: 'Somnatek ARG - Amazon Connect phone line (740 number + Polly IVR)',
});

new SomnatekPortalStack(app, 'SomnatekPortalStack', {
  env,
  description: 'Somnatek ARG - portal login puzzle endpoint (API Gateway + Lambda + DynamoDB)',
});

new SomnatekAdminStack(app, 'SomnatekAdminStack', {
  env,
  description: 'Somnatek ARG - hidden admin dashboard API (Lambda + CloudWatch + Cost Explorer)',
});

new SomnatekBeaconStack(app, 'SomnatekBeaconStack', {
  env,
  description: 'Somnatek ARG - page beacon endpoint (anonymous visitor + page view tracking)',
});
