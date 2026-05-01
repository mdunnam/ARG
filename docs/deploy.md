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

### Option B: Direct rsync over SSH

> **Note:** No SSH key pair is configured on the current deployment (SSM only). Use Option A unless a key pair is explicitly added later.

```powershell
rsync -avz --delete G:\APPS\ARG\sites\somnatek\ ec2-user@YOUR_ELASTIC_IP:/var/www/somnatek/
```

Replace `YOUR_ELASTIC_IP` with the value from CDK outputs.

---

## Nginx Virtual Hosts

The instance is pre-configured with four virtual hosts. Point DNS A records at the Elastic IP, then update the `server_name` directives in each config to match your real domains.

| Site | Nginx config | Web root | Intended domain |
|---|---|---|---|
| Somnatek | `/etc/nginx/conf.d/somnatek.conf` | `/var/www/somnatek` | `somnatek.org` ✅ registered |
| RestWell | `/etc/nginx/conf.d/restwell.conf` | `/var/www/restwell` | `restwell.net` ⬜ planned |
| Wexler University | `/etc/nginx/conf.d/wexler.conf` | `/var/www/wexler` | `wexler.org` ⬜ planned (fictional) |
| Harrow County | `/etc/nginx/conf.d/harrow-county.conf` | `/var/www/harrow-county` | `harrow-county.org` ⬜ planned (fictional) |

### Update a server_name (via SSM session)

```bash
sudo nano /etc/nginx/conf.d/somnatek.conf
# Change: server_name _;
# To:     server_name somnatek.org www.somnatek.org;

sudo nginx -t           # test config
sudo systemctl reload nginx
```

---

## HTTPS / TLS (Let's Encrypt)

After pointing DNS and verifying HTTP works:

```bash
# Inside SSM session
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d somnatek.org -d www.somnatek.org
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
| `EC2_KEY_PAIR_NAME` | Optional SSH key pair name — **not used in current deployment** (SSM only) | `.env` |
| `S3_BUCKET_SOMNATEK` | S3 bucket for Somnatek site | `.env` |
| `PUZZLE_ANSWER_SALT` | Salt for hashing puzzle answers in Lambda | `.env` (never commit filled value) |

Full variable list: see [../.env](../.env)

---

## Security Reminders

- Never commit a filled `.env` file.
- Never commit AWS credentials to the repository.
- Credentials live in `~/.aws/credentials` under the `[somnatek-arg]` profile only.

---

## Deploying the Email Responder (SES + Lambda + Bedrock)

The email stack receives inbound mail at `records@somnatek.org`, classifies it by keyword level, calls Amazon Bedrock (Claude 3 Haiku) to generate an in-world response, and sends the reply via SES.

### Prerequisites

Complete these four steps **before** deploying the stack. CDK will deploy successfully without them but email will not function until all four are done.

| Step | Where | Action |
|---|---|---|
| 1 | SES console → Verified identities | Verify `somnatek.org` as a domain identity |
| 2 | Namecheap DNS → Advanced DNS → Mail Settings | Add MX record: `10 inbound-smtp.us-east-1.amazonaws.com` |
| 3 | SES console → Email receiving | After deploy: activate the `somnatek-inbound` receipt rule set |
| 4 | Bedrock console → Model access | Enable **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`) |

### Deploy

```powershell
# Install Lambda dependency first (mailparser — only needed once)
Set-Location G:\APPS\ARG\lambda\email-responder
npm install --omit=dev

Set-Location G:\APPS\ARG\infra
$env:AWS_PROFILE = "somnatek-arg"
npx cdk deploy SomnatekEmailStack
```

### Outputs

| Output | Description |
|---|---|
| `VisitorsTableName` | DynamoDB table name for sender/caller state |
| `EmailResponderArn` | Lambda ARN (for CloudWatch logs) |
| `ManualStepsRequired` | Reminder of the four manual steps |

### How classification works

Inbound emails are classified into three levels. A sender's level persists in DynamoDB and never decreases.

| Level | Trigger | Response character |
|---|---|---|
| 1 | Any email | Standard closure acknowledgment, records request instructions |
| 2 | Keywords: `study`, `research`, `protocol`, `Wexler`, `recall`, `Dr. Vale`, `Dr. Ellison`, etc. | Acknowledges research records exist under active archive classification, extended timelines |
| 3 | Deep lore: `PTX-###`, `room 413`, `night floor`, `PLEASE WAIT TO BE RECALLED`, `Lena Ortiz`, etc. | Automated system appears to already have an open file on the sender. References scheduled recall window. Includes the phrase `PLEASE WAIT TO BE RECALLED`. Reference numbers end in `-413`. |

All responses are generated dynamically by Claude 3 Haiku with a persona-locked system prompt. The persona is DHHRMS v2.3 (Dorsal Health Holdings Records Management System). Responses are 150–250 words and read as form letters.

### Rate limiting

- Maximum 1 response per sender per hour
- Maximum 3 responses per sender per day
- Excess emails are silently dropped (no bounce)

Sender email addresses are stored as SHA-256 hashes only. Raw addresses are never written to DynamoDB or CloudWatch.

### Viewing logs

```powershell
aws logs tail /aws/lambda/SomnatekEmailStack-EmailResponder --follow --profile somnatek-arg
```

---

## Deploying the Phone Line (Amazon Connect)

The phone stack provisions an Amazon Connect instance and routes inbound calls through a contact flow that invokes a Lambda to determine caller level and plays a level-appropriate Polly SSML message.

**Deployed numbers (404 area code):**
- Main line: (404) 551-4145
- Fax line: (404) 671-9774

### Phone / Fax Operational Status

| Layer | Status |
|---|---|
| `lambda/phone-responder` built | ✅ |
| `SomnatekPhoneStack` deployed (Connect + Lambda) | ✅ |
| Phone number claimed in Connect | ⚠️ Unconfirmed — verify `PhoneNumberClaimed` output matches (404) 551-4145 |
| IVR contact flow end-to-end tested (live call) | ⚠️ Unconfirmed |
| Fax line `(404) 671-9774` confirmed playing morse audio live | ✅ |
| `fax_decoded` milestone achievable by players | ✅ Fax confirmed; milestone is live |

### Cost

- ~$1/month for the DID phone number
- ~$0.018/minute for inbound call usage
- ~$0.003/minute for telephony
- AWS credits apply to all charges

### Deploy

```powershell
Set-Location G:\APPS\ARG\infra
$env:AWS_PROFILE = "somnatek-arg"
npx cdk deploy SomnatekPhoneStack
```

CDK will provision the Connect instance, contact flow, Lambda, and phone number in one pass. The number claim may take 1–2 minutes.

### Outputs

| Output | Description |
|---|---|
| `PhoneNumberClaimed` | The claimed phone number — confirm matches (404) 551-4145 / (404) 671-9774 |
| `ConnectInstanceArn` | Connect instance ARN |
| `ConnectInstanceId` | Connect instance ID |
| `ConsoleUrl` | Direct URL to the Connect admin console |
| `PhoneResponderArn` | Lambda ARN |
| `ManualStepsRequired` | Post-deploy checklist |

### Post-deploy steps

1. Copy the `PhoneNumberClaimed` output value into `CONNECT_PHONE_NUMBER` in `.env`
2. Confirm (404) 551-4145 (main) and (404) 671-9774 (fax) appear in all Somnatek site HTML headers and footers
3. Redeploy site files to S3 and the EC2 instance
4. In the Connect console, confirm the phone number is associated with the `SomnatekMainLine` contact flow

### Verify the contact flow

In the Connect admin console (`https://somnatek-sleep.my.connect.aws/`):

1. Go to **Routing → Contact flows**
2. Confirm `SomnatekMainLine` is present and published
3. Go to **Channels → Phone numbers**
4. Confirm the claimed number shows `SomnatekMainLine` in the Contact flow column

### What callers hear

| Caller level | Message played |
|---|---|
| 1 (default) | Institutional closure recording. Clinic is closed, contact Dorsal Health Holdings for records. |
| 2 | Closure message with added: "your inquiry has been noted", "active archive classification", "do not contact clinical staff directly" |
| 3 | *"Your file is current. Your next recall window has been scheduled. Please wait to be recalled."* — then several seconds of silence. |

The fallback message (Lambda timeout or error) plays the level 1 recording from hardcoded SSML in the contact flow — it does not require the Lambda to be available.

### Promoting a caller to a higher level

Caller phone numbers are stored as SHA-256 hashes. To promote a caller:

1. Get their E.164 phone number (e.g. `+17405550123`)
2. Generate the hash:

```powershell
$number = "+17405550123"
$hash = [System.BitConverter]::ToString(
  [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes($number.ToLower().Trim())
  )
).Replace("-","").ToLower()
Write-Host "PHONE#$hash"
```

3. Update the DynamoDB record:

```powershell
aws dynamodb put-item `
  --table-name somnatek-visitors `
  --item "{\"pk\":{\"S\":\"PHONE#$hash\"},\"level\":{\"N\":\"3\"},\"callCount\":{\"N\":\"0\"},\"firstCall\":{\"S\":\"\"},\"lastCall\":{\"S\":\"\"}}" `
  --profile somnatek-arg
```

The caller's next inbound call will receive the level 3 message.

### Viewing logs

```powershell
aws logs tail /aws/lambda/SomnatekPhoneStack-PhoneResponder --follow --profile somnatek-arg
```
- The EC2 instance uses SSM Session Manager — no inbound SSH port (22) is open.
- Rotate the IAM key after initial setup is complete and replace the admin IAM user with a least-privilege deploy user.
- `PUZZLE_ANSWER_SALT` must be set in Lambda environment variables before any puzzle endpoints go live.
