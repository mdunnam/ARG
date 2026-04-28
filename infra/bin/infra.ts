#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SomnatekEc2Stack } from '../lib/somnatek-ec2-stack';

const app = new cdk.App();

new SomnatekEc2Stack(app, 'SomnatekEc2Stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '816418998457',
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Somnatek ARG — EC2 web server (nginx, t3.micro)',
});
