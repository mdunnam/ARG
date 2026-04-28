import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * EC2 stack for the Somnatek ARG web server.
 *
 * Runs a t3.micro instance with nginx serving four in-world static sites
 * behind a stable Elastic IP. Instance is accessible via AWS SSM Session
 * Manager — no SSH key required. An optional key pair name may be provided
 * via the EC2_KEY_PAIR_NAME environment variable for direct SSH access.
 *
 * Estimated cost: ~$7.50/month (t3.micro on-demand, us-east-1).
 * Free-tier eligible for the first 12 months of a new AWS account.
 */
export class SomnatekEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // VPC — use the account default VPC to avoid NAT gateway costs
    // ----------------------------------------------------------------
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // ----------------------------------------------------------------
    // Security group
    // ----------------------------------------------------------------
    const sg = new ec2.SecurityGroup(this, 'WebServerSg', {
      vpc,
      description: 'Somnatek ARG web server — HTTP/HTTPS inbound',
      allowAllOutbound: true,
    });

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    // ----------------------------------------------------------------
    // IAM role — SSM Session Manager for shell access without SSH keys.
    // S3 read added so deploy scripts can pull site builds from S3.
    // ----------------------------------------------------------------
    const role = new iam.Role(this, 'WebServerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'Somnatek ARG web server instance role',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // Minimal S3 read so deploy scripts can sync site builds
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:ListBucket'],
      resources: [
        `arn:aws:s3:::${process.env.S3_BUCKET_SOMNATEK ?? 'somnatek-site'}`,
        `arn:aws:s3:::${process.env.S3_BUCKET_SOMNATEK ?? 'somnatek-site'}/*`,
        `arn:aws:s3:::${process.env.S3_BUCKET_RESTWELL ?? 'restwell-site'}`,
        `arn:aws:s3:::${process.env.S3_BUCKET_RESTWELL ?? 'restwell-site'}/*`,
        `arn:aws:s3:::${process.env.S3_BUCKET_WEXLER ?? 'wexler-site'}`,
        `arn:aws:s3:::${process.env.S3_BUCKET_WEXLER ?? 'wexler-site'}/*`,
        `arn:aws:s3:::${process.env.S3_BUCKET_HARROW_COUNTY ?? 'harrow-county-site'}`,
        `arn:aws:s3:::${process.env.S3_BUCKET_HARROW_COUNTY ?? 'harrow-county-site'}/*`,
      ],
    }));

    // ----------------------------------------------------------------
    // User data — installs nginx and sets up four virtual host roots
    // ----------------------------------------------------------------
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // System update
      'dnf update -y',

      // Nginx
      'dnf install -y nginx',
      'systemctl enable nginx',

      // Site root directories
      'mkdir -p /var/www/somnatek',
      'mkdir -p /var/www/restwell',
      'mkdir -p /var/www/wexler',
      'mkdir -p /var/www/harrow-county',

      // Ownership
      'chown -R nginx:nginx /var/www',

      // Nginx virtual host configs
      'cat > /etc/nginx/conf.d/somnatek.conf << \'NGINXEOF\'',
      'server {',
      '    listen 80 default_server;',
      '    server_name _;',
      '    root /var/www/somnatek;',
      '    index index.html;',
      '    location / { try_files $uri $uri/ /index.html; }',
      '    error_page 404 /404.html;',
      '    location = /404.html { internal; }',
      '}',
      'NGINXEOF',

      'cat > /etc/nginx/conf.d/restwell.conf << \'NGINXEOF\'',
      'server {',
      '    listen 80;',
      '    server_name restwell.local;',
      '    root /var/www/restwell;',
      '    index index.html;',
      '    location / { try_files $uri $uri/ /index.html; }',
      '    error_page 404 /404.html;',
      '    location = /404.html { internal; }',
      '}',
      'NGINXEOF',

      'cat > /etc/nginx/conf.d/wexler.conf << \'NGINXEOF\'',
      'server {',
      '    listen 80;',
      '    server_name wexler.local;',
      '    root /var/www/wexler;',
      '    index index.html;',
      '    location / { try_files $uri $uri/ /index.html; }',
      '    error_page 404 /404.html;',
      '    location = /404.html { internal; }',
      '}',
      'NGINXEOF',

      'cat > /etc/nginx/conf.d/harrow-county.conf << \'NGINXEOF\'',
      'server {',
      '    listen 80;',
      '    server_name harrow-county.local;',
      '    root /var/www/harrow-county;',
      '    index index.html;',
      '    location / { try_files $uri $uri/ /index.html; }',
      '    error_page 404 /404.html;',
      '    location = /404.html { internal; }',
      '}',
      'NGINXEOF',

      // Remove default nginx config
      'rm -f /etc/nginx/conf.d/default.conf',

      // Placeholder index for Somnatek (replace on first deploy)
      'echo "<html><body><p>Service unavailable. Please check back later.</p></body></html>" > /var/www/somnatek/index.html',

      // Start nginx
      'systemctl start nginx',
    );

    // ----------------------------------------------------------------
    // EC2 instance — t3.micro, Amazon Linux 2023, encrypted 20GB GP3
    // ----------------------------------------------------------------
    const instance = new ec2.Instance(this, 'WebServer', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: sg,
      role,
      userData,
      // Optional SSH key — set EC2_KEY_PAIR_NAME in .env if needed.
      // Access via SSM Session Manager works without a key pair.
      ...(process.env.EC2_KEY_PAIR_NAME
        ? { keyName: process.env.EC2_KEY_PAIR_NAME }
        : {}),
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(20, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });

    // ----------------------------------------------------------------
    // Elastic IP — stable public address that survives instance stops
    // ----------------------------------------------------------------
    const eip = new ec2.CfnEIP(this, 'WebServerEip', {
      instanceId: instance.instanceId,
      tags: [{ key: 'Name', value: 'somnatek-web-eip' }],
    });

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 instance ID',
      exportName: 'SomnatekWebServerId',
    });

    new cdk.CfnOutput(this, 'ElasticIp', {
      value: eip.ref,
      description: 'Elastic IP — point your DNS A records here',
      exportName: 'SomnatekWebServerIp',
    });

    new cdk.CfnOutput(this, 'SsmSessionCommand', {
      value: `aws ssm start-session --target ${instance.instanceId} --profile somnatek-arg`,
      description: 'Open a shell on the instance via SSM (no SSH key needed)',
    });
  }
}
