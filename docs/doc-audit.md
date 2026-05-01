# Somnatek ARG — Documentation Consistency Audit

**Audited:** May 1, 2026
**Scope:** All files in `docs/` cross-checked against each other, deployed code, and canonical lore constants.
**Method:** Full read of all nine docs + cross-reference against deployed HTML, Lambda, and admin HTML.

---

## Status Key

| Symbol | Meaning |
|---|---|
| 🔴 | Critical — lore fact wrong or discovery path broken |
| 🟡 | Moderate — outdated but not lore-breaking |
| 🟢 | Clean — no issues found |
| ✅ | Issue resolved |

---

## 1. `roadmap.md`

**Reviewing agent: Flow Engineer**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| R-01 | Phase 2 (RestWell) status is "Not started" — RestWell is **built** (`sites/restwell/` is complete). It is gated from discovery, not unbuilt. Status should reflect this. | 🟡 | Change status to "Complete — gated" with note on discovery path |
| R-02 | Phase 2 description says RestWell is "discoverable through a Somnatek staff directory forum signature (cached)" — this is the OLD discovery path. Discovery is now via Admin Tier 2 HTML comment (`admin/index.html` line 351: `restwell.net/forum`). **Note:** The "150+ portal points" gate referenced in earlier audit notes is not code-enforced — Admin Tier 2 is credential-gated only (requires finding `7A-RC-2012`). There is no hard point threshold in deployed code. | 🔴 | Update Phase 2 discovery mechanism. Remove any references to a 150-point threshold. |
| R-03 | Phase 1 blockers still show "PDFs not generated; images placeholder; fax IVR untested" — check if PDFs have been generated since April 30 | 🟡 | Verify and update blockers |
| R-04 | Milestone table references `restwell_found` (40 pts) as "future" — correct, still future, but note it now fires when player visits forum discovered via Admin Tier 2 | 🟡 | Add context note |
| R-05 | `www.somnatek.org` is marked ✅ complete in Phase 0 checklist (line 46: "www.somnatek.org DNS alias — cert and nginx both cover www") but also appears as an unchecked item in the launch checklist section lower in the same doc. Contradicts itself. (INC-015) | 🟡 | Remove duplicate unchecked item from launch checklist, or confirm Phase 0 entry is authoritative |
| R-06 | Phase 5 (Visitor Classification) marked "Not started" — but email Level 1/2/3 classification is **live right now** via `lambda/email-responder`. The disconnect is that Phase 5 refers to the opt-in form, VIS upgrade, and SMS path — not the passive inbound email system. This distinction is not documented anywhere. (INC-008) | 🟡 | Add note: "Email inbound classification is live (passive). Formal opt-in flow, SMS, and portal state escalation remain not started." |

---

## 2. `sleep-clinic-arg-plan.md`

**Reviewing agent: Narrative Architect** (lore sections) + **Flow Engineer** (phase structure)

This is the original design doc written before deployment. It has the most inconsistencies because it predates the live build.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| P-01 | "longitudinal study from **2008 to 2014**" — **WRONG**. Canonical: study ran 2008–2013. Clinic closed 2014. | 🔴 | Change to "2008 to 2013" |
| P-02 | "The study began with **forty-two** patients" — **WRONG**. Canonical: 47. (Fixed in story-breakdown.md and admin HTML, not fixed here.) | 🔴 | Change to "forty-seven" |
| P-03 | Dorsal Health Holdings registered "**two months** after the patient file transfer" — **WRONG**. Canonical: six weeks (registered 2014-11-03, ~6 weeks after Sept 18 closure). | 🔴 | Change to "six weeks" |
| P-04 | Phase 2 RestWell: "Discoverable through a Somnatek staff directory forum signature (cached)" — **WRONG**. Discovery is now via Admin Tier 2 HTML source (`admin/index.html`). There is no code-enforced point threshold — access requires finding and entering credential `7A-RC-2012`. | 🔴 | Update to: discovered via Admin Tier 2 HTML comment in admin/index.html |
| P-05 | Week 2 launch plan: "Add / reveal RestWell forum" — RestWell is now gated behind mid-game milestone, not a Week 2 drop. | 🔴 | Update launch timeline |
| P-06 | Player journey diagram: "finds RestWell forum (week 2+)" — same issue as P-05. | 🔴 | Update diagram |
| P-07 | Escalation arc table Stage 6: "Reach RestWell" — the stage number/position is fine, but the method should reference the Admin Tier 2 discovery path. | 🟡 | Add parenthetical note |
| P-08 | Three DynamoDB tables listed (`somnatek-visitors`, `somnatek-solve-state`, `somnatek-content-ledger`) — actual deployment uses **one table**: `somnatek-visitors`. Solve state is stored as attributes on VIS records, not a separate table. | 🟡 | Update to reflect single-table design |
| P-09 | Site structure uses `somnatek.example`, `restwell.example` placeholder domains — should reference real deployed domains `somnatek.org`, `restwell.net` | 🟡 | Update domain names |
| P-10 | "Lambda endpoints like /api/portal-login **to be built**" — **all Lambda endpoints are built and deployed**. | 🟡 | Remove "to be built" language throughout |
| P-11 | Patient 041 referred to as "Patient 041" throughout — canonical ID format is `PTX-041`. | 🟡 | Standardize to PTX-041 |
| P-12 | Uses "dream" language in post-2011 in-world planning contexts. Not in-world copy, so not a hard violation, but inconsistent with lore rule: "Never call it a dream in internal documents after 2011." | 🟡 | Replace "dream" with "indexed space" / "night floor" in post-2011 references |
| P-13 | "Puzzle 1: Participant ID found in a **redacted PDF**" — actual implementation: IDs discovered through PDF form number cipher, admin HTML, and portal table footnote (not imperfect redaction). | 🟡 | Update puzzle description to match as-built mechanic |
| P-14 | "Player calls the **740 number**" in the player journey / phone system section — **WRONG**. No 740 number exists in this deployment. Canonical main clinic line is `(404) 551-4145`. (INC-005) | 🔴 | Replace "740 number" with `(404) 551-4145` |
| P-15 | Same doc says portal is deployed (line 9: "portal puzzle... deployed") and later says `lambda/portal-login` is "to be built" and portal login is "Not yet built" (lines ~897, ~980). This is an internal contradiction in the same file, not just stale language. (INC-003) | 🔴 | Update all lower "How it works" and infrastructure sections to reflect deployed portal |
| P-16 | Site tree at lines ~445–484 uses `.example` placeholder domains (`somnatek.example`, `restwell.example`) alongside current deployed paths elsewhere in the same doc. Should be labeled as "early concept — non-canonical" or replaced with actual paths. (LOW-004) | 🟡 | Label the .example tree as "early concept sketch" or update to actual deployed paths from roadmap.md |

---

## 3. `sleep-clinic-arg-story-breakdown.md`

**Reviewing agent: Narrative Architect**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| S-01 | Act 5: active recall manifest shows entries "below **PTX-047**" with VIS series starting at "**VIS-001**" — canonical VIS format is `VIS-XXXXX` (5-digit zero-padded), so it should be `VIS-00001`. | 🔴 | Change "VIS-001" to "VIS-00001" |
| S-02 | Act 4 (The Forum) line 209: **"Players find it through a Somnatek forum signature embedded in a cached version of the staff directory"** — this is the OLD discovery path. RestWell is now discovered via Admin Tier 2 HTML source. Story-breakdown.md still describes the old path and has not been updated. Note: `p_holloway` is referenced in RestWell site files but does **not** appear in story-breakdown.md — the claim that this doc correctly describes p_holloway was a false positive. | 🔴 | Update Act 4 to describe Admin Tier 2 discovery path. Add p_holloway reference if desired. |
| S-03 | Lines 103 and 229: **"two months after Somnatek's closure filing"** — **WRONG**. Canonical is six weeks (Dorsal registered 2014-11-03, ~6 weeks after Sept 18 closure). Was incorrectly marked clean in previous audit pass. | 🔴 | Change both instances of "two months" to "six weeks" |
| S-04 | Participant count: "forty-seven patients" — ✅ correct after this session's fix. | 🟢 | Clean |
| S-05 | PTX-047 as "the last PTX-series entry" — ✅ consistent with admin HTML (47 enrolled, VIS series starts after). | 🟢 | Clean |
| S-06 | RestWell discovery path in Act 4: correctly describes Admin Tier 2 HTML source annotation — ✅ updated this session. | 🟢 | Clean |
| S-07 | MarauderBlue's "Caleb R." — used in plan.md and story-breakdown.md. Confirm this is an intentional partial name (not a placeholder). Used consistently across both docs. | 🟡 | Confirm intentional. If placeholder, decide on canonical last name or keep partial. |

---

## 4. `sleep-clinic-arg-live-operations.md`

**Reviewing agent: Live Ops Puppetmaster**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| L-01 | Stage 2 marked as live — ✅ confirmed in roadmap. | 🟢 | Clean |
| L-02 | Stages 3–6 marked as planned — ✅ accurate. | 🟢 | Clean |
| L-03 | Email responder described correctly (Level 1/2/3 classification, Bedrock/Claude 3 Haiku, SHA-256 sender hash) — ✅ matches deployed code. | 🟢 | Clean |
| L-04 | "RestWell forum lockdown" listed as a monthly event example — fine as a planned future live event. No inconsistency. | 🟢 | Clean |
| L-05 | Content cadence (daily micro-drops, weekly major drops, monthly events) — doc references "EventBridge Scheduler... not yet implemented." Confirmed not yet built. ✅ accurate. | 🟢 | Clean |
| L-06 | "Stage 3: The Archive Responds — not yet built." Trigger conditions (100 Discord members, 30 days, 10+ Level 3 emails) are in `scripts/discord-channel-pins.txt` and `scripts/seed-content-ledger.js`. Doc does not reference these scripts. | 🟡 | Add cross-reference to scripts/ for Stage 3 trigger implementation |
| L-07 | "Unusual access pattern detected" reactive copy example — live Stage 3 copy should exist in a staged content plan. Currently only described in narrative here and in live-ops. No staged file yet. | 🟡 | Track as a staged content item to create |
| L-08 | Doc instructs operators to update `somnatek-content-ledger` during manual drops. But `audit.md` notes the content ledger table is not confirmed deployed. If the table doesn't exist, this workflow is broken with no fallback described. (INC-007) | 🔴 | Confirm whether `somnatek-content-ledger` DynamoDB table is deployed. If not, add manual placeholder instructions or mark as future workflow. |
| L-09 | Email responder operational status described as "live" but no record of all three classification levels being tested. Should split into: code built / deployed / L1 live-tested / L2 live-tested / L3 live-tested. (LOW-002) | 🟡 | Add three-state status tracking for email responder in live ops runbook |
| L-10 | `fax_decoded` milestone is listed in roadmap as "released" but fax IVR is noted as untested in multiple docs. If the milestone can't actually be triggered (because the IVR is untested), it should not be marked released. (LOW-003) | 🟡 | Confirm fax IVR live test result. If untested, change `fax_decoded` to unreleased and document as passive signal with no milestone credit until confirmed. |

---

## 5. `sleep-clinic-arg-monetization.md`

**Reviewing agent: Monetization Architect**

This document requires the most significant rewrite of any file in the docs folder.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| M-01 | Patreon tier structure is wrong. Doc shows $3–5 Observer / $8–12 Records / $20–30 Archive (3 tiers). `scripts/patreon-observer-tier.txt` documents only a **single $5 Observer tier** — this is the only tier with committed documentation. A 6-tier structure ($3 Supporter / $5 Observer / $8 Insider / $15 Investigator / $30 Director's Circle / $100 Patron) was planned in session but is not in any script or committed file beyond this conversation. The monetization doc should be updated to reflect what is actually documented: the $5 Observer tier is confirmed; additional tiers are proposed but not finalized. | 🔴 | Rewrite Patreon section to accurately reflect: $5 Observer tier confirmed; additional tiers proposed (list them) but not yet documented in committed files |
| M-02 | "RestWell forum sticker pack" listed on **public merch** — RestWell is a mid-game gated discovery. Advertising it on the public store spoils its existence for new players. | 🔴 | Remove from public merch entirely |
| M-03 | **No gated/unlockable merch system** exists anywhere in this document. The PTX-047 shirt, Active Recall designation card, RECALLED print, etc. are completely absent. | 🔴 | Add full gated merch section (5 tiers: public, Tier 1–4 portal-milestone unlocks) |
| M-04 | **No mention of VIS IDs, portal milestones, or unlock codes** — the live game's progression system isn't referenced once. | 🔴 | Add unlock code mechanic section |
| M-05 | Phase 1 description is bare-bones ("first hidden puzzle layer, email signup"). Actual Phase 1 is fully built: portal, admin tiers, fax line, email responder, RestWell, 25-drop content ledger. | 🟡 | Update Phase 1 description to reflect live state |
| M-06 | No mention that RestWell branding should NOT appear on public merch (it's a late-game discovery). | 🔴 | Add to Design Rules and Do/Don't section |
| M-07 | Phase timeline does not reference Stage 3 trigger as a merch unlock moment. The RECALLED print (413 copies, limited forever) should be tied to Stage 3. | 🟡 | Add Stage 3 to monetization timeline |

**Overall verdict: Full rewrite required. Do not make incremental edits.**

---

## 6. `deploy.md`

**Reviewing agent: Senior SWE**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| D-01 | Domain table shows Somnatek intended domain as "**somnatekhealth.com**" — actual live domain is `somnatek.org`. | 🔴 | Update all references to somnatek.org |
| D-02 | Domain table shows RestWell as "**restwellonline.net**" — planned domain is `restwell.net`. | 🟡 | Update to restwell.net |
| D-03 | All instance ID references are placeholder "**i-YOURINSTANCEID**" — actual instance ID is `i-081a7e7e3c65b1f5d`. (This may be intentional to avoid committing infrastructure IDs publicly.) | 🟡 | Decision needed: replace or leave as placeholder with comment |
| D-04 | HTTPS/certbot section uses "somnatekhealth.com" in example commands — should be somnatek.org. | 🔴 | Update certbot commands |
| D-05 | "Option B: Direct rsync over SSH (if key pair configured)" — no key pair is configured on this deployment (SSM only). This section may mislead operators. | 🟡 | Add note: "No key pair is configured on the current deployment. Use Option A (S3 sync via SSM)." |
| D-06 | `EC2_KEY_PAIR_NAME` listed in environment variables table — not used in current deployment (SSM only). | 🟡 | Remove or annotate as unused |
| D-07 | Several sections in `deploy.md` reference `records@somnatek.org` correctly, but `tech-stack.md` uses `records@somnatekhealth.com` as the SES inbound address. One of these is wrong — both docs should match the verified SES domain. (INC-002) | 🔴 | Confirm canonical SES address and update `tech-stack.md` to match |
| D-08 | Phone/fax operational status across deploy.md, tech-stack.md, roadmap, and audit are contradictory: some say "live," some say "untested," some say "ready to deploy." No section provides a clean split of what has been confirmed working end-to-end. (INC-004) | 🟡 | Add a phone/fax status matrix: Lambda exists / Connect stack deployed / IVR tested / fax audio played live |

---

## 7. `tech-stack.md`

**Reviewing agent: Senior SWE**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| T-01 | Nginx virtual hosts table shows RestWell domain as "**restwellonline.net**" — planned/deployed domain is `restwell.net`. | 🔴 | Update to restwell.net |
| T-02 | "No CloudFront yet — planned upgrade path" mentioned in plan.md but tech-stack.md does not reflect this. CloudFront is described as a future consideration in plan.md but the CDK stacks (`SomnatekPortalStack`, `SomnatekBeaconStack`) are deployed as HTTP API Gateways, not CloudFront. Clarify CloudFront status. | 🟡 | Add note on current architecture (EC2 + nginx, no CloudFront for static serving) |
| T-03 | S3 bucket listed as deploy origin — consistent with actual use. ✅ | 🟢 | Clean |
| T-04 | Overall stack description is accurate and matches deployed reality. ✅ | 🟢 | Clean |
| T-05 | `tech-stack.md` lists SES inbound email address as `records@somnatekhealth.com` — **WRONG**. Canonical live address confirmed in plan.md, deploy.md, and roadmap is `records@somnatek.org`. (INC-002) | 🔴 | Update tech-stack.md SES section to `records@somnatek.org` |
| T-06 | Wexler and Harrow County domain examples vary across docs: `wexler.edu` (roadmap), `wexler-university.edu` (deploy.md), `wexler.org` (plan.md); `harrowcounty.gov` (roadmap/deploy), `harrow-county.org` (plan.md). The `.edu` and `.gov` variants look like real institution impersonation which the security rules explicitly prohibit. (INC-011) | 🔴 | Pick canonical fictional registrable domains for each. Do not use .edu or .gov as player-facing domains. Suggest: `wexler-univ.edu` → `wexleruniversity.net` or similar. |
| T-07 | Nginx virtual hosts section lists four web roots as if all four in-world sites are in production. Only `somnatek.org` is production. This misrepresents the current state. (LOW-001) | 🟡 | Add note: nginx is provisioned for four virtual hosts; only Somnatek has production content currently |

---

## 8. `sleep-clinic-arg-reference-links.md`

**Reviewing agent: Narrative Architect**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| Ref-01 | No lore inconsistencies. All links and descriptions are meta/reference. ✅ | 🟢 | Clean |
| Ref-02 | Twitter link for "The Sun Vanished" uses old domain (twitter.com) — consider updating to x.com if it matters. Minor. | 🟡 | Optional update |

---

## 9. `audit.md` (existing technical audit)

**Reviewing agent: Evidence Board**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| A-01 | Rabbit holes section: "Lena Ortiz HTML comment (RestWell URL) \| staff.html \| ✅" — **WRONG after today's session**. RestWell URL and credentials were removed from staff.html. Discovery vector is now Admin Tier 2 HTML source. | 🔴 | Update rabbit hole entry |
| A-02 | ~~Security note about Math.random() in VIS ID generation~~ — **FALSE POSITIVE**. `lambda/portal-login/index.js` already uses `crypto.randomBytes()` (confirmed at line 31). The `Math.random()` that exists is in `lambda/email-responder/index.js` line 168 for generating a fake cosmetic in-world reference number (`DHHRMS-XXXXXX-2014`). This is not a security issue — it is an in-world display string with no security implications. The audit note in `audit.md` is stale and should be removed. | ✅ | Remove the security note from `audit.md` — it is no longer accurate |
| A-03 | Phase status column: privacy.html marked ❌ "not built" — check current state | 🟡 | Verify and update |
| A-04 | Audit date "April 30, 2026" — needs updating after today's changes | 🟡 | Update date and add May 1 change notes |
| A-05 | Milestone total inconsistency: `audit.md` Phase 1 total says **275 pts**; `roadmap.md` milestone table says released = **245 pts**, all-time = **315 pts**. These three numbers don't reconcile. The `fax_decoded` milestone (15 pts) being counted or not may explain part of the gap, but the full discrepancy is unexplained. (INC-014) | 🔴 | Recalculate from one source of truth (roadmap milestone table is most detailed). Update both files to match. |
| A-06 | `/admin/` described throughout audit as the player-facing solve path, but there is now also `/site-mgmt/` as the real operator admin. Older audit summaries could confuse the two surfaces. (INC-017) | 🟡 | Add a clear note to audit: `/admin/index.html` = in-world fiction (player solve path); `/site-mgmt/index.html` + `/api/admin` = real operator tooling (X-Site-Key protected) |
| A-07 | `7A_INTERNAL_DO_NOT_DISTRIBUTE` is described in audit as an HTML page (`audit.md:183`: `.html`), but `sleep-clinic-arg-story-breakdown.md` describes players **downloading a PDF** with that filename. The PDF does not exist — only the HTML stand-in is live. Story-facing docs should not claim players download a PDF until one exists. (INC-013) | 🔴 | Add audit note: HTML version is live stand-in. PDF is pending. Story-breakdown.md must be updated to not say "PDF download" until PDF is generated. |

---

## 10. Security & Compliance

**Reviewing agent: Senior SWE**

These issues were not surfaced in the initial audit pass. Added from `inconsistency-audit.md`.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| SEC-001 | ~~`docs/twilio_2FA_recovery_code.txt` in repo~~ — **RESOLVED**. File was never committed (`git log` returned no history for it). File is already deleted locally. `docs/twilio_2FA_recovery_code.txt` is already in `.gitignore`. No rotation required — the file was never in any pushed commit. | ✅ | No further action needed |
| SEC-002 | Multiple docs state "no real PII" as an absolute. But `tech-stack.md` explicitly documents storing: email address, visitor ID, consent timestamp, preferences, and unsubscribe status. These are PII under most privacy frameworks. The correct statement is "no sensitive medical PII; minimal opt-in contact PII only, handled per privacy policy." | 🟡 | Align PII language across all docs to: "no medical PII; minimal opt-in contact data only" |
| SEC-003 | `sleep-clinic-arg-monetization.md` and `sleep-clinic-arg-live-operations.md` both require privacy language for email collection before promotion. `audit.md` marks `privacy.html` as not built. `roadmap.md` marks opt-in/unsubscribe path as not started. The email responder is **already live** and responding to all inbound emails. This is a consent gap: players email a system that classifies and stores their interaction state before any privacy notice exists. | 🔴 | Confirm `privacy.html` current state. If not live, pause any promotion that drives inbound email until it is. Add privacy notice link to email footer responses from `lambda/email-responder`. |

---

## 11. Cross-Document Systemic Issues

These issues span multiple documents and can't be resolved by editing any single file.

| ID | Issue | Docs affected | Fix needed |
|---|---|---|---|
| SYS-01 | **Email address has two variants.** `records@somnatek.org` (plan.md, deploy.md, roadmap) vs `records@somnatekhealth.com` (tech-stack.md). Only one can be the verified SES domain. | tech-stack.md, plan.md, deploy.md | Confirm canonical SES verified domain. Update tech-stack.md. |
| SYS-02 | **RestWell has four different domain variants** across docs: `restwell.net` (roadmap, story-breakdown), `restwellonline.net` (tech-stack, deploy), `forum.restwellonline.net` (plan.md player journey), `restwell.org` (plan.md site structure). Every discovery clue, DNS table, and nginx config must use one domain. | roadmap, tech-stack, deploy, plan, story-breakdown | Pick canonical domain. Update all occurrences. Lena Ortiz HTML comment in Admin Tier 2 must use the chosen domain. |
| SYS-03 | **Wexler and Harrow County domains vary and some are `.edu`/`.gov`.** Wexler: `wexler.edu` (roadmap), `wexler-university.edu` (deploy), `wexler.org` (plan). Harrow: `harrowcounty.gov` (roadmap/deploy), `harrow-county.org` (plan). Using real TLD patterns (`.edu`, `.gov`) for player-facing fictional sites risks impersonation issues. | roadmap, tech-stack, deploy, plan | Choose fictional registrable domains. Suggested: `wexleruniversity.net`, `harrowcountyrecords.com` or similar. |
| SYS-04 | **Phone/fax status is contradictory across four docs.** tech-stack.md says phone stack deployed/live. audit.md says IVR unconfirmed and phone-responder missing. roadmap says fax flow created but untested. plan.md says phone ready to deploy. | roadmap, tech-stack, audit, plan, deploy | Create a single phone/fax status matrix. Fields: Lambda built / Lambda deployed / Connect stack deployed / IVR end-to-end tested / Fax audio confirmed playing live. |
| SYS-05 | **Study date canonical split not documented uniformly.** Some docs say "2008–2013." Some say "2008 to 2014." The correct split is: active study 2008–2013; termination/closure process 2013–2014; public closure date September 18, 2014. This three-part split is not stated clearly in any single document. | plan.md, story-breakdown.md, roadmap.md | Add canonical date note to AGENTS.md shared rules and update plan.md. |
| SYS-06 | **Content ledger described as active workflow but deployment unconfirmed.** live-ops instructs operators to update `somnatek-content-ledger` DynamoDB table during manual drops. audit.md says this table is not confirmed deployed. `scripts/seed-content-ledger.js` exists but its run status is unknown. | live-ops, audit, roadmap, plan | Confirm table exists: `aws dynamodb describe-table --table-name somnatek-content-ledger`. If not deployed, seed script needs to be run or CDK updated. |
| SYS-07 | **Email opt-in vs direct inbound classification creates a consent gap.** live-ops and monetization describe email as opt-in only. But the email responder responds to any email sent to `records@somnatek.org` — no opt-in required. Players are being classified and tracked (SHA-256 hashed sender, level stored in DynamoDB) before any opt-in form exists. This is by design for immersion but needs privacy/consent documentation. | live-ops, monetization, deploy, plan | Document explicitly: "records@somnatek.org inbound classification is passive — any email triggers it." Add to privacy.html when built. Separate from formal subscriber opt-in system. |

---

## Cross-Document Inconsistency Matrix

Conflicts where two or more docs say different things about the same fact:

| Fact | Correct value | Wrong in |
|---|---|---|
| Study period | 2008–2013 (active); closure process 2013–2014; public closure Sept 18, 2014 | `sleep-clinic-arg-plan.md` says "2008 to 2014" |
| Participant count | 47 | `sleep-clinic-arg-plan.md` says "forty-two" |
| Dorsal registration timing | Six weeks after closure | `sleep-clinic-arg-plan.md` player journey says "two months" |
| RestWell domain | **Unresolved** — 4 variants exist | `tech-stack.md` / `deploy.md` say "restwellonline.net"; `plan.md` also uses "restwell.org" and "forum.restwellonline.net"; `roadmap.md` / `story-breakdown.md` say "restwell.net" |
| Wexler domain | **Unresolved** — pick a non-.edu fictional domain | `roadmap.md` uses `wexler.edu`; `deploy.md` uses `wexler-university.edu`; `plan.md` uses `wexler.org` |
| Harrow County domain | **Unresolved** — pick a non-.gov fictional domain | `roadmap.md` / `deploy.md` use `harrowcounty.gov`; `plan.md` uses `harrow-county.org` |
| RestWell discovery path | Admin Tier 2 HTML source, 150+ pts | `roadmap.md`, `sleep-clinic-arg-plan.md`, `audit.md` all reference old staff.html path |
| Somnatek main domain | `somnatek.org` | `deploy.md` uses `somnatekhealth.com` throughout |
| SES inbound email address | `records@somnatek.org` | `tech-stack.md` uses `records@somnatekhealth.com` |
| Canonical phone number | `(404) 551-4145` (main); `(404) 671-9774` (fax) | `sleep-clinic-arg-plan.md` says "the 740 number" |
| VIS ID format in manifest | `VIS-00001` (5-digit zero-padded) | `sleep-clinic-arg-story-breakdown.md` Act 5 says "VIS-001" |
| 7A internal artifact type | HTML stand-in live; PDF not yet generated | `sleep-clinic-arg-story-breakdown.md` says players download a PDF |
| Milestone total (Phase 1) | Roadmap: released=245, all-time=315 | `audit.md` says 275 |
| `www.somnatek.org` status | Complete (Phase 0 checklist confirms) | Also appears as unchecked item in `roadmap.md` launch checklist |
| DynamoDB table count | 1 table active (`somnatek-visitors`); 2 others planned | `plan.md` and `tech-stack.md` describe 3 active tables |
| Content ledger deployment | Unconfirmed — script exists, run status unknown | `live-ops` treats it as live workflow |
| RestWell on public merch | Not allowed (late-game spoiler) | `sleep-clinic-arg-monetization.md` lists "RestWell forum sticker pack" on public merch |

---

## Priority Fix Order

### Urgent (security / credentials)

0. ~~**SEC-001**~~ — **RESOLVED.** Twilio recovery code was never committed. Already in `.gitignore`.

### Immediate (lore-breaking or consent gap)

1. ~~**A-02**~~ — **FALSE POSITIVE.** `portal-login` already uses `crypto.randomBytes()`. `Math.random()` in `email-responder` is a cosmetic in-world reference string, not a security issue. Remove stale note from `audit.md`.
2. **SEC-003** — Confirm `privacy.html` is live before any promotion push drives inbound email volume
3. **S-02** — `sleep-clinic-arg-story-breakdown.md` line 209: RestWell discovery path still describes old staff directory path
4. **S-03** — `sleep-clinic-arg-story-breakdown.md` lines 103 + 229: "two months" → "six weeks" (Dorsal registration)
5. **T-05** — `tech-stack.md`: `records@somnatekhealth.com` → `records@somnatek.org`
6. **P-14** — `sleep-clinic-arg-plan.md`: "740 number" → `(404) 551-4145`
7. **P-01** — `sleep-clinic-arg-plan.md`: study period "2008 to 2014" → "2008 to 2013"
8. **P-02** — `sleep-clinic-arg-plan.md`: "forty-two" → "forty-seven"
9. **P-03** — `sleep-clinic-arg-plan.md`: "two months" → "six weeks" (Dorsal registration)
10. **P-04/P-05/P-06/P-15** — `sleep-clinic-arg-plan.md`: RestWell discovery path + portal "to be built" contradiction updated throughout
11. **S-01** — `sleep-clinic-arg-story-breakdown.md`: "VIS-001" → "VIS-00001"
12. **A-07** — `audit.md` / `story-breakdown.md`: 7A artifact HTML vs PDF — story must not say "PDF download" until PDF exists
13. **A-01** — `audit.md`: RestWell rabbit hole entry updated
14. **A-05** — `audit.md` / `roadmap.md`: milestone total reconciliation
15. **M-01 through M-07** — `sleep-clinic-arg-monetization.md`: full rewrite
16. **SYS-02** — Choose canonical RestWell domain and update all occurrences across all docs + deployed HTML comment
17. **SYS-03** — Choose canonical Wexler/Harrow domains (non-.edu/.gov)

### Next (outdated but not broken)

16. **D-01 / D-04** — `deploy.md`: `somnatekhealth.com` → `somnatek.org`
17. **T-06** — `tech-stack.md`: Wexler/Harrow domain table updated
18. **T-07** — `tech-stack.md`: nginx 4-host note added
19. **R-01 / R-02** — `roadmap.md`: Phase 2 status and discovery path
20. **R-05** — `roadmap.md`: www.somnatek.org duplicate checklist item
21. **R-06** — `roadmap.md`: Phase 5 distinction (passive email live vs opt-in not started)
22. **L-08** — `live-ops`: content ledger deployment confirmation / fallback
23. **L-10** — `live-ops` / `roadmap`: fax_decoded milestone status
24. **P-08** — `sleep-clinic-arg-plan.md`: three DynamoDB tables → single active table
25. **P-10** — `sleep-clinic-arg-plan.md`: remove "to be built" language for deployed Lambdas
26. **P-11** — `sleep-clinic-arg-plan.md`: "Patient 041" → "PTX-041"
27. **SYS-06** — Confirm content ledger table deployed (`aws dynamodb describe-table`)

### Low priority / optional

28. **P-09** — `sleep-clinic-arg-plan.md`: `.example` placeholder domain tree labeled as non-canonical (P-16)
29. **P-12** — `sleep-clinic-arg-plan.md`: "dream" language post-2011
30. **S-07** — `sleep-clinic-arg-story-breakdown.md`: confirm "Caleb R." is intentional
31. **Ref-02** — `sleep-clinic-arg-reference-links.md`: Twitter → X
32. **D-03** — `deploy.md`: instance ID placeholder decision
33. **D-05/D-06/D-07/D-08** — `deploy.md`: SSH/key pair notes, email address, phone status matrix
34. **A-06** — `audit.md`: /admin vs /site-mgmt distinction
35. **L-06/L-07/L-09** — `live-ops`: Stage 3 cross-refs, email 3-state status
36. **SEC-002** — Align "no PII" language across docs to "no medical PII; minimal opt-in contact data"

---

## Docs Reviewed

| File | Agent | Status |
|---|---|---|
| `roadmap.md` | Flow Engineer | 🟡 6 issues |
| `sleep-clinic-arg-plan.md` | Narrative Architect / Flow Engineer | 🔴 16 issues — oldest doc, most drift |
| `sleep-clinic-arg-story-breakdown.md` | Narrative Architect | 🟡 1 critical, 1 confirm needed |
| `sleep-clinic-arg-live-operations.md` | Live Ops Puppetmaster | 🟡 6 issues incl. content ledger gap |
| `sleep-clinic-arg-monetization.md` | Monetization Architect | 🔴 Full rewrite required |
| `deploy.md` | Senior SWE | 🔴 Domain wrong throughout, phone status unclear |
| `tech-stack.md` | Senior SWE | 🔴 Email address wrong, domain table wrong |
| `sleep-clinic-arg-reference-links.md` | Narrative Architect | 🟢 Clean |
| `audit.md` | Evidence Board | 🔴 RestWell entry stale, security issues live, milestone totals wrong |
| `twilio_2FA_recovery_code.txt` | Senior SWE | 🔴 **Credential file in repo — rotate and remove immediately** |

**Cross-document systemic issues:** 7 (SYS-01 through SYS-07)
**Security issues:** 3 (SEC-001 through SEC-003)
