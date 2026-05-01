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
| R-02 | Phase 2 description says RestWell is "discoverable through a Somnatek staff directory forum signature (cached)" — this is the OLD discovery path. **Changed today**: credentials now buried in Admin Tier 2 HTML comment, requiring 150+ portal points. | 🔴 | Update Phase 2 discovery mechanism |
| R-03 | Phase 1 blockers still show "PDFs not generated; images placeholder; fax IVR untested" — check if PDFs have been generated since April 30 | 🟡 | Verify and update blockers |
| R-04 | Milestone table references `restwell_found` (40 pts) as "future" — correct, still future, but note it now fires when player visits forum discovered via Admin Tier 2 | 🟡 | Add context note |

---

## 2. `sleep-clinic-arg-plan.md`

**Reviewing agent: Narrative Architect** (lore sections) + **Flow Engineer** (phase structure)

This is the original design doc written before deployment. It has the most inconsistencies because it predates the live build.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| P-01 | "longitudinal study from **2008 to 2014**" — **WRONG**. Canonical: study ran 2008–2013. Clinic closed 2014. | 🔴 | Change to "2008 to 2013" |
| P-02 | "The study began with **forty-two** patients" — **WRONG**. Canonical: 47. (Fixed in story-breakdown.md and admin HTML, not fixed here.) | 🔴 | Change to "forty-seven" |
| P-03 | Dorsal Health Holdings registered "**two months** after the patient file transfer" — **WRONG**. Canonical: six weeks (registered 2014-11-03, ~6 weeks after Sept 18 closure). | 🔴 | Change to "six weeks" |
| P-04 | Phase 2 RestWell: "Discoverable through a Somnatek staff directory forum signature (cached)" — **WRONG** after today's gating change. | 🔴 | Update to: discovered via Admin Tier 2 HTML comment (EMP-024 staff annotation), requires 150+ portal points |
| P-05 | Week 2 launch plan: "Add / reveal RestWell forum" — RestWell is now gated behind mid-game milestone, not a Week 2 drop. | 🔴 | Update launch timeline |
| P-06 | Player journey diagram: "finds RestWell forum (week 2+)" — same issue as P-05. | 🔴 | Update diagram |
| P-07 | Escalation arc table Stage 6: "Reach RestWell" — the stage number/position is fine, but the method should reference the Admin Tier 2 discovery path. | 🟡 | Add parenthetical note |
| P-08 | Three DynamoDB tables listed (`somnatek-visitors`, `somnatek-solve-state`, `somnatek-content-ledger`) — actual deployment uses **one table**: `somnatek-visitors`. Solve state is stored as attributes on VIS records, not a separate table. | 🟡 | Update to reflect single-table design |
| P-09 | Site structure uses `somnatek.example`, `restwell.example` placeholder domains — should reference real deployed domains `somnatek.org`, `restwell.net` | 🟡 | Update domain names |
| P-10 | "Lambda endpoints like /api/portal-login **to be built**" — **all Lambda endpoints are built and deployed**. | 🟡 | Remove "to be built" language throughout |
| P-11 | Patient 041 referred to as "Patient 041" throughout — canonical ID format is `PTX-041`. | 🟡 | Standardize to PTX-041 |
| P-12 | Uses "dream" language in post-2011 in-world planning contexts. Not in-world copy, so not a hard violation, but inconsistent with lore rule: "Never call it a dream in internal documents after 2011." | 🟡 | Replace "dream" with "indexed space" / "night floor" in post-2011 references |
| P-13 | "Puzzle 1: Participant ID found in a **redacted PDF**" — actual implementation: IDs discovered through PDF form number cipher, admin HTML, and portal table footnote (not imperfect redaction). | 🟡 | Update puzzle description to match as-built mechanic |

---

## 3. `sleep-clinic-arg-story-breakdown.md`

**Reviewing agent: Narrative Architect**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| S-01 | Act 5: active recall manifest shows entries "below **PTX-047**" with VIS series starting at "**VIS-001**" — canonical VIS format is `VIS-XXXXX` (5-digit zero-padded), so it should be `VIS-00001`. | 🔴 | Change "VIS-001" to "VIS-00001" |
| S-02 | Act 4 (The Forum): story correctly describes p_holloway (RestWell) and MarauderBlue (deleted external forum) as the same person — ✅ correct after today's update. | 🟢 | Clean |
| S-03 | Part 1 "The Closure": "six weeks after Somnatek's closure filing" — ✅ correct (matches admin HTML date 2014-11-03). | 🟢 | Clean |
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

---

## 5. `sleep-clinic-arg-monetization.md`

**Reviewing agent: Monetization Architect**

This document requires the most significant rewrite of any file in the docs folder.

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| M-01 | Patreon tier structure is **wrong**. Doc shows $3–5 Observer / $8–12 Records / $20–30 Archive (3 tiers). Deployed `scripts/patreon-observer-tier.txt` and `copilot-instructions.md` have a **6-tier** structure ($3 Supporter / $5 Observer / $8 Insider / $15 Investigator / $30 Director's Circle / $100 Patron). | 🔴 | Full tier rewrite |
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

---

## 7. `tech-stack.md`

**Reviewing agent: Senior SWE**

| # | Issue | Severity | Fix needed |
|---|---|---|---|
| T-01 | Nginx virtual hosts table shows RestWell domain as "**restwellonline.net**" — planned/deployed domain is `restwell.net`. | 🔴 | Update to restwell.net |
| T-02 | "No CloudFront yet — planned upgrade path" mentioned in plan.md but tech-stack.md does not reflect this. CloudFront is described as a future consideration in plan.md but the CDK stacks (`SomnatekPortalStack`, `SomnatekBeaconStack`) are deployed as HTTP API Gateways, not CloudFront. Clarify CloudFront status. | 🟡 | Add note on current architecture (EC2 + nginx, no CloudFront for static serving) |
| T-03 | S3 bucket listed as deploy origin — consistent with actual use. ✅ | 🟢 | Clean |
| T-04 | Overall stack description is accurate and matches deployed reality. ✅ | 🟢 | Clean |

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
| A-02 | Security note: "Math.random() used for VIS ID generation — should be crypto.randomBytes() before production public launch." — This is a **security issue that is live right now** (public launch happened). | 🔴 | Fix in code immediately, then mark resolved |
| A-03 | Phase status column: privacy.html marked ❌ "not built" — check current state | 🟡 | Verify and update |
| A-04 | Audit date "April 30, 2026" — needs updating after today's changes | 🟡 | Update date and add May 1 change notes |

---

## Cross-Document Inconsistency Matrix

Conflicts where two docs say different things about the same fact:

| Fact | Correct value | Wrong in |
|---|---|---|
| Study period | 2008–2013 | `sleep-clinic-arg-plan.md` says "2008 to 2014" |
| Participant count | 47 | `sleep-clinic-arg-plan.md` says "forty-two" |
| Dorsal registration timing | Six weeks after closure | `sleep-clinic-arg-plan.md` player journey says "two months" |
| RestWell domain | restwell.net | `tech-stack.md` and `deploy.md` say "restwellonline.net" |
| RestWell discovery path | Admin Tier 2 HTML source, 150+ pts | `roadmap.md`, `sleep-clinic-arg-plan.md`, `audit.md` all reference old staff.html path |
| Somnatek domain | somnatek.org | `deploy.md` says "somnatekhealth.com" |
| VIS ID format in manifest | VIS-00001 (5-digit) | `sleep-clinic-arg-story-breakdown.md` Act 5 says "VIS-001" |
| RestWell on public merch | Not allowed (late-game spoiler) | `sleep-clinic-arg-monetization.md` lists "RestWell forum sticker pack" on public merch |

---

## Priority Fix Order

### Immediate (lore-breaking or security)

1. **A-02** — Fix `Math.random()` → `crypto.randomBytes()` in `lambda/portal-login/index.js` (security issue, live)
2. **P-01** — `sleep-clinic-arg-plan.md`: study period "2008 to 2014" → "2008 to 2013"
3. **P-02** — `sleep-clinic-arg-plan.md`: "forty-two" → "forty-seven"
4. **P-03** — `sleep-clinic-arg-plan.md`: "two months" → "six weeks" (Dorsal registration)
5. **P-04/P-05/P-06** — `sleep-clinic-arg-plan.md`: RestWell discovery path updated throughout
6. **S-01** — `sleep-clinic-arg-story-breakdown.md`: "VIS-001" → "VIS-00001"
7. **A-01** — `audit.md`: RestWell rabbit hole entry updated
8. **M-01 through M-07** — `sleep-clinic-arg-monetization.md`: full rewrite

### Next (outdated but not broken)

9. **D-01 / D-04** — `deploy.md`: somnatekhealth.com → somnatek.org
10. **T-01** — `tech-stack.md`: restwellonline.net → restwell.net
11. **D-02** — `deploy.md`: restwell domain corrected
12. **R-01 / R-02** — `roadmap.md`: Phase 2 status and discovery path
13. **P-08** — `sleep-clinic-arg-plan.md`: three DynamoDB tables → single table
14. **P-10** — `sleep-clinic-arg-plan.md`: remove "to be built" language for deployed Lambdas
15. **P-11** — `sleep-clinic-arg-plan.md`: "Patient 041" → "PTX-041"

### Low priority / optional

16. **P-09** — `sleep-clinic-arg-plan.md`: placeholder domains
17. **P-12** — `sleep-clinic-arg-plan.md`: "dream" language post-2011
18. **S-07** — `sleep-clinic-arg-story-breakdown.md`: confirm "Caleb R." is intentional
19. **Ref-02** — `sleep-clinic-arg-reference-links.md`: Twitter → X
20. **D-03** — `deploy.md`: instance ID placeholder decision
21. **D-05/D-06** — `deploy.md`: SSH/key pair notes
22. **L-06/L-07** — `sleep-clinic-arg-live-operations.md`: Stage 3 script cross-references

---

## Docs Reviewed

| File | Agent | Status |
|---|---|---|
| `roadmap.md` | Flow Engineer | 🟡 4 issues |
| `sleep-clinic-arg-plan.md` | Narrative Architect / Flow Engineer | 🔴 13 issues — oldest doc, most drift |
| `sleep-clinic-arg-story-breakdown.md` | Narrative Architect | 🟡 1 critical, 1 confirm needed |
| `sleep-clinic-arg-live-operations.md` | Live Ops Puppetmaster | 🟢 2 minor |
| `sleep-clinic-arg-monetization.md` | Monetization Architect | 🔴 Full rewrite required |
| `deploy.md` | Senior SWE | 🔴 Domain wrong throughout |
| `tech-stack.md` | Senior SWE | 🔴 RestWell domain wrong |
| `sleep-clinic-arg-reference-links.md` | Narrative Architect | 🟢 Clean |
| `audit.md` | Evidence Board | 🔴 RestWell entry stale, security issue live |
