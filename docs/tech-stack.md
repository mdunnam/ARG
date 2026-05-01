# Somnatek ARG — Tech Stack

## Overview

The Somnatek ARG uses a split architecture: in-world sites are plain static HTML/CSS/JS deployed to an EC2-hosted nginx server, while puzzle validation, visitor state, and content scheduling run on managed AWS services.

---

## In-World Sites

### Language

Plain HTML, CSS, and vanilla JavaScript. No frameworks.

### Why

Sites must look like real abandoned institutional websites from the late 2000s and early 2010s. Framework fingerprints (React root divs, Tailwind class names, Next.js hydration scripts) immediately break immersion. Source code inspection is part of the game — the HTML must look like it was written by a tired webmaster in 2009.

### Rules

- System fonts only: Georgia, Times New Roman, Verdana, Arial, Tahoma, Courier New.
- No CSS grid or flexbox for primary layout. Use floats and tables.
- Navigation: left sidebars, horizontal tab bars, plain anchor links.
- Hidden puzzle elements: HTML comments, hidden form fields, metadata, data attributes, off-screen positioned elements.
- Console output, if used, must read as system output, not developer notes.
- 404 pages must match the site era — plain, institutional, not stylized.

### Site Roots (on server)

| Site | Web root |
|---|---|
| Somnatek Sleep Health Center | `/var/www/somnatek` |
| RestWell Patient Forum | `/var/www/restwell` |
| Wexler University Archive | `/var/www/wexler` |
| Harrow County Records | `/var/www/harrow-county` |

### Local development

Open site folders directly in a browser, or use a simple local server:

```powershell
npx serve G:\APPS\ARG\sites\somnatek -p 3000
```

---

## Web Server

### Service: AWS EC2

**Instance type:** t3.micro
**AMI:** Amazon Linux 2023 (latest)
**Region:** us-east-1
**Storage:** 20GB GP3 encrypted EBS

### Why t3.micro

Cheapest always-on option outside free tier. Handles static file serving for a low-traffic ARG with no problem. Can be upgraded to t3.small or t3.medium with a single CDK change if traffic grows.

**Estimated cost:** ~$7.50/month (on-demand). Free tier eligible for the first 12 months of a new account.

### Web server: nginx

nginx serves all four in-world sites as separate virtual hosts on the same instance. Each site has its own `server_name` and web root. A single Elastic IP is shared, with DNS routing traffic to the right virtual host by domain name.

### Elastic IP

A static Elastic IP is allocated and attached. DNS A records point here. The IP survives instance stop/start cycles.

### Shell access: SSM Session Manager

No inbound SSH port is open. Shell access to the instance uses AWS Systems Manager Session Manager, which requires only the IAM role attached to the instance. No key pair required.

---

## Infrastructure as Code

### Service: AWS CDK (TypeScript)

CDK stacks live in `infra/`. TypeScript is used for type safety and IDE support.

**CDK version:** 2.x
**Node.js version:** 18.x+

### Stacks

| Stack | File | Purpose | Status |
|---|---|---|---|
| `SomnatekEc2Stack` | `infra/lib/somnatek-ec2-stack.ts` | EC2 instance, security group, IAM role, Elastic IP | ✅ Deployed |
| `SomnatekEmailStack` | `infra/lib/somnatek-email-stack.ts` | SES inbound rule, email-responder Lambda, DynamoDB table | ✅ Deployed |
| `SomnatekPhoneStack` | `infra/lib/somnatek-phone-stack.ts` | Amazon Connect instance, IVR contact flow, phone-responder Lambda | ✅ Deployed |
| `SomnatekPortalStack` | `infra/lib/somnatek-portal-stack.ts` | Portal-login Lambda + HTTP API Gateway (`/api/portal-login`) | ✅ Deployed |
| `SomnatekBeaconStack` | `infra/lib/somnatek-beacon-stack.ts` | Page-beacon Lambda + HTTP API Gateway (`/api/beacon`) | ✅ Deployed |
| `SomnatekAdminStack` | `infra/lib/somnatek-admin-stack.ts` | Admin-api Lambda + HTTP API Gateway (`/api/admin`) | ✅ Deployed |

Planned (not yet built):

| Stack | Purpose |
|---|---|
| `SomnatekSchedulerStack` | EventBridge rules for timed content drops |
| `SomnatekContentLedgerStack` | DynamoDB content ledger + release Lambda |

---

## Puzzle Validation

### Service: AWS Lambda (Node.js) + AWS API Gateway

Lambda functions live in `lambda/`. Each function has its own folder with an `index.js` entry point.

### Deployed Lambda Functions

| Function | Endpoint / Trigger | Purpose | Status |
|---|---|---|---|
| `portal-login` | `POST /api/portal-login` | Puzzle answer validation, rate-limiting, VIS-XXXXX issuance | ✅ Live |
| `page-beacon` | `POST /api/beacon` | Anonymous visitor tracking, milestone writes, progress recompute | ✅ Live |
| `admin-api` | `GET /api/admin` | Operator dashboard — visitor counts, milestone distribution, Lambda metrics | ✅ Live |
| `email-responder` | SES receipt rule (`records@somnatek.org`) | Inbound email classification (L1/L2/L3), Bedrock-powered response generation | ✅ Live |
| `phone-responder` | Amazon Connect contact flow | Inbound call routing, level-based Polly SSML response | ✅ Live |

### Why Lambda

Puzzle answers must never be validated client-side — players inspect source. Lambda keeps answer logic server-side, rate-limited, and unexposed.

### Answer hashing

Puzzle answers are hashed with a secret salt before comparison:

```js
const crypto = require('crypto');
const hash = crypto
  .createHmac('sha256', process.env.PUZZLE_ANSWER_SALT)
  .update(submittedAnswer.trim().toLowerCase())
  .digest('hex');
```

The `PUZZLE_ANSWER_SALT` is set as a Lambda environment variable. It is never stored in source code or committed to the repository.

### Rate limiting

All puzzle endpoints enforce per-IP submission rate limiting to prevent brute force. Implemented at API Gateway level (usage plans) or within the Lambda handler.

### CORS

API Gateway responses include `Access-Control-Allow-Origin` headers scoped to the live in-world domains. Wildcard CORS is not used.

---

## Visitor State

### Service: AWS DynamoDB

DynamoDB stores visitor IDs, solve state, and email opt-in status.

### Tables

| Table | Env variable | Purpose |
|---|---|---|
| `somnatek-visitors` | `DYNAMODB_TABLE_VISITORS` | Visitor records, IDs, opt-in status |
| `somnatek-solve-state` | `DYNAMODB_TABLE_SOLVE_STATE` | Per-visitor puzzle progress |
| `somnatek-content-ledger` | `DYNAMODB_TABLE_CONTENT_LEDGER` | Content drop release state |

Table names are always read from environment variables in Lambda code — never hardcoded.

### Visitor ID format

- Study-era participants: `PTX-XXX` (three-digit zero-padded)
- Later visitors: `VIS-XXXXX` (five-digit zero-padded)

### Content ledger states

Each artifact in the ledger has one of: `drafted`, `scheduled`, `released`, `discovered`, `superseded`, `removed`.

---

## Email Transmissions

### Service: AWS SES (Simple Email Service)

SES sends opt-in in-world email transmissions: appointment confirmations, records update notices, recall notices, system status messages.

### From address

`records@somnatekhealth.com` (once domain is verified in SES)

### Opt-in only

Players must explicitly subscribe. No unsolicited contact. Unsubscribe is always available.

### Data stored

Only the minimum required: email address, visitor ID, consent timestamp, preferences, unsubscribe status.

---

## Content Scheduling

### Service: AWS EventBridge Scheduler

EventBridge rules trigger Lambda functions on a schedule to copy staged artifacts from a private S3 prefix to the public web root.

### Content states

```
drafted → scheduled → released → discovered → superseded → removed
```

Release scripts in `scripts/` update the content ledger in DynamoDB and sync the artifact to S3.

---

## Static Assets

### Service: AWS S3

S3 stores source assets before processing (images, audio, PDFs) and can serve as an intermediate staging location for site builds before deployment to the EC2 web root.

### Buckets

| Bucket env variable | Purpose |
|---|---|
| `S3_BUCKET_SOMNATEK` | Somnatek site build staging |
| `S3_BUCKET_RESTWELL` | RestWell site build staging |
| `S3_BUCKET_WEXLER` | Wexler archive site build staging |
| `S3_BUCKET_HARROW_COUNTY` | Harrow County records site build staging |
| `S3_BUCKET_STAGING` | Unreleased scheduled content |
| `S3_BUCKET_ASSETS` | Shared source images, audio, PDFs |

---

## DNS

### Service: AWS Route 53

Route 53 manages DNS for all in-world domains. A records point to the EC2 Elastic IP. CNAME or ALIAS records can be added later if CloudFront is introduced.

### Planned domains

| Domain | Site |
|---|---|
| `somnatekhealth.com` | Main clinic site |
| `restwellonline.net` | Patient forum |
| Fictional `.edu` equivalent | Wexler University archive |
| Fictional `.gov` equivalent | Harrow County records |

Domains must be fictional and must not impersonate real institutions, universities, counties, or government entities.

---

## CI/CD

### Service: GitHub Actions

GitHub Actions pipelines handle deployment when code is merged to main.

Planned workflows:

| Workflow | Trigger | Action |
|---|---|---|
| `deploy-somnatek.yml` | Push to `main` touching `sites/somnatek/` | Sync to S3, pull to EC2 |
| `deploy-infra.yml` | Push to `main` touching `infra/` | CDK deploy |
| `deploy-lambda.yml` | Push to `main` touching `lambda/` | Lambda function update |

Credentials for GitHub Actions use a separate least-privilege IAM role with OIDC federation — not long-lived access keys.

---

## Local Development

| Task | Command |
|---|---|
| Preview a site | `npx serve G:\APPS\ARG\sites\somnatek -p 3000` |
| CDK synth (no deploy) | `npx cdk synth` from `infra/` |
| CDK diff | `npx cdk diff` from `infra/` |
| CDK deploy | `npx cdk deploy` from `infra/` |
| Open SSM shell | `aws ssm start-session --target i-INSTANCEID --profile somnatek-arg` |
| Check AWS identity | `aws sts get-caller-identity --profile somnatek-arg` |

---

## Cost Summary

| Service | Estimated monthly cost | Notes |
|---|---|---|
| EC2 t3.micro (on-demand) | ~$7.50 | Single AZ; no failover |
| Elastic IP (attached, in use) | $0.00 | |
| EBS 20GB GP3 | ~$1.60 | |
| Route 53 hosted zone | ~$0.50/zone | |
| DynamoDB (low traffic) | Free tier / <$1.00 | |
| Lambda (low traffic) | Free tier | |
| SES (low volume) | Free tier / <$1.00 | |
| S3 (low volume) | Free tier / <$1.00 | |
| Amazon Connect (phone line) | ~$1.00/month + $0.018/min | DID number + inbound call minutes |
| Bedrock Claude 3 Haiku | ~$0.25–1.00/month | email-responder inference; varies with email volume |
| **Total estimate** | **~$13–18/month** | Bedrock/Connect new since initial estimate |

Upgrade path: if traffic grows, move static sites to S3 + CloudFront for better performance and lower EC2 load. The CDK stack is structured to support that migration.

---

## Security Notes

- EC2 instance has no inbound SSH (port 22). Shell access via SSM only.
- S3 buckets with public assets should have ACLs set appropriately; staging buckets must be private.
- IAM roles use minimum required permissions.
- Puzzle answer salt is a Lambda environment variable, never in source code.
- Visitor emails and IDs are not logged to CloudWatch.
- No real medical data, no real PII, no real patient records.
- The admin IAM user used for initial setup should be replaced with a least-privilege deploy user once the stack is stable.
