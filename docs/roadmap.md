# Somnatek ARG — Master Roadmap

Last updated: April 30, 2026 (late evening)

---

## Legend

- `[x]` Done
- `[-]` In progress
- `[ ]` Not started

---

## Phase 0 — Foundation (Complete)

Infrastructure and the first live site. Nothing is publicly promoted yet. The site simply exists.

### Infrastructure
- [x] AWS account and IAM profiles configured (`somnatek-arg`)
- [x] EC2 instance running nginx (Amazon Linux 2023)
- [x] S3 bucket (`somnatek-site`) as deploy origin
- [x] HTTPS via Let's Encrypt — auto-renewing certbot timer active
- [x] Domain `somnatek.org` resolving to EC2
- [x] CDK stacks deployed: `SomnatekEc2Stack`, `SomnatekEmailStack`, `SomnatekPhoneStack`
- [x] Lambda functions scaffolded: `phone-responder`, `email-responder`
- [x] DynamoDB table for visitor/participant state (`somnatek-visitors`, ACTIVE)
- [x] API Gateway wired to puzzle Lambda — `SomnatekPortalStack` deployed
- [x] `SomnatekAdminStack` — admin API Lambda + HTTP API Gateway deployed
- [x] `SomnatekBeaconStack` — page beacon Lambda + HTTP API Gateway deployed (Apr 29)
- [x] `www.somnatek.org` DNS alias (already resolves — cert and nginx both cover www)

### Somnatek Site — Core Pages
- [x] `index.html` — Home
- [x] `about.html` — About the clinic
- [x] `research.html` — Research studies (Protocol 7A, Dr. Vale, Wexler)
- [x] `staff.html` — Staff directory (Dr. Ellison, Lena Ortiz, others)
- [x] `patient-resources.html` — Patient resources and forms
- [x] `closure-notice.html` — Closure notice (Dorsal Health Holdings transfer)
- [x] `portal.html` — Patient portal login (archive mode)
- [x] `404.html` — Plain era-appropriate 404
- [x] `sleep-disorders.html` — Sleep disorders page (Apr 29)
- [x] `insurance.html` — Billing/insurance page with Dorsal reference (Apr 29)
- [x] `robots.txt` — Disallow `/archive/7A-SUPP-INDEX/`, `/portal/`, `/admin/` (Apr 29)

### Somnatek Site — Polish
- [x] 2010-era institutional CSS (float layout, system fonts, dated nav)
- [x] Layout bug fixed (`#main` box-sizing)
- [x] Alt text rendering fixed (line-height inheritance from container)
- [x] Home page facility image (`somnatek_front2b.jpg`) live — 465 Upper Riverdale Rd, Riverdale GA 30274
- [ ] Facility images for: about, research, staff, patient-resources, closure-notice
- [x] Lena Ortiz staff profile: RPSGT certification renewed October 2014, six weeks after position "eliminated" and two weeks post-closure — no lab coverage listed in gap period (Apr 29)
- [x] Dr. Ellison staff profile: extended administrative leave from February 2014 (7 months pre-closure), no forwarding contact, photograph removed (Apr 29)
---

## Phase 1 — First Puzzle Chain

The portal becomes functional. Players can find and use a PTX participant ID to access archived recall summaries. This is the first real puzzle gate.

### Portal Lambda (`lambda/portal-login/`) — COMPLETE
- [x] `lambda/portal-login/index.js` — deployed via `SomnatekPortalStack`
- [x] Answer hashed with `PUZZLE_ANSWER_SALT` + `PORTAL_ANSWER_HASH` env vars
- [x] On valid PTX-018: issues `VIS-XXXXX` visitor ID, writes to DynamoDB
- [x] Returns redirect to `/portal/ptx-018/?v=VIS-XXXXX`
- [x] Rate-limit: 10 attempts per IP per 15-minute window (DynamoDB TTL counters)
- [x] CORS headers locked to `somnatek.org`
- [x] Nginx proxy: `POST /api/portal-login` → API Gateway HTTP API
- [x] DynamoDB `somnatek-visitors` table (ACTIVE, owned by `SomnatekEmailStack`)
- [x] Milestone registry wired — full registry (Apr 30):
  | ID | Points | Released | Trigger |
  |----|--------|----------|---------|
  | `portal_solved` | 20 | ✓ | portal-login Lambda |
  | `fax_decoded` | 15 | ✓ | future fax Lambda |
  | `supp_index_found` | 20 | ✓ | beacon: `supp-index` |
  | `doc_7a_found` | 15 | ✓ | beacon: `7a-internal` |
  | `correspondence_found` | 25 | ✓ | beacon: `correspondence` |
  | `admin_t1` | 10 | ✓ | fake admin fires beacon `admin-t1` |
  | `admin_t2` | 20 | ✓ | fake admin fires beacon `admin-t2` |
  | `admin_t3` | 35 | ✓ | fake admin fires beacon `admin-t3` |
  | `recall_accessed` | 25 | ✓ | beacon: `ptx-018` (fires when player visits portal/ptx-018/ with VIS ID) |
  | `admin_t1` | 10 | ✓ | fake admin fires beacon `admin-t1` |
  | `admin_t2` | 20 | ✓ | fake admin fires beacon `admin-t2` |
  | `admin_t3` | 35 | ✓ | fake admin fires beacon `admin-t3` |
  | `protocol_7a` | 30 | ✓ | beacon: `protocol-7a` (fires on successful puzzle unlock) |
  | `restwell_found` | 40 | — | future |
  | `wexler_found` | 40 | — | future |
  Released: **210 pts** / All-time: **275 pts**
- [x] `percentComplete` and `level` computed on each solve (Apr 29)
- [x] Pre-solve ANON visitor record promoted to VISITOR# on first valid solve — journey data (pages visited, first seen, referrer) carried forward (Apr 29)
- [x] Portal page writes `sntk_vis` to localStorage on successful solve (Apr 29)

### Fax Line

The Somnatek site footer lists two contact numbers: the main IVR line and a fax number.
Calling the fax number provides a puzzle element — morse code for `413` embedded in a
failed handshake sequence.

**Inbound (Amazon Connect) — in progress**
- [x] Audio generated: `assets/audio/somnatek-fax-line.wav` (13s, 8kHz mono PCM)
  - ~4s CNG tone (1100 Hz, fax calling cadence)
  - ~1.8s CED tone (2100 Hz, answering)
  - ~0.9s V.21 preamble noise burst (simulated handshake attempt)
  - ~0.6s silence (connection failure)
  - Morse code: `413` at 15 WPM, 700 Hz
  - 1.2s trailing silence
- [x] Contact flow script: `scripts/create-fax-flow.ps1`
- [x] Prompt uploaded to Connect: `somnatek-fax-line` (ID: `3504ff64-e680-4a98-bac4-89e96ac8bef9`)
- [x] Contact flow created: `somnatek-fax-line` (ID: `d3284588-1343-461d-9c57-359ea923ceb4`)
- [x] 404 number claimed and wired: **(404) 671-9774** → fax flow
- [x] Fax number added to all site page footers and headers

**Outbound fax (Twilio — future)**
- [ ] Provision Twilio fax-capable 404 number (~$1/month)
- [ ] Build `lambda/fax-sender/index.js`:
  - Accepts `{ faxNumber, caseReference }` via POST
  - Validates `caseReference` is a known `VIS-XXXXX` in DynamoDB
  - Rate-limits to one fax per `VIS-XXXXX` per 24 hours
  - Sends `assets/fax/protocol-7a-p3.pdf` via Twilio Programmable Fax API
  - PDF fax header shows sending number as Somnatek fax line, timestamp 2013
- [ ] Create `assets/fax/protocol-7a-p3.pdf` — Protocol 7A page 3
  - Contains first explicit Room 413 reference
  - Contains the key phrase: PLEASE WAIT TO BE RECALLED
  - Stamped INTERNAL / NOT FOR DISTRIBUTION
  - Author metadata: `L. Ortiz`, last-modified date post-closure
- [ ] Hidden records request form on portal (after VIS unlock, not publicly linked)
  - Fields: Fax Number, Case Reference (VIS-XXXXX)
  - Submits to `/api/send-fax`
  - Confirmation text: "Your records request has been received. Transmission may be delayed."
- [ ] CDK: `SomnatekFaxStack` — Lambda + API Gateway route `/api/send-fax`
- [ ] Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FAX_NUMBER` to `.env`
- [ ] Cost estimate: ~$1/month number + $0.01/page per transmission

---

### First Unlock Artifact — PTX-018 Recall Summaries
- [x] `portal/ptx-018/index.html` — Hidden page, not linked from nav (Apr 29)
- [x] 22 session summary records in index table, forms 1–22 linked
- [x] ARG breadcrumbs embedded:
  - Session 08 technician note: "Corridor description consistent with P-007, P-014. Do not prompt."
  - Session 15 revised checklist: Blue door Y, Reception desk Y, Bending hallway Y
  - Session 20: room number 413 confirmed, cross-referenced P-007/P-031
  - Session 22: vending machine accepts room keys — cross-reference P-011, P-031
  - Session 22 final note: "Patient requested discontinuation. Reports dreaming about this office."
- [x] Admin notice: "Sessions 23 and 24 were not conducted. If you received documentation referencing a Session 23 or Session 24, please disregard."
- [x] Individual session detail pages (`session-01.html` through `session-22.html`) with sleep stage tables, recall narrative, typed tech notes, physician sign-off (Apr 29)
- [x] Key sessions have `<!-- FLAGGED: ... -->` HTML comments for players scanning source
- [ ] PDF metadata: author `L. Ortiz`, last-modified date post-closure

### Hidden Puzzle — Protocol 7A Page — COMPLETE (Apr 30)
- [x] `portal/protocol-7a/index.html` — full Protocol 7A source document (EC-004, March 2012)
  - Puzzle gate: client-side SHA-256 — answer derived from session 15 + PTX-018 + room 413 → `15PTX018413`
  - Input normalization: strip dashes/spaces, uppercase — accepts any reasonable format
  - On unlock: fires `protocol-7a` beacon → writes `protocol_7a` milestone; session-persisted via `sessionStorage`
  - Document content (4 pages, full version — pages 3–4 were removed from the Dorsal copy):
    - Pages 1–2: objectives, participant selection, session protocol, full EC-004 EEC with cross-reference notes
    - Page 3 (Section 8): **Recall Termination Criteria** — defines archive category 7, room 413 as primary indexed space, `PLEASE WAIT TO BE RECALLED` as the formal administrative communication
    - Page 3 (Section 8.6): observer reclassification with VIS-XXXXX format — players who find this see themselves described in the protocol
    - Page 4 (Section 9): Supplemental Observations — added by Ellison/Vale after IRB submission, not included in Dorsal transfer; states plainly that the indexed space is self-sustaining and existed before the study
    - Ellison's note: "I would rather they understand what we found than read around it."
  - Linked from `portal/ptx-018/` sidebar under "Study Archive"
  - Page-load beacon fires `portal` slug (no milestone); milestone only on unlock

### Page Beacon System — COMPLETE (Apr 29, updated Apr 30)
- [x] `lambda/page-beacon/index.js` — fire-and-forget. Records every page load as `ANON#<ipHash>` before any solve
- [x] Normalises page slug against known-pages allowlist, rejects unknown slugs
- [x] Rate-limited: 120 calls / IP / hour via DynamoDB TTL counters
- [x] Stores: `page`, `referrer`, `visitorId` (from localStorage), `firstSeen`, `lastSeen`, `pagesVisited[]`, `pageViewCount`
- [x] CDK stack `SomnatekBeaconStack` deployed — `POST /api/beacon` live
- [x] Nginx proxy block `/api/beacon` → `https://sun783h61e.execute-api.us-east-1.amazonaws.com/beacon`
- [x] Beacon JS snippet (`<!-- session-integrity:check -->`) added to all site pages before `</head>`
- [x] `BEACON_FUNCTION_NAME` env var set on admin Lambda
- [x] **Milestone-write logic** (Apr 30) — when a beacon call includes a valid `VIS-XXXXX` and a milestone-triggering page slug, beacon Lambda now appends the milestone to the VISITOR# record (idempotent)
  - `correspondence` → `correspondence_found`
  - `supp-index` → `supp_index_found`
  - `7a-internal` → `doc_7a_found`
  - `admin-t1/t2/t3` → `admin_t1/t2/t3`
  - `ptx-018` → `recall_accessed`
  - `protocol-7a` → `protocol_7a`
- [x] Known pages: `index`, `about`, `research`, `staff`, `patient-resources`, `closure-notice`, `portal`, `404`, `sleep-disorders`, `insurance`, `ptx-018`, `7a-internal`, `correspondence`, `admin`, `supp-index`, `admin-t1`, `admin-t2`, `admin-t3`, `protocol-7a`

### Admin System
- [x] `/admin/index.html` — **Fake in-world admin portal** (Apr 30)
  - 2010-era institutional blue CSS design — period-appropriate corporate intranet look
  - **Three access tiers**, each validated client-side via SHA-256 (Web Crypto API)
  - **Tier 1 — Facility Access** (`HARROW-FAC`): Room status board (413 = ACCESS RESTRICTED, inspection denied Aug/Apr 2014, electrical readings elevated), maintenance log, utility readings. Key card badge system shown as still running on UPS.
    - Credential hidden in: HTML comment at bottom of `closure-notice.html`
  - **Tier 2 — Clinical Records** (`7A-RC-2012`): Staff status table (Ellison on indefinite leave, Ortiz badge still active post-elimination), participant roster (PTX-007/014/031 = Transferred, PTX-018 = Concluded), audit log showing unregistered Terminal ID 00000000 at 09:31 on the last day. HTML comment reveals EMP-247 not in standard personnel.
    - Credential hidden in: HTML comment in `docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.html` as `dept_code: 7A-RC-2012`
  - **Tier 3 — Protocol Administration** (`PLEASE WAIT TO BE RECALLED`): Protocol 7A status = ACTIVE (not concluded). Night floor = INDEXED. Recall system = ACTIVE. Room 413 access log. Player's own VIS ID and current timestamp appear in the access log as "RECALL PENDING". Automatic recall queue shown as open for post-study observers.
    - Credential hidden in: HTML comment in `archive/7A-SUPP-INDEX/index.html` — SUPP-006 entry now reads "primary observer directive (section 9, paragraph 4): PLEASE WAIT TO BE RECALLED"
  - Tier 3 reads `sntk_vis` from localStorage and shows the player's own visitor ID in the access log
  - Session persistence via `sessionStorage` — tier survives page refresh
- [x] `/site-mgmt/index.html` — **Real backend admin console** (moved Apr 30)
  - Renamed from `/admin/index.html` — same functionality as before
  - Nginx: returns 404 unless `X-Site-Key` header is present (any non-empty value)
  - Not listed in `robots.txt`, not linked anywhere
  - Real security: admin Lambda still requires `X-Admin-Token` for all API calls

### Hidden Infrastructure
- [x] `/archive/7A-SUPP-INDEX/index.html` — Resistant redirect page (Apr 30)
  - Counts down 5s and redirects to 404 unless JS is stopped or disabled
  - HTML comment lists 7A-SUPP-001 through 7A-SUPP-010 with descriptions
  - SUPP-010 = "night floor access report — M. Ellison / E. Vale"
- [x] `docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.html` — "Document error" page (Apr 30)
  - Fake retrieval diagnostic: pages 1–2 rendered, pages 3–4 "block read error"
  - Pages 1–2 contain full Protocol 7A study description and element checklist
  - HTML comment: last_modified_by L. Ortiz, pages 3–4 removed before Dorsal transfer, original ref 7A-SUPP-006
- [x] `archive/correspondence/index.html` — Ellison/Vale email archive (Apr 30)
  - 17 of 31 messages, Sept 2011 – Apr 2013
  - Sep 2011: room 413 confirmed across all 7 participants; Ellison says "the door hasn't opened for any of them yet"
  - Mar 2012: PTX-007 S24 — first access-consistent report; Ellison flags PTX-014 S22 "going through"
  - Nov 2012: Vale's Wexler withdrawal request; Ellison asks if it's coming from "somewhere else"
  - Apr 2013: Ellison says "I've been in room 413" — not in a session, after hours, door was unlocked
  - Apr 2013: Ellison sends 14-page write-up to Vale, archived separately as 7A-SUPP-010
- [x] `X-Archive-Ref: 7A-SUPP-001` HTTP response header on `/research.html` (Apr 30)
- [x] HTML comment in `patient-resources.html`: internal doc ref with last_modified L. Ortiz, pages 3–4 status unresolved (Apr 30)
- [x] HTML comment in `research.html`: `<!-- correspondence archive: archive/correspondence/ - ref 7A-SUPP-001 -->` (Apr 30)
- [ ] Lena Ortiz staff checklist PDF — final line: "do not include room 413 in the standard environmental checklist"
- [ ] Study summary PDF with last two pages missing
- [ ] `7A-SUPP-010` page — Ellison's 14-page write-up about entering room 413 (Phase 2 drop)

---

## Phase 2 — RestWell Forum

A semi-abandoned patient support forum. Discoverable through a Somnatek staff directory forum signature (cached). This is a separate site and a separate domain.

### Infrastructure
- [ ] Domain: `restwell.net` or similar (register)
- [ ] S3 bucket + CloudFront or EC2 vhost
- [ ] CDK stack: `RestWellStack`

### Site Build
- [ ] phpBB-era static HTML design (2008–2011 era forum aesthetic)
- [ ] Category structure: Sleep Advice / Insurance / Personal Stories / Off-Topic
- [ ] 40–60 static threads, mostly mundane
- [ ] "Somnatek follow-up, anyone else?" thread — 87 replies, page 3

### ARG Content in Forum
- [ ] Usernames map to anonymized participant IDs (discoverable via post date cross-reference)
- [ ] One moderator silently edits posts to remove room numbers (2016 onward)
- [ ] Moderator account has no post history before 2015
- [ ] Deleted thread reconstructable from reply quotes and archive fragments
- [ ] MarauderBlue = PTX-018:
  - 2019 post: "I think I can go back there on my own now. I don't need to be asleep."
  - Final post March 2020: "Room 413. That's where they're all going. I mapped it." (edited 3 minutes later — "I mapped it" replaced with a space)
  - Thread locked 4 days after the 2019 post
- [ ] Forum registration disabled: "This forum is currently closed to new registrations."

---

## Phase 3 — Wexler University Archive

A university-hosted research abstract repository. Confirms the study, raises questions through academic language.

### Infrastructure
- [ ] Domain: `wexler.edu` subdomain or similar
- [ ] CDK stack: `WexlerStack`

### Site Build
- [ ] Academic institutional design (dry, searchable, text-heavy, 2012-era)
- [ ] Department of Cognitive and Behavioral Neuroscience landing page
- [ ] Abstract search interface (static, pre-filtered results)

### Documents
- [ ] Conference abstract — "Longitudinal Sleep Recall Consistency in Patients with Chronic Sleep Disorders" (Vale, 2011)
- [ ] Poster PDF — image filename reveals internal study name
- [ ] Grant summary
- [ ] Ethics board amendment referencing "environmental recurrence event"
- [ ] Study withdrawal note (2013)
- [ ] Abstract revision history — earlier versions contain stranger language that was edited out

---

## Phase 4 — Harrow County Business Records

A county records portal. Mundane on the surface. Contains the legal paper trail for the closure and the Dorsal Health Holdings formation.

### Infrastructure
- [ ] Domain: `harrowcounty.gov` subdomain or similar
- [ ] CDK stack: `HarrowCountyStack`

### Site Build
- [ ] Government records aesthetic (ugly tables, tiny text, PDF scan aesthetic)
- [ ] Business registry search

### Records
- [ ] Somnatek Sleep Health Center registration (2006)
- [ ] Name change filing (shortly before closure)
- [ ] Closure filing (2014) with records transfer notice
- [ ] Dorsal Health Holdings LLC registration (two months after Somnatek closure filing)
- [ ] Registered agent for Dorsal: Edwin Vale
- [ ] Closure date in county records conflicts with forum post dates and patient letters

---

## Phase 5 — Visitor Classification System

Players who opt in receive in-world identifiers and the ARG starts to feel personally reactive.

### Email System (AWS SES)
- [ ] Opt-in form on portal (after PTX puzzle solved)
- [ ] Welcome email: "Visitor record created. Your assigned identifier is VIS-XXXXX."
- [ ] Email series: clinical, procedural, increasingly strange
  - "Your intake window has been generated."
  - "Recall observation pending."
  - "Your arrival has not been confirmed. Please disregard the blue door."
  - "Observer status amended after unscheduled document access."
- [ ] SES sending domain verified, unsubscribe path in place
- [ ] No real PII stored beyond email address

### Twilio SMS (Phone Responder)
- [ ] Opt-in SMS number published somewhere on the site (hidden, findable)
- [ ] Text the number: automated response in-world
- [ ] Possible: call the number and get a pre-recorded clinical message
- [ ] Phone Lambda already scaffolded

### Portal State System
- [ ] Visitor record statuses: `created` / `intake_incomplete` / `observation_pending` / `recall_pending` / `session_interrupted` / `manual_review`
- [ ] Portal page reacts to visitor state after login
- [ ] DynamoDB drives state; Lambda updates on triggers

---

## Phase 6 — Community Escalation

The system begins to react to collective player behavior. Stage 3 in the escalation model.

### Reactive Site Changes
- [ ] After community solves Protocol 7A: a page note appears — "This document has been temporarily restricted pending compliance review."
- [ ] After high access volume: hidden index page adds a new status line — "Unusual access pattern detected. Records review initiated."
- [ ] Forum moderator posts a reply in the Somnatek thread after players reconstruct the deleted content
- [ ] A broken link on `research.html` becomes active (timed or milestone-triggered)
- [ ] `7A_INTERNAL_DO_NOT_DISTRIBUTE.pdf` gains a page 3 (previously ended at page 2)

### Content Drop Infrastructure
- [ ] `scripts/release.js` — copies from `staged/` S3 prefix to public prefix, updates DynamoDB content ledger
- [ ] DynamoDB `ContentLedger` table — states: `drafted / scheduled / released / discovered / superseded / removed`
- [ ] GitHub Actions workflow: `release-drop.yml` — triggered manually or on schedule, never on push
- [ ] `staged/` prefix never committed to repo, never public

---

## Phase 7 — The Infinite Layer

Somnatek becomes one node in a larger network. The ARG expands beyond the clinic.

### Dorsal Health Holdings Site
- [ ] Domain: `dorsalhealth.com` or similar
- [ ] Deliberately sparse corporate site — "Records management and archival services."
- [ ] Contact form that auto-responds with a case number
- [ ] No staff listed. One address. One phone number (Twilio)
- [ ] Hidden: a filing reference linking Dorsal back to an older entity

### Ongoing Content Engine
- [ ] Daily micro-drops: metadata changes, new HTML comments, broken link activations, table row additions
- [ ] Weekly drops: new staff memo, new patient file, new forum thread, new abstract revision
- [ ] Monthly events: portal maintenance window, appointment confirmation wave, forum lockdown, public records release
- [ ] Physical artifact tier (optional, supporter): printed appointment letters, patient ID cards, redacted forms

### Lore Expansion
- [ ] Other clinics that reported similar environmental patterns (referenced in ethics amendment footnotes)
- [ ] Earlier Vale research from 1994–2005 (pre-Somnatek)
- [ ] The "window" described by two unconnected patients — Vale's original anomaly
- [ ] A second registered entity linked to Dorsal
- [ ] Suggestion that Dorsal Health Holdings is still scheduling appointments

---

## Lore Constants (never change)

| Item | Value |
|------|-------|
| Clinic name | Somnatek Sleep Health Center |
| County | Harrow County |
| University | Wexler University |
| Corporate successor | Dorsal Health Holdings LLC |
| Medical director | Dr. Mara Ellison |
| University researcher | Dr. Edwin Vale |
| Sleep technician | Lena Ortiz |
| Participant ID format | PTX-XXX (study), VIS-XXXXX (visitors) |
| Key room number | 413 |
| Key phrase | PLEASE WAIT TO BE RECALLED |
| Study period | 2008–2013 |
| Public closure | September 18, 2014 |
| Protocol name | Protocol 7A |
| Internal environment names | the Dorsal site / the night floor / the indexed space |
| The blue door | always on the left |
| The hallway | always bends left |

---

## First Public Promotion Checklist

Do not promote the site until all of the following are true:

- [x] `sleep-disorders.html` and `insurance.html` built (no broken nav links)
- [x] PTX-018 portal puzzle fully functional end-to-end
- [x] Rate-limiting active on portal Lambda
- [x] DynamoDB visitor table live
- [x] At least one unlock artifact accessible after solve
- [ ] `7A_INTERNAL_DO_NOT_DISTRIBUTE.pdf` placed and reachable (HTML version live; PDF stub pending)
- [x] Lena Ortiz staff anomaly in place
- [ ] `www.somnatek.org` resolving correctly
- [ ] All pages pass a basic mobile/browser check
- [ ] Git history clean (no staged content, no `.env` committed)

---

## Somnatek Site — Full Page Inventory

Live pages with their access paths and player-facing discoverability.

### Public Navigation (linked from nav bar or footer)

| URL | Title | Discoverable via |
|-----|-------|-----------------|
| `/index.html` | Home | Direct / search |
| `/about.html` | About the Clinic | Nav |
| `/sleep-disorders.html` | Sleep Disorders | Nav |
| `/patient-resources.html` | Patient Resources | Nav |
| `/research.html` | Research Studies | Nav |
| `/staff.html` | Staff Directory | Nav |
| `/portal.html` | Patient Portal | Nav |
| `/insurance.html` | Insurance &amp; Billing | Sidebar on patient-resources |
| `/closure-notice.html` | Closure Notice | Footer |
| `/404.html` | Error page | All broken links |

### Portal Unlock (requires solving portal puzzle)

| URL | Title | Discoverable via |
|-----|-------|-----------------|
| `/portal/ptx-018/index.html` | PTX-018 Session Index | Portal redirect after solve |
| `/portal/ptx-018/session-01.html` through `session-22.html` | Individual session records | Index page links |

### Hidden / Unlisted (not linked from public nav)

| URL | Title | Discoverable via |
|-----|-------|-----------------|
| `/robots.txt` | robots.txt | Standard robots check |
| `/archive/7A-SUPP-INDEX/index.html` | Restricted index (redirects) | `robots.txt` Disallow entry |
| `/admin/index.html` | Fake in-world admin portal (3 tiers) | `robots.txt` Disallow + HTML comments pointing here |
| `/archive/correspondence/index.html` | Ellison/Vale correspondence | HTML comment in `research.html` |
| `/docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.html` | Protocol 7A doc (pages 3–4 missing) | HTML comment in `patient-resources.html` |
| `/site-mgmt/index.html` | Real backend admin console | Not listed — requires `X-Site-Key` header |

### Response Header Clues

| Page | Header | Value |
|------|--------|-------|
| `/research.html` | `X-Archive-Ref` | `7A-SUPP-001` |

### Source Code Clues (HTML comments)

| File | Comment content |
|------|----------------|
| `research.html` | `supplemental protocol materials archived - index ref: 7A-SUPP-INDEX` |
| `research.html` | `correspondence archive: archive/correspondence/ - ref 7A-SUPP-001` |
| `patient-resources.html` | `file: docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.pdf ... last_modified_by: L.Ortiz` |
| `patient-resources.html` | `intake form v4 - includes updated protocol language per 7A amendment` |
| `portal/ptx-018/index.html` | Admin notice about Sessions 23 and 24 |
| `portal/ptx-018/session-08.html` | FLAGGED: Corridor consistent with P-007, P-014 |
| `portal/ptx-018/session-11.html` | Equipment calibration was not scheduled; initiated per supervisor instruction |
| `portal/ptx-018/session-15.html` | FLAGGED: Revised checklist 7A-EC-004 — all Y except room number |
| `portal/ptx-018/session-17.html` | FLAGGED: Wall text — "It told you to wait. Or to keep waiting." |
| `portal/ptx-018/session-20.html` | FLAGGED: 413 confirmed, cross-reference P-007 S22 and P-031 S18 |
| `portal/ptx-018/session-20.html` | Flagged for 7A supplemental review — see 7A index |
| `portal/ptx-018/session-22.html` | FLAGGED: Vending machine accepts room keys; patient dreaming about this office |
| `admin/index.html` | HTML comment pointing at `/admin/` | Located in `closure-notice.html` — facility mgmt ref + admin portal URL |
| `admin/index.html` | Panel lock screens (Tier 2 and Tier 3) | Show upgrade prompts — Tier 2 code found in `7A_INTERNAL_DO_NOT_DISTRIBUTE.html`, Tier 3 phrase in `7A-SUPP-INDEX` |
| `archive/7A-SUPP-INDEX/index.html` | Full 7A-SUPP-001 through 7A-SUPP-010 index listing | Also: admin portal link + SUPP-006 contains the key phrase |
| `docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.html` | SHA256 mismatch; pages 3–4 removed by L.Ortiz before Dorsal transfer; `dept_code: 7A-RC-2012`; original ref 7A-SUPP-006 | dept_code is the Tier 2 admin credential |
| `archive/correspondence/index.html` | 31 messages total; 14 omitted; attached 14-page write-up archived as 7A-SUPP-010 |
| `staff.html` | `no photograph on file - image removed 2014-02-11 per admin request` |
| `staff.html` | `position eliminated per restructuring notice 2014-08-01` / cert renewed Oct 2014 |
