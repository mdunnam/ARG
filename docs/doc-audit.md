# Somnatek ARG — Documentation Consistency Audit

**Audited:** May 1, 2026 — updated May 1, 2026 (full fix pass)
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
| R-01 | Phase 2 (RestWell) status is "Not started" — RestWell is **built** (`sites/restwell/` is complete). It is gated from discovery, not unbuilt. Status should reflect this. | ✅ | Changed to "⚠️ Site built, gated" with discovery path note |
| R-02 | Phase 2 description says RestWell is "discoverable through a Somnatek staff directory forum signature (cached)" — this is the OLD discovery path. Discovery is now via Admin Tier 2 HTML comment (`admin/index.html` line 351: `restwell.net/forum`). **Note:** The "150+ portal points" gate referenced in earlier audit notes is not code-enforced — Admin Tier 2 is credential-gated only (requires finding `7A-RC-2012`). There is no hard point threshold in deployed code. | ✅ | Phase 2 description updated to Admin Tier 2 discovery path. 150-point threshold claim removed. |
| R-03 | Phase 1 blockers still show "PDFs not generated; images placeholder; fax IVR untested" — check if PDFs have been generated since April 30 | ✅ | Milestone table updated to code-accurate values (330/445 pts); fax_decoded noted as untested. PDFs and images remain placeholder — blockers still accurate, updated text in table. |
| R-04 | Milestone table references `restwell_found` (40 pts) as "future" — correct, still future, but note it now fires when player visits forum discovered via Admin Tier 2 | ✅ | Added context note: fires when player visits RestWell forum (Admin Tier 2 discovery path) |
| R-05 | `www.somnatek.org` is marked ✅ complete in Phase 0 checklist (line 46: "www.somnatek.org DNS alias — cert and nginx both cover www") but also appears as an unchecked item in the launch checklist section lower in the same doc. Contradicts itself. (INC-015) | ✅ | Launch checklist item changed to checked with note "(confirmed — Phase 0 checklist)" |
| R-06 | Phase 5 (Visitor Classification) marked "Not started" — but email Level 1/2/3 classification is **live right now** via `lambda/email-responder`. The disconnect is that Phase 5 refers to the opt-in form, VIS upgrade, and SMS path — not the passive inbound email system. This distinction is not documented anywhere. (INC-008) | ✅ | Phase 5 updated to "⚠️ Partial" with note: passive inbound email classification live; formal opt-in/SMS/VIS upgrade not started. |

---

## 2. `sleep-clinic-arg-plan.md`

**Reviewing agent: Narrative Architect** (lore sections) + **Flow Engineer** (phase structure)

This is the original design doc written before deployment. It has the most inconsistencies because it predates the live build.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| P-01 | "longitudinal study from **2008 to 2014**" — **WRONG**. Canonical: study ran 2008–2013. Clinic closed 2014. | ✅ | Changed to "2008 to 2013" |
| P-02 | ~~"The study began with **forty-two** patients" — WRONG. Canonical: 47.~~ **FALSE POSITIVE.** The text "forty-two" does not appear in `sleep-clinic-arg-plan.md`. The participant count is not stated in this doc. | ✅ | No fix needed |
| P-03 | Dorsal Health Holdings registered "**two months** after the patient file transfer" — **WRONG**. Canonical: six weeks (registered 2014-11-03, ~6 weeks after Sept 18 closure). | ✅ | Changed to "six weeks" |
| P-04 | Phase 2 RestWell: "Discoverable through a Somnatek staff directory forum signature (cached)" — **WRONG**. Discovery is now via Admin Tier 2 HTML source (`admin/index.html`). There is no code-enforced point threshold — access requires finding and entering credential `7A-RC-2012`. | ✅ | Updated to Admin Tier 2 discovery. No point threshold referenced. |
| P-05 | Week 2 launch plan: "Add / reveal RestWell forum" — RestWell is now gated behind mid-game milestone, not a Week 2 drop. | ✅ | Week 2 section rewritten; RestWell note added explaining gate |
| P-06 | Player journey diagram: "finds RestWell forum (week 2+)" — same issue as P-05. | ✅ | Diagram updated to Admin Tier 2 → RestWell path |
| P-07 | Escalation arc table Stage 6: "Reach RestWell" — the stage number/position is fine, but the method should reference the Admin Tier 2 discovery path. | ✅ | Stage 6 entry updated: "Reach RestWell (via Admin Tier 2 HTML source — credential `7A-RC-2012` required)" |
| P-08 | Three DynamoDB tables listed (`somnatek-visitors`, `somnatek-solve-state`, `somnatek-content-ledger`) — actual deployment uses **one table**: `somnatek-visitors`. Solve state is stored as attributes on VIS records, not a separate table. | ✅ | Table section updated: `somnatek-visitors` marked Deployed; other two marked Planned with explanation |
| P-09 | Site structure uses `somnatek.example`, `restwell.example` placeholder domains — should reference real deployed domains `somnatek.org`, `restwell.net` | ✅ | Tree labeled as early concept sketch (P-16 fix). Canonical paths in roadmap.md. |
| P-10 | "Lambda endpoints like /api/portal-login **to be built**" — **all Lambda endpoints are built and deployed**. | ✅ | Changed to "deployed — SomnatekPortalStack"; infrastructure table updated to Deployed |
| P-11 | Patient 041 referred to as "Patient 041" throughout — canonical ID format is `PTX-041`. | ✅ | Changed to PTX-041 |
| P-12 | Uses "dream" language in post-2011 in-world planning contexts. Not in-world copy, so not a hard violation, but inconsistent with lore rule: "Never call it a dream in internal documents after 2011." | ✅ | Phase 3 section updated: staff no longer "called it a dream" — now "indexed space (post-2011 internal documents use 'the night floor' or 'the Dorsal site' exclusively)" |
| P-13 | "Puzzle 1: Participant ID found in a **redacted PDF**" — actual implementation: IDs discovered through PDF form number cipher, admin HTML, and portal table footnote (not imperfect redaction). | ✅ | Puzzle 1 description updated to as-built mechanic: trailing digits of PDF form numbers, portal table footnote, or admin HTML source |
| P-14 | "Player calls the **740 number**" in the player journey / phone system section — **WRONG**. No 740 number exists in this deployment. Canonical main clinic line is `(404) 551-4145`. (INC-005) | ✅ | Changed to `(404) 551-4145` |
| P-15 | Same doc says portal is deployed (line 9: "portal puzzle... deployed") and later says `lambda/portal-login` is "to be built" and portal login is "Not yet built" (lines ~897, ~980). This is an internal contradiction in the same file, not just stale language. (INC-003) | ✅ | Infrastructure table updated; "to be built" language removed |
| P-16 | Site tree at lines ~445–484 uses `.example` placeholder domains (`somnatek.example`, `restwell.example`) alongside current deployed paths elsewhere in the same doc. Should be labeled as "early concept — non-canonical" or replaced with actual paths. (LOW-004) | ✅ | Labeled as early concept sketch; note added pointing to roadmap.md for canonical paths |

---

## 3. `sleep-clinic-arg-story-breakdown.md`

**Reviewing agent: Narrative Architect**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| S-01 | Act 5: active recall manifest shows entries "below **PTX-047**" with VIS series starting at "**VIS-001**" — canonical VIS format is `VIS-XXXXX` (5-digit zero-padded), so it should be `VIS-00001`. | ✅ | Changed to "VIS-00001" |
| S-02 | Act 4 (The Forum) line 209: **"Players find it through a Somnatek forum signature embedded in a cached version of the staff directory"** — this is the OLD discovery path. RestWell is now discovered via Admin Tier 2 HTML source. Story-breakdown.md still describes the old path and has not been updated. Note: `p_holloway` is referenced in RestWell site files but does **not** appear in story-breakdown.md — the claim that this doc correctly describes p_holloway was a false positive. | ✅ | Act 4 updated to describe Admin Tier 2 discovery path. |
| S-03 | Lines 103 and 229: **"two months after Somnatek's closure filing"** — **WRONG**. Canonical is six weeks (Dorsal registered 2014-11-03, ~6 weeks after Sept 18 closure). Was incorrectly marked clean in previous audit pass. | ✅ | Both instances changed to "six weeks" |
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
| L-06 | "Stage 3: The Archive Responds — not yet built." Trigger conditions (100 Discord members, 30 days, 10+ Level 3 emails) are in `scripts/discord-channel-pins.txt` and `scripts/seed-content-ledger.js`. Doc does not reference these scripts. | ✅ | Added Stage 3 trigger conditions block with cross-references to `scripts/discord-channel-pins.txt` and `scripts/seed-content-ledger.js` |
| L-07 | "Unusual access pattern detected" reactive copy example — live Stage 3 copy should exist in a staged content plan. Currently only described in narrative here and in live-ops. No staged file yet. | 🟡 | Track as a staged content item to create — **operator action required** before Stage 3 fires |
| L-08 | Doc instructs operators to update `somnatek-content-ledger` during manual drops. But `audit.md` notes the content ledger table is not confirmed deployed. If the table doesn't exist, this workflow is broken with no fallback described. (INC-007) | ✅ | **Confirmed not deployed** (`ResourceNotFoundException`). live-ops updated: step 3 annotated as blocked; fallback is to track releases in roadmap.md changelog until table is provisioned. |
| L-09 | Email responder operational status described as "live" but no record of all three classification levels being tested. Should split into: code built / deployed / L1 live-tested / L2 live-tested / L3 live-tested. (LOW-002) | ✅ | Added 5-row operational status table to live-ops email section: Lambda built ✅, deployed ✅, L1/L2/L3 all ⚠️ Unconfirmed |
| L-10 | `fax_decoded` milestone is listed in roadmap as "released" but fax IVR is noted as untested in multiple docs. If the milestone can't actually be triggered (because the IVR is untested), it should not be marked released. (LOW-003) | ✅ | live-ops phone/fax status table added (IVR unconfirmed; `fax_decoded` blocked). roadmap milestone table now notes fax IVR untested. Milestone remains `released:true` in code — operator should confirm IVR or disable milestone. |

---

## 5. `sleep-clinic-arg-monetization.md`

**Reviewing agent: Monetization Architect**

This document requires the most significant rewrite of any file in the docs folder.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| M-01 | Patreon tier structure is wrong. Doc shows $3–5 Observer / $8–12 Records / $20–30 Archive (3 tiers). `scripts/patreon-observer-tier.txt` documents only a **single $5 Observer tier** — this is the only tier with committed documentation. A 6-tier structure ($3 Supporter / $5 Observer / $8 Insider / $15 Investigator / $30 Director's Circle / $100 Patron) was planned in session but is not in any script or committed file beyond this conversation. The monetization doc should be updated to reflect what is actually documented: the $5 Observer tier is confirmed; additional tiers are proposed but not finalized. | ✅ | Patreon section rewritten: $5 Observer confirmed; additional tiers listed as proposed/not finalized |
| M-02 | "RestWell forum sticker pack" listed on **public merch** — RestWell is a mid-game gated discovery. Advertising it on the public store spoils its existence for new players. | ✅ | Removed from public merch. Added to Tier 4 gated merch section only. |
| M-03 | **No gated/unlockable merch system** exists anywhere in this document. The PTX-047 shirt, Active Recall designation card, RECALLED print, etc. are completely absent. | ✅ | Added Section 2a: Gated/Unlock-Based Merch with 5-tier table (Public, Tier 1–4) |
| M-04 | **No mention of VIS IDs, portal milestones, or unlock codes** — the live game's progression system isn't referenced once. | ✅ | Section 2a added VIS ID / milestone / unlock code mechanic |
| M-05 | Phase 1 description is bare-bones ("first hidden puzzle layer, email signup"). Actual Phase 1 is fully built: portal, admin tiers, fax line, email responder, RestWell, 25-drop content ledger. | ✅ | Phase 1 section rewritten to reflect live state |
| M-06 | No mention that RestWell branding should NOT appear on public merch (it's a late-game discovery). | ✅ | Added to Section 2a design rules and Do/Don't section |
| M-07 | Phase timeline does not reference Stage 3 trigger as a merch unlock moment. The RECALLED print (413 copies, limited forever) should be tied to Stage 3. | ✅ | Phase 3 section now references Stage 3 `recalled_active` trigger and RECALLED print |

**Overall verdict: Full rewrite required. Do not make incremental edits.**

---

## 6. `deploy.md`

**Reviewing agent: Senior SWE**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| D-01 | Domain table shows Somnatek intended domain as "**somnatekhealth.com**" — actual live domain is `somnatek.org`. | ✅ | Updated to somnatek.org |
| D-02 | Domain table shows RestWell as "**restwellonline.net**" — planned domain is `restwell.net`. | ✅ | Updated to restwell.net |
| D-03 | All instance ID references are placeholder "**i-YOURINSTANCEID**" — actual instance ID is `i-081a7e7e3c65b1f5d`. (This may be intentional to avoid committing infrastructure IDs publicly.) | 🟡 | Decision needed: replace or leave as placeholder with comment |
| D-04 | HTTPS/certbot section uses "somnatekhealth.com" in example commands — should be somnatek.org. | ✅ | Updated certbot commands to somnatek.org |
| D-05 | "Option B: Direct rsync over SSH (if key pair configured)" — no key pair is configured on this deployment (SSM only). This section may mislead operators. | ✅ | Added note: "No SSH key pair configured on current deployment. Use Option A." |
| D-06 | `EC2_KEY_PAIR_NAME` listed in environment variables table — not used in current deployment (SSM only). | ✅ | Annotated as "not used in current deployment (SSM only)" |
| D-07 | Several sections in `deploy.md` reference `records@somnatek.org` correctly, but `tech-stack.md` uses `records@somnatekhealth.com` as the SES inbound address. One of these is wrong — both docs should match the verified SES domain. (INC-002) | ✅ | tech-stack.md updated to `records@somnatek.org` |
| D-08 | Phone/fax operational status across deploy.md, tech-stack.md, roadmap, and audit are contradictory: some say "live," some say "untested," some say "ready to deploy." No section provides a clean split of what has been confirmed working end-to-end. (INC-004) | ✅ | Phone/fax status matrix added to deploy.md: Lambda built ✅, stack deployed ✅, phone number unconfirmed, IVR untested, fax audio untested, `fax_decoded` blocked |

---

## 7. `tech-stack.md`

**Reviewing agent: Senior SWE**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| T-01 | Nginx virtual hosts table shows RestWell domain as "**restwellonline.net**" — planned/deployed domain is `restwell.net`. | ✅ | Updated to restwell.net |
| T-02 | "No CloudFront yet — planned upgrade path" mentioned in plan.md but tech-stack.md does not reflect this. CloudFront is described as a future consideration in plan.md but the CDK stacks (`SomnatekPortalStack`, `SomnatekBeaconStack`) are deployed as HTTP API Gateways, not CloudFront. Clarify CloudFront status. | ✅ | Added note to tech-stack.md: "CloudFront is not currently deployed — all static serving goes through EC2 + nginx. Portal and Beacon use HTTP API Gateway." |
| T-03 | S3 bucket listed as deploy origin — consistent with actual use. ✅ | 🟢 | Clean |
| T-04 | Overall stack description is accurate and matches deployed reality. ✅ | 🟢 | Clean |
| T-05 | `tech-stack.md` lists SES inbound email address as `records@somnatekhealth.com` — **WRONG**. Canonical live address confirmed in plan.md, deploy.md, and roadmap is `records@somnatek.org`. (INC-002) | ✅ | Updated to `records@somnatek.org` |
| T-06 | Wexler and Harrow County domain examples vary across docs: `wexler.edu` (roadmap), `wexler-university.edu` (deploy.md), `wexler.org` (plan.md); `harrowcounty.gov` (roadmap/deploy), `harrow-county.org` (plan.md). The `.edu` and `.gov` variants look like real institution impersonation which the security rules explicitly prohibit. (INC-011) | ✅ | Canonicalized to `wexler.org` and `harrow-county.org` across deploy.md and tech-stack.md. |
| T-07 | Nginx virtual hosts section lists four web roots as if all four in-world sites are in production. Only `somnatek.org` is production. This misrepresents the current state. (LOW-001) | ✅ | Added note: nginx provisioned for four virtual hosts; only Somnatek has production content |

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
| A-01 | Rabbit holes section: "Lena Ortiz HTML comment (RestWell URL) \| staff.html \| ✅" — **WRONG after today's session**. RestWell URL and credentials were removed from staff.html. Discovery vector is now Admin Tier 2 HTML source. | ✅ | Updated to: Admin Tier 2 HTML source (`admin/index.html` line 351) |
| A-02 | ~~Security note about Math.random() in VIS ID generation~~ — **FALSE POSITIVE**. `lambda/portal-login/index.js` already uses `crypto.randomBytes()` (confirmed at line 31). The `Math.random()` that exists is in `lambda/email-responder/index.js` line 168 for generating a fake cosmetic in-world reference number (`DHHRMS-XXXXXX-2014`). This is not a security issue — it is an in-world display string with no security implications. The audit note in `audit.md` is stale and should be removed. | ✅ | Remove the security note from `audit.md` — it is no longer accurate |
| A-03 | Phase status column: privacy.html marked ❌ "not built" — check current state | ✅ | Marked ✅: built and synced to S3 on May 1, 2026 |
| A-04 | Audit date "April 30, 2026" — needs updating after today's changes | ✅ | Updated to May 1, 2026 |
| A-05 | Milestone total inconsistency: `audit.md` Phase 1 total says **275 pts**; `roadmap.md` milestone table says released = **245 pts**, all-time = **315 pts**. These three numbers don't reconcile. Source of truth is the code: MILESTONES array in `lambda/portal-login/index.js`. | ✅ | Recalculated from code. Released = **330 pts** (13 milestones). All-time = **445 pts** (including `recalled_active` 75 pts and `wexler_found` 40 pts). Updated in audit.md. |
| A-06 | `/admin/` described throughout audit as the player-facing solve path, but there is now also `/site-mgmt/` as the real operator admin. Older audit summaries could confuse the two surfaces. (INC-017) | ✅ | Admin portal row updated: `/admin/index.html` = in-world fiction (player solve path); `/site-mgmt/` + `/api/admin` = real operator tooling |
| A-07 | `7A_INTERNAL_DO_NOT_DISTRIBUTE` is described in audit as an HTML page (`audit.md:183`: `.html`), but `sleep-clinic-arg-story-breakdown.md` describes players **downloading a PDF** with that filename. The PDF does not exist — only the HTML stand-in is live. Story-facing docs should not claim players download a PDF until one exists. (INC-013) | ✅ | audit.md rabbit holes entry updated to reference `.html` stand-in. story-breakdown.md note: needs separate fix in Act 3 section when PDF is generated. |

---

## 10. Security & Compliance

**Reviewing agent: Senior SWE**

These issues were not surfaced in the initial audit pass. Added from `inconsistency-audit.md`.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| SEC-001 | ~~`docs/twilio_2FA_recovery_code.txt` in repo~~ — **RESOLVED**. File was never committed (`git log` returned no history for it). File is already deleted locally. `docs/twilio_2FA_recovery_code.txt` is already in `.gitignore`. No rotation required — the file was never in any pushed commit. | ✅ | No further action needed |
| SEC-002 | Multiple docs state "no real PII" as an absolute. But `tech-stack.md` explicitly documents storing: email address, visitor ID, consent timestamp, preferences, and unsubscribe status. These are PII under most privacy frameworks. The correct statement is "no sensitive medical PII; minimal opt-in contact PII only, handled per privacy policy." | ✅ | tech-stack.md Security Notes updated: "No sensitive medical data. No real patient records. Minimal opt-in contact data only (hashed email/phone, VIS ID, consent timestamp, level, preferences, unsubscribe status) — stored per privacy policy." |
| SEC-003 | `sleep-clinic-arg-monetization.md` and `sleep-clinic-arg-live-operations.md` both require privacy language for email collection before promotion. `audit.md` marks `privacy.html` as not built. `roadmap.md` marks opt-in/unsubscribe path as not started. The email responder is **already live** and responding to all inbound emails. This is a consent gap: players email a system that classifies and stores their interaction state before any privacy notice exists. | ✅ | `privacy.html` confirmed built and synced to S3 (May 1, 2026). live-ops passive classification note added. Formal opt-in/unsubscribe path remains not started. |

---

## 11. Cross-Document Systemic Issues

These issues span multiple documents and can't be resolved by editing any single file.

| ID | Issue | Docs affected | Fix needed |
|---|---|---|---|
| SYS-01 | **Email address has two variants.** `records@somnatek.org` (plan.md, deploy.md, roadmap) vs `records@somnatekhealth.com` (tech-stack.md). Only one can be the verified SES domain. | ✅ | `records@somnatek.org` confirmed canonical. tech-stack.md updated. |
| SYS-02 | **RestWell has four different domain variants** across docs: `restwell.net` (roadmap, story-breakdown), `restwellonline.net` (tech-stack, deploy), `forum.restwellonline.net` (plan.md player journey), `restwell.org` (plan.md site structure). Every discovery clue, DNS table, and nginx config must use one domain. | ✅ | `restwell.net` chosen as planned domain. All doc references updated. Domain **not yet registered** — purchase when Phase 2 launches. |
| SYS-03 | **Wexler and Harrow County domains vary and some are `.edu`/`.gov`.** | ✅ | `wexler.org` and `harrow-county.org` chosen as planned domains. All doc references updated. Domains **not yet registered** — purchase when Phase 3/4 launches. |
| SYS-04 | **Phone/fax status is contradictory across four docs.** | ✅ | Phone/fax status matrix added to deploy.md and live-ops.md. Single source of truth: Lambda ✅, stack ✅, IVR/fax audio ⚠️ unconfirmed. |
| SYS-05 | **Study date canonical split not documented uniformly.** Some docs say "2008–2013." Some say "2008 to 2014." The correct split is: active study 2008–2013; termination/closure process 2013–2014; public closure date September 18, 2014. | ✅ | plan.md opening paragraph updated with canonical three-part date split. |
| SYS-06 | **Content ledger described as active workflow but deployment unconfirmed.** live-ops instructs operators to update `somnatek-content-ledger` DynamoDB table during manual drops. audit.md says this table is not confirmed deployed. `scripts/seed-content-ledger.js` exists but its run status is unknown. | ✅ | **Confirmed not deployed** (ResourceNotFoundException). live-ops updated with fallback: skip ledger step, track manually in roadmap.md until `somnatek-content-ledger` is provisioned via `scripts/seed-content-ledger.js`. |
| SYS-07 | **Email opt-in vs direct inbound classification creates a consent gap.** live-ops and monetization describe email as opt-in only. But the email responder responds to any email sent to `records@somnatek.org` — no opt-in required. Players are being classified and tracked (SHA-256 hashed sender, level stored in DynamoDB) before any opt-in form exists. | ✅ | live-ops updated: passive classification note added with privacy.html link requirement. privacy.html is now live. Formal opt-in flow remains not started. |

---

## Cross-Document Inconsistency Matrix

Conflicts where two or more docs say different things about the same fact:

| Fact | Correct value | Wrong in |
|---|---|---|
| Study period | 2008–2013 (active); closure process 2013–2014; public closure Sept 18, 2014 | ✅ Fixed in plan.md |
| Participant count | 47 | ✅ story-breakdown.md correct; plan.md text didn't contain the wrong count (false positive) |
| Dorsal registration timing | Six weeks after closure | ✅ Fixed in plan.md and story-breakdown.md |
| RestWell domain | `restwell.net` | ⬜ Chosen as planned domain — **not yet registered** |
| Wexler domain | `wexler.org` | ⬜ Chosen as planned domain — **not yet registered** |
| Harrow County domain | `harrow-county.org` | ⬜ Chosen as planned domain — **not yet registered** |
| RestWell discovery path | Admin Tier 2 HTML source (`admin/index.html`) | ✅ Fixed in roadmap.md, plan.md, audit.md, story-breakdown.md |
| Somnatek main domain | `somnatek.org` | ✅ Fixed in deploy.md and tech-stack.md |
| SES inbound email address | `records@somnatek.org` | ✅ Fixed in tech-stack.md |
| Canonical phone number | `(404) 551-4145` (main); `(404) 671-9774` (fax) | ✅ Fixed in plan.md |
| VIS ID format in manifest | `VIS-00001` (5-digit zero-padded) | ✅ Fixed in story-breakdown.md |
| 7A internal artifact type | HTML stand-in live; PDF not yet generated | ✅ audit.md updated; story-breakdown PDF reference needs separate fix when PDF ships |
| Milestone total (released) | **330 pts** (13 milestones, from code) | ✅ Fixed in audit.md and roadmap.md |
| `www.somnatek.org` status | Complete | ✅ Launch checklist deduplicated |
| DynamoDB table count | 1 table active (`somnatek-visitors`); 2 others planned | ✅ Fixed in plan.md and tech-stack.md |
| RestWell on public merch | Not allowed (late-game spoiler) | ✅ Fixed in monetization.md |

---

## Priority Fix Order

### Urgent (security / credentials)

0. ✔ **SEC-001** — RESOLVED. Twilio recovery code never committed.

### Immediate (lore-breaking or consent gap) — all resolved

1. ✔ **A-02** — FALSE POSITIVE resolved.
2. ✔ **SEC-003** — `privacy.html` live and synced to S3.
3. ✔ **S-02** — story-breakdown Act 4 RestWell path updated.
4. ✔ **S-03** — story-breakdown "two months" → "six weeks" fixed.
5. ✔ **T-05** — tech-stack.md SES address fixed.
6. ✔ **P-14** — plan.md phone number fixed.
7. ✔ **P-01** — plan.md study period fixed.
8. ✔ **P-02** — false positive.
9. ✔ **P-03** — plan.md Dorsal timing fixed.
10. ✔ **P-04/P-05/P-06/P-15** — plan.md RestWell discovery + portal deployed.
11. ✔ **S-01** — story-breakdown VIS-001 → VIS-00001.
12. ✔ **A-07** — audit.md 7A HTML stand-in noted.
13. ✔ **A-01** — audit.md rabbit hole entry updated.
14. ✔ **A-05** — milestone totals reconciled (330/445).
15. ✔ **M-01 through M-07** — monetization.md rewritten.
16. ✔ **SYS-02** — restwell.net canonical.
17. ✔ **SYS-03** — wexler.org / harrow-county.org canonical.

### Next (outdated but not broken) — all resolved

18. ✔ **D-01/D-04** — deploy.md domain fixed.
19. ✔ **T-06** — tech-stack.md domain table fixed.
20. ✔ **T-07** — tech-stack.md nginx note added.
21. ✔ **R-01/R-02** — roadmap.md Phase 2 status and discovery.
22. ✔ **R-03/R-04** — roadmap.md milestone table corrected to 330/445.
23. ✔ **R-05** — roadmap.md www duplicate removed.
24. ✔ **R-06** — roadmap.md Phase 5 partial status.
25. ✔ **L-06** — live-ops Stage 3 cross-refs added.
26. ✔ **L-08** — live-ops content ledger fallback added (table confirmed not deployed).
27. ✔ **L-09** — live-ops email 3-state status table added.
28. ✔ **L-10** — live-ops fax status table added; fax_decoded blocked.
29. ✔ **P-07** — plan.md escalation arc Stage 6 updated.
30. ✔ **P-08** — plan.md DynamoDB single-table fixed.
31. ✔ **P-10** — plan.md portal deployed language.
32. ✔ **P-11** — plan.md Patient 041 → PTX-041.
33. ✔ **P-12** — plan.md post-2011 dream language fixed.
34. ✔ **P-13** — plan.md Puzzle 1 description updated.
35. ✔ **D-08/SYS-04** — deploy.md phone/fax status matrix.
36. ✔ **T-02** — tech-stack.md CloudFront status added.
37. ✔ **SEC-002** — tech-stack.md PII language corrected.
38. ✔ **SYS-05** — plan.md canonical date note.
39. ✔ **SYS-06** — live-ops fallback added; table confirmed not deployed.
40. ✔ **SYS-07** — live-ops passive classification note.

### Low priority / optional

41. **S-07** — `sleep-clinic-arg-story-breakdown.md`: confirm "Caleb R." is intentional or assign canonical last name.
42. **Ref-02** — `sleep-clinic-arg-reference-links.md`: twitter.com → x.com (optional).
43. **D-03** — `deploy.md`: decide whether to replace placeholder instance ID `i-YOURINSTANCEID` with `i-081a7e7e3c65b1f5d`.
44. **L-07** — Create staged content file for Stage 3 "unusual access pattern" reactive copy.
45. **P-09/P-16** — Already resolved (tree labeled non-canonical).

---

## Docs Reviewed

| File | Agent | Status |
|---|---|---|
| `roadmap.md` | Flow Engineer | ✅ All fixed: R-01–R-06 |
| `sleep-clinic-arg-plan.md` | Narrative Architect / Flow Engineer | ✅ All fixed: P-01–P-16 (P-02 false positive) |
| `sleep-clinic-arg-story-breakdown.md` | Narrative Architect | ✅ Fixed: S-01, S-02, S-03 |
| `sleep-clinic-arg-live-operations.md` | Live Ops Puppetmaster | ✅ Fixed: L-06, L-08, L-09, L-10; L-07 pending operator action |
| `sleep-clinic-arg-monetization.md` | Monetization Architect | ✅ Fixed: M-01–M-07 |
| `deploy.md` | Senior SWE | ✅ Fixed: D-01, D-02, D-04–D-08; D-03 left as placeholder |
| `tech-stack.md` | Senior SWE | ✅ Fixed: T-01, T-02, T-05–T-07; SEC-002 |
| `sleep-clinic-arg-reference-links.md` | Narrative Architect | 🟢 Clean |
| `audit.md` | Evidence Board | ✅ Fixed: A-01–A-07 |

**Remaining open items (operator decisions or future work):**
- **L-07** — Author and stage "unusual access pattern" reactive copy before Stage 3 fires
- **S-07** — Confirm "Caleb R." is intentional; assign canonical last name if not
- **Ref-02** — Update twitter.com → x.com links (optional)
- **D-03** — Decide whether to replace placeholder instance ID in deploy.md
- **Fax IVR** — Run a live test call to `(404) 671-9774` and confirm morse audio plays; update status tables in deploy.md and live-ops.md
- **Email L1/L2/L3** — Send test emails and confirm classification; update status table in live-ops.md
- **Content ledger** — Run `scripts/seed-content-ledger.js` to provision `somnatek-content-ledger` DynamoDB table
