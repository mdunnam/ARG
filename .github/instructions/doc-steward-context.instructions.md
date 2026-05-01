---
applyTo: "docs/**,*.md,.github/**/*.md"
---

# Documentation Steward Context — Auto-loaded

When editing any markdown file in this project, you are operating under documentation stewardship discipline. Every doc edit must leave the project more accurate than it was before.

## Source of Truth Hierarchy

When docs and code disagree, this order wins:

1. Deployed Lambda code (`lambda/**`)
2. Deployed HTML/JS (`sites/somnatek/**`)
3. `docs/roadmap.md` — current phase and build status
4. `docs/audit.md` — technical component status
5. `docs/doc-audit.md` — cross-document consistency tracking
6. All other docs — treat as potentially stale until verified against code

## Canonical Facts — Never Write Contrary to These

| Fact | Canonical value |
|---|---|
| Main site domain | `somnatek.org` |
| Email | `records@somnatek.org` |
| Fax number | `(404) 671-9774` |
| Main clinic line | `(404) 551-4145` |
| Somnatek main domain | `somnatek.org` — **registered and live** |
| RestWell domain | `restwell.net` — planned, **not yet registered** |
| Wexler domain | `wexler.org` — planned, **not yet registered** |
| Harrow County domain | `harrow-county.org` — planned, **not yet registered** |
| Active study period | 2008–2013 |
| Closure process | 2013–2014 |
| Public closure date | September 18, 2014 |
| Participant count | 47 enrolled |
| Last PTX ID | PTX-047 |
| First VIS ID | VIS-00001 (5-digit zero-padded) |
| Dorsal registered | ~six weeks after closure filing (2014-11-03) |
| RestWell discovery path | Admin Tier 2 HTML source (`admin/index.html`) — not staff directory |
| 7A internal artifact | HTML stand-in (`7A_INTERNAL_DO_NOT_DISTRIBUTE.html`) — PDF not yet generated |
| DynamoDB active table | `somnatek-visitors` — sole active table; `somnatek-solve-state` and `somnatek-content-ledger` are planned |
| Milestone total (released) | 285 pts released / 355 pts all-time |

## Common False Positive Patterns

Do not flag these as issues without first reading the source code:

- `Math.random()` in `lambda/email-responder/index.js` — this generates a cosmetic in-world reference number, not a VIS ID. Not a security issue.
- `portal-login` VIS ID generation — already uses `crypto.randomBytes()`. Do not flag as insecure.
- `twilio_2FA_recovery_code.txt` — was never committed. Already in `.gitignore`. No action needed.
- Admin Tier 2 RestWell reference — the comment is in `admin/index.html` line 351. There is no point-threshold gate in code.

## Stale Doc Signals to Scan For

When reviewing any doc, search for these patterns:

- `somnatekhealth.com` → should be `somnatek.org`
- `restwellonline.net` → should be `restwell.net` (planned domain — not yet registered)
- `records@somnatekhealth.com` → should be `records@somnatek.org`
- `"740 number"` → should be `(404) 551-4145`
- `"two months"` near Dorsal registration → should be "six weeks"
- `"forty-two"` or `"42"` as participant count → should be 47
- `"2008 to 2014"` as study period → should be 2008–2013
- `"to be built"` near portal Lambda → portal is deployed
- `"VIS-001"` → should be `VIS-00001`
- `wexler.edu` or `harrowcounty.gov` as player-facing domains → fictional registrable domains required
- Staff directory as RestWell discovery path → outdated; use Admin Tier 2 path

## Post-Edit Checklist

After any doc edit, verify:

- [ ] Does any other doc reference the same fact differently?
- [ ] Is the change consistent with the source-of-truth hierarchy above?
- [ ] Does `doc-audit.md` need a resolved/updated entry?
- [ ] Does the roadmap phase status still match the edit?
- [ ] Are any stale doc signals introduced or left unfixed?
