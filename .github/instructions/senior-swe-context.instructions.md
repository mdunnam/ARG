---
applyTo: "lambda/**,infra/**,scripts/**"
---

# Senior SWE Context — Auto-loaded

When editing Lambda, CDK, or script files you are working on the live backend of a public ARG. Changes here affect real players immediately. Apply production discipline.

## Stack Reference

| Layer | Technology | Notes |
|---|---|---|
| In-world sites | Plain HTML/CSS/vanilla JS | No frameworks. Served from EC2 + nginx. |
| Web server | AWS EC2 t3.micro + nginx | Amazon Linux 2023. SSM only — no SSH key pair. |
| Lambda runtime | Node.js 18.x | Each function: own folder, `index.js` entry point |
| API Gateway | AWS HTTP API | Proxied through nginx on EC2 |
| Database | AWS DynamoDB | Single active table: `somnatek-visitors` |
| Email | AWS SES + Bedrock (Claude 3 Haiku) | `records@somnatek.org` inbound → `lambda/email-responder` |
| Phone | Amazon Connect + `lambda/phone-responder` | Main: `(404) 551-4145` · Fax: `(404) 671-9774` |
| IaC | AWS CDK (TypeScript) | Stacks in `infra/` |
| Deploy profile | `somnatek-arg` | Always set `$env:AWS_PROFILE = "somnatek-arg"` |
| S3 bucket | `somnatek-site` | Static file origin — not public-facing directly |

## Deployed CDK Stacks

| Stack | Status | Notes |
|---|---|---|
| `SomnatekEc2Stack` | ✅ Deployed | EC2 + Elastic IP + SSM role |
| `SomnatekEmailStack` | ✅ Deployed | SES receipt rule + `lambda/email-responder` + DynamoDB table owner |
| `SomnatekPhoneStack` | ✅ Deployed | Amazon Connect + `lambda/phone-responder` |
| `SomnatekPortalStack` | ✅ Deployed | `lambda/portal-login` + API Gateway |
| `SomnatekAdminStack` | ✅ Deployed | `lambda/admin` + API Gateway |
| `SomnatekBeaconStack` | ✅ Deployed | `lambda/page-beacon` + API Gateway |

## Lambda Rules

- Entry point: `lambda/<name>/index.js`
- Puzzle answers: **never plaintext**. Hash with `PUZZLE_ANSWER_SALT` env var before comparison.
- VIS ID generation: use `crypto.randomBytes()` — never `Math.random()` for IDs.
- DynamoDB table names: always read from environment variables, never hardcoded strings.
- CORS headers: locked to `somnatek.org` on all API Gateway responses.
- Rate limiting: puzzle endpoints must throttle — 10 attempts / IP / 15-minute window via DynamoDB TTL counters.
- Error responses: never expose puzzle answers, internal paths, or system details to clients.
- Visitor IDs: format `VIS-XXXXX` (five-digit zero-padded). Early participants use `PTX-XXX`.
- Sender/IP storage: SHA-256 hash only. Never write raw emails, IPs, or phone numbers to DynamoDB or CloudWatch.

## `Math.random()` Note

`lambda/email-responder/index.js` line 168 uses `Math.random()` to generate a cosmetic in-world reference number (`DHHRMS-XXXXXX-2014`). This is intentional — it is a fake display string, not a security-sensitive value. Do not replace it.

## CDK / Infra Rules

- Each in-world site: separate S3 bucket and CloudFront distribution (planned upgrade path — current setup is EC2 + nginx).
- S3 buckets: public access blocked. Content served via EC2/nginx or CloudFront only.
- CloudFront (when added): custom error response for 403 → site's `404.html`.
- Lambda IAM: minimum required permissions only.
- Never hardcode account IDs, ARNs, or bucket names in CDK — use env vars or CDK context.
- CDK deploy command: always `Push-Location G:\APPS\ARG\infra` first, then `npx cdk deploy <StackName> --require-approval never`.

## Nginx Proxy Paths (current)

| Path | Target |
|---|---|
| `POST /api/portal-login` | `SomnatekPortalStack` API Gateway |
| `POST /api/beacon` | `SomnatekBeaconStack` API Gateway |
| `GET /api/admin` | `SomnatekAdminStack` API Gateway (requires `X-Admin-Token`) |
| `/site-mgmt/` | Real operator console — nginx returns 404 unless `X-Site-Key` header present |

## Milestone Registry (source of truth: `lambda/portal-login/index.js`)

| ID | Points | Released |
|---|---|---|
| `portal_solved` | 20 | ✅ |
| `fax_decoded` | 15 | ✅ |
| `restwell_found` | 40 | ✅ |
| `supp_index_found` | 20 | ✅ |
| `doc_7a_found` | 15 | ✅ |
| `correspondence_found` | 25 | ✅ |
| `admin_t1` | 10 | ✅ |
| `admin_t2` | 20 | ✅ |
| `admin_t3` | 35 | ✅ |
| `recall_accessed` | 25 | ✅ |
| `protocol_7a` | 30 | ✅ |
| `supp_010_found` | 35 | ✅ |
| `supp_005_found` | 40 | ✅ |
| `restwell_found` | 40 | future |
| `wexler_found` | 40 | future |

**Released: 285 pts / 355 pts all-time.**

## Security Checklist (apply to every Lambda change)

- [ ] No puzzle answers in plaintext anywhere in the function
- [ ] No raw PII (email, IP, phone) written to DynamoDB or CloudWatch
- [ ] Rate limiting in place on any endpoint that accepts user input
- [ ] CORS header locked to `somnatek.org`
- [ ] Error responses return generic messages — no internal paths or stack traces
- [ ] DynamoDB table names from env vars, not hardcoded
- [ ] IAM permissions are minimum required scope

## Content Drop / Scripts Rules

- Unreleased content lives in `staged/` (gitignored) or private S3 prefix `s3://somnatek-site/staged/`.
- Release scripts in `scripts/` copy staged artifacts to the public path and update `somnatek-content-ledger` DynamoDB table.
- Never commit staged content paths or content drop schedules to the public repo.
- `scripts/deploy-and-nginx.ps1` is the canonical manual deploy script.
