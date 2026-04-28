#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SomnatekEc2Stack } from '../lib/somnatek-ec2-stack';
import { SomnatekEmailStack } from '../lib/somnatek-email-stack';

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
