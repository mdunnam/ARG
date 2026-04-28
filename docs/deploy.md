# Somnatek ARG — Deployment Guide

## Prerequisites

All of the following must be in place before deploying.

| Tool | Minimum Version | Check |
|---|---|---|
| Node.js | 18.x | `node --version` |
| AWS CDK CLI | 2.x | `npx cdk --version` |
| AWS CLI | 2.x | `aws --version` |
| PowerShell | 7.x | `$PSVersionTable` |

AWS credentials must be configured under the `somnatek-arg` profile:

```powershell
aws configure --profile somnatek-arg
```

Verify authentication:

```powershell
aws sts get-caller-identity --profile somnatek-arg
```

Expected output:

```json
{
  "UserId": "...",
  "Account": "816418998457",
  "Arn": "arn:aws:iam::816418998457:user/ARG"
}
```

---

## First-Time Setup

### 1. Install CDK dependencies

```powershell
Set-Location G:\APPS\ARG\infra
npm install
```

### 2. Bootstrap CDK

Only required once per account/region. Already completed for `816418998457 / us-east-1`.

```powershell
$env:AWS_PROFILE = "somnatek-arg"
npx cdk bootstrap aws://816418998457/us-east-1
```

---

## Deploying the EC2 Web Server

### Deploy

```powershell
Set-Location G:\APPS\ARG\infra
$env:AWS_PROFILE = "somnatek-arg"
npx cdk deploy SomnatekEc2Stack
```

CDK will print a change summary and prompt for confirmation before creating resources.

### Outputs

After a successful deploy, CDK prints:

| Output | Description |
|---|---|
| `InstanceId` | EC2 instance ID (e.g. `i-0abc123...`) |
| `ElasticIp` | Public IP address — point DNS A records here |
| `SsmSessionCommand` | Full command to open a shell via SSM |

### Open a shell on the instance (no SSH key needed)

```powershell
aws ssm start-session --target i-YOURINSTANCEID --profile somnatek-arg
```

Or copy the exact command from the CDK output.

### Verify nginx is running

Once connected via SSM:

```bash
systemctl status nginx
curl http://localhost
```

---

## Deploying Site Files

Site HTML/CSS/JS lives in `sites/` locally. Deploy by copying to the nginx root on the instance.

### Option A: Copy directly via SSM / S3 sync (recommended)

Upload the site build to S3 staging, then pull from the instance:

```powershell
# From your local machine — upload Somnatek site
aws s3 sync G:\APPS\ARG\sites\somnatek\ s3://somnatek-site/ --profile somnatek-arg

# From inside the SSM session on the instance
aws s3 sync s3://somnatek-site/ /var/www/somnatek/ --profile somnatek-arg
sudo chown -R nginx:nginx /var/www/somnatek
sudo systemctl reload nginx
```

### Option B: Direct rsync over SSH (if key pair configured)

```powershell
rsync -avz --delete G:\APPS\ARG\sites\somnatek\ ec2-user@YOUR_ELASTIC_IP:/var/www/somnatek/
```

Replace `YOUR_ELASTIC_IP` with the value from CDK outputs.

---

## Nginx Virtual Hosts

The instance is pre-configured with four virtual hosts. Point DNS A records at the Elastic IP, then update the `server_name` directives in each config to match your real domains.

| Site | Nginx config | Web root | Intended domain |
|---|---|---|---|
| Somnatek | `/etc/nginx/conf.d/somnatek.conf` | `/var/www/somnatek` | `somnatekhealth.com` |
| RestWell | `/etc/nginx/conf.d/restwell.conf` | `/var/www/restwell` | `restwellonline.net` |
| Wexler University | `/etc/nginx/conf.d/wexler.conf` | `/var/www/wexler` | `wexler-university.edu` (fictional) |
| Harrow County | `/etc/nginx/conf.d/harrow-county.conf` | `/var/www/harrow-county` | `harrowcounty.gov` (fictional) |

### Update a server_name (via SSM session)

```bash
sudo nano /etc/nginx/conf.d/somnatek.conf
# Change: server_name _;
# To:     server_name somnatekhealth.com www.somnatekhealth.com;

sudo nginx -t           # test config
sudo systemctl reload nginx
```

---

## HTTPS / TLS (Let's Encrypt)

After pointing DNS and verifying HTTP works:

```bash
# Inside SSM session
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d somnatekhealth.com -d www.somnatekhealth.com
```

Certbot will edit the nginx config and add auto-renew. Verify renewal:

```bash
sudo certbot renew --dry-run
```

---

## Updating the Stack

After editing `infra/lib/somnatek-ec2-stack.ts`:

```powershell
Set-Location G:\APPS\ARG\infra
$env:AWS_PROFILE = "somnatek-arg"
npx cdk diff        # preview changes
npx cdk deploy      # apply changes
```

---

## Destroying the Stack

Only do this if you intend to remove all resources. This will terminate the EC2 instance and release the Elastic IP.

```powershell
$env:AWS_PROFILE = "somnatek-arg"
npx cdk destroy SomnatekEc2Stack
```

---

## Common Commands Reference

```powershell
# Authenticate check
aws sts get-caller-identity --profile somnatek-arg

# Synthesize CloudFormation template (no deploy)
npx cdk synth --profile somnatek-arg

# Preview changes before deploy
npx cdk diff --profile somnatek-arg

# Deploy
npx cdk deploy --profile somnatek-arg

# Open shell on instance via SSM
aws ssm start-session --target i-YOURINSTANCEID --profile somnatek-arg

# Sync local site to S3
aws s3 sync G:\APPS\ARG\sites\somnatek\ s3://somnatek-site/ --profile somnatek-arg

# List running instances
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --profile somnatek-arg --query "Reservations[].Instances[].{ID:InstanceId,IP:PublicIpAddress,Type:InstanceType}"
```

---

## Environment Variables

Key variables used during deploy. Set in the terminal session before running CDK or AWS CLI commands.

| Variable | Purpose | Where set |
|---|---|---|
| `AWS_PROFILE` | Select the `somnatek-arg` credentials profile | Terminal or `.env` |
| `AWS_REGION` | Target region | `~/.aws/config` |
| `EC2_KEY_PAIR_NAME` | Optional SSH key pair name | `.env` |
| `S3_BUCKET_SOMNATEK` | S3 bucket for Somnatek site | `.env` |
| `PUZZLE_ANSWER_SALT` | Salt for hashing puzzle answers in Lambda | `.env` (never commit filled value) |

Full variable list: see [../.env](../.env)

---

## Security Reminders

- Never commit a filled `.env` file.
- Never commit AWS credentials to the repository.
- Credentials live in `~/.aws/credentials` under the `[somnatek-arg]` profile only.
- The EC2 instance uses SSM Session Manager — no inbound SSH port (22) is open.
- Rotate the IAM key after initial setup is complete and replace the admin IAM user with a least-privilege deploy user.
- `PUZZLE_ANSWER_SALT` must be set in Lambda environment variables before any puzzle endpoints go live.
