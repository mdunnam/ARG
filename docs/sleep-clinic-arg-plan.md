# Sleep Clinic ARG Plan

## Build Status

**Active development started: April 28, 2026**
**Phase 0 (Foundation) completed: April 30, 2026**
**Phase 1 (First Puzzle Chain) core complete: April 30, 2026 — PDF generation and images pending**

Current milestone: Phase 1 live — portal puzzle, archive pages, admin system, page beacon, email responder all deployed.

Stack (as deployed):
- Static HTML/CSS/JS for all in-world sites, served from EC2 + nginx.
- Node.js AWS Lambda for puzzle validation, visitor tracking, email responses, and admin API.
- AWS EC2 (t3.micro) + nginx for web hosting (no CloudFront yet — planned upgrade path).
- AWS API Gateway HTTP API for Lambda endpoints.
- AWS DynamoDB (`somnatek-visitors`) for visitor IDs, solve state, and milestone tracking.
- AWS SES + Bedrock (Claude 3 Haiku) for opt-in in-world email responses.
- Amazon Connect for inbound phone / fax line.
- AWS CDK (TypeScript) for infrastructure as code.
- AWS Route 53 for domains.

Project structure:

```
ARG/
├── docs/               Planning documents
├── sites/
│   ├── somnatek/       Main clinic site (first build)
│   ├── restwell/       Patient forum (week 2)
│   ├── wexler/         University archive (week 3)
│   └── harrow-county/  County records (week 4)
├── lambda/             AWS Lambda functions
├── infra/              AWS CDK infrastructure
├── scripts/            Content drop and release tooling
└── assets/             Shared source assets before processing
```

---

## Working Title

**The Somnatek Follow-Up Study**

Alternative names:

- **Somnatek Patient Portal**
- **The Dorsal Sleep Study**
- **Protocol 7A**
- **The Night Floor**
- **Somnatek Longitudinal Recall Program**

## Core Premise

A defunct sleep clinic ran a longitudinal study from 2008 to 2014. The original site still exists as an abandoned patient education portal with archived pages, appointment resources, study documents, and staff biographies.

At first, it looks like a forgotten medical site: broken links, outdated sleep hygiene PDFs, appointment forms, and research summaries. But players slowly discover that multiple anonymous patients reported dreams with the same impossible geography: a hallway, a waiting room, a locked ward, a specific room number, and a recurring phrase written in different places.

The horror is not that something attacks people in dreams. The horror is that the clinic may have found a place people can access while asleep, then tried to standardize, map, and commercialize it.

## Design Goals

- Feel like a real abandoned medical / research website.
- Avoid obvious horror branding on first contact.
- Make players ask, "Is this an actual old clinic site?"
- Use still images, documents, audio, forms, tables, and metadata instead of video.
- Let dread come from records, contradictions, and clinical understatement.
- Keep the first layer believable enough that casual visitors may miss the ARG entirely.

## Tone

Clinical, quiet, bureaucratic, and emotionally restrained.

The site should not say scary things directly. It should say normal things in ways that become disturbing after context accumulates.

Examples:

- "Patient recall consistency increased after environmental alignment."
- "Do not ask participants whether they recognize the room."
- "Night staff are reminded that observation language must remain neutral."
- "If a participant reports the blue door before Session 4, discontinue intake."

## Main Entities

### 1. Somnatek Sleep Health Center

**Surface identity:** A closed regional sleep clinic with a stale patient portal.

**Website feel:** Early 2010s medical site. Clean but dated. Stock-like medical imagery, pastel blue accents, low-resolution staff headshots, PDF-heavy navigation.

**Public pages:**

- Home
- About the clinic
- Sleep disorders
- Patient resources
- Insurance and billing
- Research studies
- Staff directory
- Closure notice
- Patient portal login

**Hidden / puzzle pages:**

- Archived study index (`/archive/7A-SUPP-INDEX/`)
- Correspondence archive (`/archive/correspondence/`) — 17 Ellison–Vale emails
- Termination reports (`/archive/7A-SUPP-005/`) — five Category 7 participant files; PTX-031 active status
- Ellison access report (`/archive/7A-SUPP-010/`) — night floor personal account
- Redacted intake form (`/docs/7A_INTERNAL_DO_NOT_DISTRIBUTE.html`) — pages 3–4 missing
- PTX-018 recall summaries (`/portal/ptx-018/`) — 22 session forms
- Protocol 7A full document (`/portal/protocol-7a/`) — SHA-256 gated (answer: `15PTX018413`)
- In-world admin portal (`/admin/`) — three credential tiers hidden in HTML comments

**Live Lambda integrations:**

- `POST /api/portal-login` — puzzle answer validation, VIS-XXXXX issuance, rate-limiting
- `POST /api/beacon` — page visit tracking, milestone writes, progress recomputation
- `GET /api/admin` — operator analytics dashboard (admin token required)
- SES inbound `records@somnatek.org` — email classification (L1/L2/L3) and Bedrock response generation

### 2. RestWell Patient Forum

**Surface identity:** A semi-abandoned support forum for former Somnatek patients and people with sleep disorders.

**Website feel:** Late 2000s / early 2010s forum. Sparse moderation, old user avatars, broken image links, sticky threads, locked topics.

**Function in ARG:** Players find that participants independently posted about similar dreams years after the clinic closed.

**Public threads:**

- CPAP advice
- Insurance frustrations
- Sleep paralysis stories
- Weird dreams after sleep study
- "Did anyone else go to Somnatek?"

**Hidden clues:**

- Usernames map to anonymized participant IDs.
- Post timestamps line up with clinic sessions.
- One moderator edits posts to remove certain room numbers.
- A deleted thread can be reconstructed from cached fragments.

### 3. A University Research Abstract Archive

**Surface identity:** A university-hosted repository of medical conference abstracts and poster presentations.

**Website feel:** Academic, dry, searchable, text-heavy.

**Function in ARG:** Confirms that Somnatek partnered with a university lab and that the study had a formal protocol.

**Documents:**

- Conference abstract
- Poster PDF
- Grant summary
- Ethics board amendment
- Study withdrawal note

**Hidden clues:**

- The poster has an image filename that reveals the internal study name.
- Abstract revisions gradually remove stranger language.
- An ethics amendment references an "environmental recurrence" event.

### 4. County Business Records / Closure Notice

**Surface identity:** A mundane records page showing clinic registration, name changes, and closure details.

**Website feel:** Government records, tiny text, ugly tables, PDF scans.

**Function in ARG:** Grounds the clinic in reality and raises questions about what happened after closure.

**Clues:**

- The clinic changed legal names shortly before closure.
- A shell company acquired remaining patient files.
- The registered agent appears on another entity site.
- The closure date conflicts with forum posts and patient letters.

## Central Mystery

The clinic studied dream content in patients with sleep disorders. Over time, clinicians noticed that unrelated patients described the same place. Instead of treating that as coincidence, they built an experimental protocol to guide patients back to it.

The shared location is called different things in different documents:

- The recurring environment
- The indexed space
- The night floor
- The hallway condition
- The Dorsal site
- Room 413

The clinic never proves what the place is. That ambiguity is crucial. It could be mass suggestion, unethical conditioning, a neurological phenomenon, or something genuinely impossible.

The ARG should never fully answer that question.

## The Place

Players piece together a map from dream logs, intake forms, and forum posts.

Recurring features:

- A reception desk with no staff.
- A hallway that bends left no matter which way you turn.
- A vending machine that only accepts room keys.
- A blue door mentioned by early participants before staff ever describe it.
- A window looking into the same room from multiple floors.
- Room 413, which is sometimes a patient room, sometimes a supply closet, and sometimes not listed.
- A sign reading: "PLEASE WAIT TO BE RECALLED."

The place should feel institutional but not supernatural on its face. Hospital, hotel, school, and office building details blur together.

## Key Characters

### Dr. Mara Ellison

**Role:** Medical director of Somnatek.

**Public image:** Professional, cautious, focused on patient outcomes.

**Hidden role:** Approved increasingly unethical protocol changes after becoming convinced the recurring dream environment was measurable.

**Arc:** Starts skeptical, becomes fascinated, then afraid of losing access to the phenomenon.

### Dr. Edwin Vale

**Role:** University cognitive researcher.

**Public image:** Co-author on conference abstracts.

**Hidden role:** Pushed the idea that shared dream reports could be induced and replicated.

**Arc:** Treats the phenomenon as a research breakthrough and uses language that becomes less human over time.

### Lena Ortiz

**Role:** Sleep technician.

**Public image:** Low-level night staff.

**Hidden role:** The first staff member to realize the patients are not just describing the same dream. They are describing staff actions that have not happened yet.

**Arc:** Leaves warnings in file names, comments, and forum posts.

### Patient 018 / "MarauderBlue" / Caleb R.

**Role:** Former participant and forum user.

**Public image:** Anxious patient asking whether anyone else had strange dreams after a sleep study.

**Hidden role:** The player's main breadcrumb trail. His posts connect the clinic records to the forum.

**Arc:** He becomes convinced the clinic taught him how to return to the night floor while awake.

### Patient 041

**Role:** Redacted participant.

**Public image:** Anonymous case in study data.

**Hidden role:** The first person to mention Room 413 before the room appears in protocol documents.

**Arc:** Their file is fragmented across the ARG and may be the key to the final unlock.

## Season 1 Plot Spine

### Phase 1: The Forgotten Clinic

Players discover Somnatek as a defunct clinic site.

Initial experience:

- Site appears mundane.
- Several pages are broken or outdated.
- A closure notice says patient records were transferred.
- The research studies page links to a harmless sleep recall study.

First unease:

- Staff directory includes a staff member whose photo is missing.
- A PDF has redaction marks that do not fully cover text.
- The patient portal login rejects normal input but responds differently to old participant IDs.

### Phase 2: The Shared Dream

Players find anonymized patient recall summaries.

Revelations:

- Multiple patients describe identical architectural features.
- Reports predate staff prompts.
- Internal notes show the clinic started testing whether the dream could be induced.
- Session forms begin including environmental checkboxes.

Puzzle style:

- Compare dream reports.
- Extract room numbers, dates, and repeated phrases.
- Use those values to unlock archived staff memos.

### Phase 3: The Protocol

Players uncover Protocol 7A.

Revelations:

- Patients were exposed to audio cues during sleep.
- Some patients were asked not to discuss dream content with family.
- Staff stopped calling it a dream and started calling it an environment.
- A university ethics board requested clarification, then the study disappeared from public abstracts.

Puzzle style:

- Metadata in PDFs.
- Hidden HTML comments.
- Form field names.
- Audio spectrogram clue from a short sleep tone file.

### Phase 4: The Forum

Players connect forum posts to participants.

Revelations:

- Former patients continue having the same dream years later.
- Some describe finding each other inside it.
- One patient claims the clinic is still scheduling appointments.
- A moderator account edits posts containing "413" or "blue door."

Puzzle style:

- Reconstruct deleted posts from quote replies.
- Map usernames to participant IDs.
- Find an old cached forum thread.

### Phase 5: Closure Was Not Closure

Players discover business and records documents.

Revelations:

- Somnatek closed publicly in 2014.
- Patient files were transferred to a company that did not exist until after the transfer.
- Bills and appointment reminders continued after closure.
- A staff-only memo says: "Do not terminate active recall subjects."

Puzzle style:

- Use dates from closure notice and forum posts.
- Cross-reference corporate names.
- Find a hidden records page through a document ID.

### Phase 6: Room 413

Players unlock the final Season 1 page.

Revelations:

- Room 413 is not a room in the clinic.
- It is a repeatable coordinate in the shared environment.
- Staff believed it could be used as a stable meeting point.
- The final file includes a current-date appointment confirmation for the player or a generic "visitor."

Season 1 ending:

The site does not reveal a monster or final answer. It gives players a new appointment time, a room number, and a short instruction:

"If you wake before arrival, do not re-enter the hallway."

## Puzzle Design

### Puzzle 1: Participant ID Login

**Location:** Somnatek patient portal.

**Input:** A valid participant ID found in a redacted PDF.

**Mechanic:** Redaction is imperfect. Players infer the ID from visible fragments and a table pattern.

**Reward:** Access to patient recall summaries.

### Puzzle 2: Repeated Phrase Index

**Location:** Dream recall summaries.

**Input:** Repeated phrase: "please wait to be recalled."

**Mechanic:** The phrase appears with slight OCR errors across documents. Players search the site for variations.

**Reward:** Hidden archived page listing environmental features.

### Puzzle 3: Room Sequence

**Location:** Environmental feature checklist.

**Input:** A sequence of room numbers gathered from multiple reports.

**Mechanic:** Sort by session date, not document order.

**Reward:** Staff memo about Protocol 7A.

### Puzzle 4: Audio Spectrogram

**Location:** Sleep tone MP3 or WAV.

**Input:** Word hidden in spectrogram.

**Mechanic:** Players analyze a short audio clip. No video required.

**Reward:** University archive search term.

### Puzzle 5: Deleted Forum Thread

**Location:** RestWell forum.

**Input:** Thread slug reconstructed from quote fragments.

**Mechanic:** Locked / deleted thread leaves traces in replies and old links.

**Reward:** Patient 018's final post.

### Puzzle 6: Corporate Transfer

**Location:** County records page.

**Input:** Corporate document number.

**Mechanic:** Cross-reference closure notice with business registry table.

**Reward:** Hidden transfer agreement page.

### Puzzle 7: Final Appointment

**Location:** Recovered staff portal page.

**Input:** Patient 041's full reconstructed session path.

**Mechanic:** Combine dates, rooms, and dream-feature order.

**Reward:** Season 1 ending page.

## Site Structure

```text
somnatek.example
├── index.html
├── about.html
├── sleep-disorders.html
├── patient-resources.html
├── insurance.html
├── research.html
├── closure-notice.html
├── portal.html
├── archive/
│   ├── study-2008.html
│   ├── recall-summary.html
│   ├── environmental-index.html
│   └── protocol-7a.html
├── staff/
│   ├── directory.html
│   ├── memo-2011-04-13.html
│   └── transfer.html
└── assets/
    ├── pdf/
    ├── img/
    ├── audio/
    └── data/

restwell.example
├── index.html
├── forums.html
├── thread-cpap-maintenance.html
├── thread-somnatek-followup.html
├── thread-blue-door-locked.html
└── archive/deleted-thread-413.html

university-archive.example
├── index.html
├── search.html
├── abstract-sleep-recall-2009.html
├── poster-session-b14.html
└── ethics-amendment-7a.html

county-records.example
├── index.html
├── business-search.html
├── somnatek-sleep-health-center.html
├── dorsal-health-holdings.html
└── transfer-record-2014-09.html
```

## Asset List

### Images

AI-generated stills:

- Exterior of a small suburban sleep clinic.
- Reception desk, empty and dated.
- Sleep study room with bed, monitoring wires, low light.
- Staff headshots with normal medical-site quality.
- Scanned brochures and appointment cards.
- A hallway image that should look mundane but slightly wrong.
- Forum user avatars, mostly generic or broken.
- University poster thumbnail.

Image rules:

- Avoid cinematic horror lighting.
- Make everything look like documentation, not promotion.
- Add compression artifacts, scanner dust, bad cropping, and uneven white balance.
- Keep the uncanny details subtle enough that players argue over them.

### Documents

- Sleep hygiene PDF.
- Patient intake form.
- Consent form.
- Study recruitment flyer.
- Dream recall questionnaire.
- Staff protocol checklist.
- Ethics board amendment.
- Clinic closure notice.
- Patient records transfer notice.
- Billing letter.

### Audio

Short, cheap-to-produce audio only:

- Sleep tone file.
- Voicemail greeting from closed clinic.
- Hold music loop.
- Automated appointment reminder.
- Low-quality dictation note from a staff member.

Audio should be optional for accessibility, with transcripts available somewhere in-world.

## Visual Direction

### Somnatek

- White / pale blue / muted gray.
- Dated medical website layout.
- Header with clinic logo and phone number.
- Left sidebar navigation on deeper pages.
- PDF icons, table layouts, small text.

### RestWell Forum

- Narrow fixed-width layout.
- Thread tables.
- User avatars.
- Join dates and post counts.
- Locked thread icons.
- Slightly inconsistent CSS.

### University Archive

- Bare academic repository.
- Search filters.
- Abstract pages.
- Citation metadata.
- Download links.

### County Records

- Ugly but functional government tables.
- Case numbers.
- Document IDs.
- Scanned PDF links.
- No polish.

## Believability Rules

- Do not make every page scary.
- Most pages should be boring and useful.
- Hide the strongest clues behind normal navigation.
- Use realistic typos, broken links, and old content patterns.
- Keep names, dates, and IDs internally consistent.
- Never over-explain the phenomenon.
- Use institutional language instead of spooky language.
- Let the community feel like they discovered the horror by doing research.

## Red Flags to Avoid

- Obvious "creepy" fonts.
- Too much glitch styling.
- Jump scares.
- Monster images.
- Fake blood, gore, or overt occult symbols.
- Every document containing a clue.
- Characters writing like horror protagonists.
- Passwords like `nightmare`, `sleepless`, or `wake_up`.
- A site that announces itself as an ARG.

## Example Clue Trail

1. Player finds Somnatek closure notice.
2. Closure notice says records transferred to Dorsal Health Holdings.
3. Research page mentions a sleep recall study.
4. Study PDF has imperfectly redacted participant IDs.
5. One ID works in the patient portal.
6. Portal reveals recall summaries.
7. Multiple summaries mention the same phrase.
8. Searching the phrase reveals hidden environmental index page.
9. The index references Protocol 7A.
10. Protocol metadata contains Lena Ortiz's username.
11. Username appears on RestWell forum.
12. Forum posts reveal Room 413.
13. Room 413 connects to county transfer record.
14. Transfer record unlocks final staff portal page.
15. Final page gives current appointment confirmation.

## Launch Strategy

### Initial Release

Build only the first three layers:

- Somnatek public site.
- Patient portal puzzle.
- First recall summary archive.

This gives players a strong opening without requiring the entire ARG to be complete.

### Week 2 Unlock

Add / reveal:

- RestWell forum.
- Deleted thread puzzle.
- Patient 018 trail.

### Week 3 Unlock

Add / reveal:

- University archive.
- Ethics amendment.
- Audio spectrogram clue.

### Week 4 Unlock

Add / reveal:

- County records.
- Corporate transfer puzzle.
- Season 1 ending.

## AWS Implementation Notes

### Simple Version

Use static hosting:

- S3 for each site.
- CloudFront for HTTPS and caching.
- Route 53 for domains/subdomains.
- Lambda + API Gateway for puzzle validation.
- DynamoDB for solve state if you want accounts or progression tracking.

### Suggested Domain Pattern

Use separate domains or subdomains for believability:

- `somnatekhealth.com`
- `forum.restwellonline.net`
- `archive.wexler-university.edu` using a fictional university name.
- `records.harrowcounty.gov` using a fictional county.

If real-looking domains feel legally risky, use fictional but plausible domains that do not impersonate real institutions.

### Puzzle Validation

Avoid storing final answers plainly in client-side JavaScript.

Use Lambda endpoints like:

- `/api/portal-login`
- `/api/protocol-access`
- `/api/final-appointment`

The static site sends puzzle submissions to Lambda. Lambda checks hashed answers and returns the next in-world page path or token.

### Cost Control

- Keep everything mostly static.
- Use compressed images.
- Use short audio files.
- Avoid video entirely.
- Use CloudFront caching.
- Keep Lambda calls limited to puzzle submissions.
- DynamoDB free tier may be enough early on.

## First Build Milestone

Build the Somnatek site as a convincing dead clinic portal.

Minimum pages:

- Home
- About
- Patient resources
- Research studies
- Closure notice
- Staff directory
- Patient portal login
- Study PDF / HTML document
- First hidden recall-summary page

Minimum puzzle:

- Redacted participant ID from study document unlocks recall summaries.

Minimum assets:

- Clinic exterior image.
- Reception image.
- Staff headshots.
- One intake form.
- One study summary document.
- One recall summary table.

## First Page Copy Direction

The home page should read like this is not for players. It should be stale, administrative, and ordinary.

Example homepage copy:

> Somnatek Sleep Health Center provided diagnostic sleep testing and follow-up care for patients throughout Harrow County from 2006 to 2014. This site remains available for former patients seeking archived educational materials, billing contact information, and records transfer notices.

Small closure notice:

> Somnatek Sleep Health Center ceased clinical operations on September 18, 2014. Former patients may review the records transfer notice for information regarding archived sleep study documentation.

Small research link:

> Archived research participation materials are retained for reference and compliance purposes.

## Final Season 1 Feeling

Players should end Season 1 with a quiet, sickening uncertainty:

- The clinic is closed, but something is still scheduling appointments.
- The shared dream might be a place.
- The records may have been changed after players found them.
- The player may now be part of the follow-up study simply by interacting with the portal.

The final note should be restrained:

> Appointment confirmed.
>
> Room: 413
>
> Arrival window: 02:10-02:17
>
> If recalled early, remain seated.

---

## How The Full System Works

This section documents how all live components connect, how players move through them, and how the ARG operator controls escalation.

---

### Player Journey Overview

```
                        finds site
                            │
                            ▼
                 [somnatek.org — public pages]
                 Reads clinic history, staff,
                 research summary, closure notice.
                 Nothing obviously wrong yet.
                            │
                   finds portal / PDF IDs
                            ▼
                  [Patient Portal puzzle]
                  Enters PTX-018 or similar.
                  Receives archived recall summaries.
                  Begins pattern-matching.
                            │
                 emails records@somnatek.org
                            ▼
              [SES → Lambda → Bedrock → SES]
              Automated response from DHHRMS v2.3.
              Level 1: standard closure acknowledgment.
              Level 2: "active archive classification",
                       "processing timelines are not fixed."
              Level 3: system has an open file on the sender.
                            │
                calls the clinic phone number
                            ▼
       [Amazon Connect → Lambda → Polly → caller]
       Hears IVR menu. Presses extensions 1-4.
       Level 1: closed clinic recordings.
       Level 2: research line "monitored periodically."
       Level 3: "your recall window is open."
                            │
               finds RestWell forum (week 2+)
                            ▼
          [restwell.org — patient support forum]
          Discovers independent patient reports.
          Cross-references usernames with PTX IDs.
          Finds partially-deleted thread by MarauderBlue.
                            │
            finds Wexler university archive (week 3+)
                            ▼
      [wexler.org — university research archive]
      Conference abstracts, protocol filings,
      redacted IRB correspondence.
      Vale's name in edit history of PDFs
      post-dates his removal from the study.
                            │
           finds county business records (week 4+)
                            ▼
     [harrow-county.org — county records portal]
     Dorsal Health Holdings LLC registered
     two months after the patient file transfer.
     Registered agent: Edwin Vale.
     One document on file.
```

---

### The Three Communication Systems

#### 1. Email — `records@somnatek.org`

**How it works:**

1. Player emails `records@somnatek.org`
2. SES receipt rule stores the raw MIME message in S3 (`somnatek-email-inbound` bucket, `inbound/` prefix)
3. S3 event notification triggers `lambda/email-responder`
4. Lambda parses the email, hashes the sender address (SHA-256), and retrieves the sender's state from DynamoDB
5. Lambda classifies the email body against keyword patterns to determine response level
6. Lambda calls Amazon Bedrock (Claude 3 Haiku) with a persona-locked system prompt
7. Bedrock generates a 150–250 word response as DHHRMS v2.3, the automated Dorsal Health Holdings records system
8. Lambda sends the response via SES and updates the sender's state in DynamoDB

**Sender state persists.** Level never decreases. The third email from a level-2 sender is more strange than the first.

**Rate limiting:** 1 response/hour, 3/day. Silent drops beyond that.

**Level triggers:**

| Level | Keywords |
|---|---|
| 1 | Any email |
| 2 | study, research, protocol, Wexler, recall, Dr. Vale, Dr. Ellison, participant, longitudinal, transfer agreement |
| 3 | PTX-### IDs, room 413, night floor, PLEASE WAIT TO BE RECALLED, Lena Ortiz, dorsal site, indexed space, blue door, hallway bends |

**Level 3 response character:**
- The system appears to already have an open file on the sender before they have identified themselves
- References "your file" as current and active
- Includes "PLEASE WAIT TO BE RECALLED" as standard administrative language
- Reference numbers end in `-413`

---

#### 2. Phone — the clinic line

**How it works:**

1. Player calls the 740 number
2. Amazon Connect receives the call and invokes `lambda/phone-responder` with `phase=greeting`
3. Lambda hashes the caller's phone number and retrieves their level from DynamoDB
4. Lambda returns level-appropriate greeting SSML
5. Connect plays the greeting via Polly (voice: Joanna) and waits for DTMF input (8-second timeout)
6. Player presses a digit; Connect invokes Lambda again with `phase=extension, extension=digit`
7. Lambda returns extension-specific SSML based on digit + level
8. Connect plays the response and disconnects

**Extensions:**

| Digit | Extension | Level 1 | Level 2 | Level 3 |
|---|---|---|---|---|
| 1 | Records & Administration | Standard Dorsal Holdings transfer notice | Same + "if you have been contacted by this office, your file is current" | Same |
| 2 | Research Department (Dr. Vale's line) | Study concluded 2013, no enrollment | "Follow-up participants" language, "this line is monitored periodically" | "Participant file verified. Your recall window is currently open." |
| 3 | Dr. Ellison's office | Voicemail full, not accepting messages | Tired voicemail recording, "if calling regarding the study, do not leave a message here" | "Room 413 is not on any floor plan. Do not go back." |
| 4 | All other extensions (Lena Ortiz) | Extension not in service | Extension not in service | "The extension you have dialed is no longer in service. If someone gave you this number, they should not have been able to." |

**No input / timeout / press 9:** Replays the main greeting menu.

**Caller promotion:** Callers default to level 1. Promote by writing a DynamoDB record with `pk: PHONE#<sha256>` and `level: 2` or `level: 3`. See [deploy.md](deploy.md) for the PowerShell command.

---

#### 3. Portal — `somnatek.org/portal.html`

**How it works:**

1. Player enters a PTX-### participant ID
2. Form POSTs to API Gateway → `lambda/portal-login` (to be built)
3. Lambda hashes the ID, checks DynamoDB solve state table
4. Returns the appropriate archived recall summary page
5. Records the player's VIS-##### visitor ID in DynamoDB on first access

**Visitor IDs** are assigned on first portal access and used to personalize email content in later stages. Format: `VIS-XXXXX` (five-digit zero-padded).

---

### DynamoDB Tables

All state lives in three tables:

| Table | Env var | Purpose |
|---|---|---|
| `somnatek-visitors` | `DYNAMODB_TABLE_VISITORS` | Email sender state (`EMAIL#hash`), phone caller state (`PHONE#hash`), portal visitor records (`VIS#id`) |
| `somnatek-solve-state` | `DYNAMODB_TABLE_SOLVE_STATE` | Which puzzles a given visitor ID has solved and what they have unlocked |
| `somnatek-content-ledger` | `DYNAMODB_TABLE_CONTENT_LEDGER` | Content drop tracking: `drafted → scheduled → released → discovered → superseded → removed` |

---

### How the Operator Controls Escalation

Players are never escalated automatically based purely on calling or emailing. Escalation is a deliberate operator action.

**Email level** is driven by keyword classification — players self-escalate by using deeper lore language. The operator does not need to do anything.

**Phone level** is a manual operator action. The operator decides when a specific player has earned a level 2 or level 3 phone experience and writes the DynamoDB record.

**Portal access** is puzzle-gated. Operators control which PTX IDs return content and what that content says by managing the solve state table.

**Content drops** are controlled via the content ledger table. The release script in `scripts/` sets a record to `released` and copies the staged artifact to the public S3 path.

---

### The Escalation Arc

| Stage | What players do | What they experience |
|---|---|---|
| 1 — Forgotten Clinic | Browse the public site | Static institutional site. Small anomalies. |
| 2 — Shared Dream Evidence | Find and solve the portal puzzle | Archived recall summaries. Patterns emerge. |
| 3 — The Archive Responds | Email the clinic, dig deeper | Automated responses that know too much. Pages change after puzzles are solved. |
| 4 — Visitor Classification | Opt into email updates | Assigned a VIS-##### ID. Receive in-world appointment notices. |
| 5 — The Protocol | Find Protocol 7A | Study was not a dream study. Environmental recall was real. |
| 6 — The Forum | Reach RestWell | Independent patient reports corroborate the archive. MarauderBlue's posts. |
| 7 — Records Contradict | Reach Wexler and Harrow County | Dorsal Health Holdings was created after the transfer. Vale's name should not be there. |
| 8 — Room 413 | Final puzzle solve | Appointment confirmed. Room 413. Arrival window. |

---

### Content Drop Workflow

1. Create artifact in `staged/` (never committed to public repo)
2. Add record to content ledger table with status `drafted`
3. When ready, update record to `scheduled` with target release timestamp
4. Run `scripts/release.js` — copies artifact to public S3 path, updates ledger to `released`
5. When players find it, ledger status updates to `discovered` (either manually or via Lambda)
6. Superseded artifacts are marked `superseded` — still accessible, but no longer the current version

**Daily micro-drops** are the smallest unit: a single HTML comment added to a page, a PDF metadata change, a forum reply, a broken link becoming active. These require a site file update and redeploy.

**Redeploy shortcut:**
```powershell
$env:AWS_PROFILE = "somnatek-arg"
aws s3 sync G:\APPS\ARG\sites\somnatek\ s3://somnatek-site/ --delete
aws ssm send-command --instance-ids "i-081a7e7e3c65b1f5d" `
  --document-name "AWS-RunShellScript" `
  --parameters 'commands=["aws s3 sync s3://somnatek-site/ /var/www/somnatek/ --delete","chown -R nginx:nginx /var/www/somnatek","systemctl reload nginx"]'
```

---

### Infrastructure Summary

| Component | Service | Stack | Status |
|---|---|---|---|
| Somnatek site hosting | EC2 + nginx | SomnatekEc2Stack | Deployed |
| Site files | S3 `somnatek-site` | Manual | Deployed |
| Email inbound | SES receipt rule + S3 | SomnatekEmailStack | Ready to deploy |
| Email response | Lambda + Bedrock | SomnatekEmailStack | Ready to deploy |
| Phone line | Amazon Connect | SomnatekPhoneStack | Ready to deploy |
| Phone routing | Lambda + Polly | SomnatekPhoneStack | Ready to deploy |
| Visitor state | DynamoDB | SomnatekEmailStack | Ready to deploy |
| Portal login | Lambda + API Gateway | Not yet built | Planned |
| RestWell forum | EC2 or S3 + nginx | Not yet built | Week 2 |
| Wexler archive | EC2 or S3 + nginx | Not yet built | Week 3 |
| Harrow County records | EC2 or S3 + nginx | Not yet built | Week 4 |

