# Sleep Clinic ARG Live Operations Plan

## Core Vision

The Somnatek ARG should feel like a living archive that never fully resolves.

Instead of a traditional beginning, middle, and end, the project should behave like a system that keeps producing records, corrections, appointment notices, forum posts, staff memos, patient fragments, and anomalies.

The player should gradually feel less like an outside investigator and more like someone who has been noticed by the experiment.

The guiding experience:

> At first, the player investigates Somnatek.
>
> Later, Somnatek appears to investigate the player.
>
> Eventually, the player is treated like a participant in a follow-up protocol.

## Important Safety Principle

The ARG can make players feel implicated, watched, and unsettled inside the fictional frame, but it should not actually harass, stalk, threaten, or exploit them.

Use opt-in mechanisms for anything personal:

- Email updates.
- SMS updates.
- Discord roles.
- Personalized IDs.
- Appointment reminders.
- Mailed physical artifacts.

Do not collect sensitive medical data, sleep logs, diagnoses, real addresses, or private personal details unless absolutely necessary for a purchase or shipment handled through a proper commerce provider.

The illusion should be strong, but the project should remain ethical, safe, and legally defensible.

## The Infinite Structure

The ARG should not be one story. It should be a repeating investigation engine.

### Core Loop

1. A new artifact appears.
2. The artifact changes the meaning of an older artifact.
3. Players discover a new ID, phrase, date, or room reference.
4. The discovery unlocks another document, page, thread, email, or audio file.
5. The system acknowledges that players found it.
6. A new layer opens.

This loop can continue indefinitely because each new drop can recontextualize old material.

## Content Staging and Release Infrastructure

Unreleased content is never committed to the public repository branch.

- **Staged assets** live in a private S3 prefix (`s3://somnatek-site/staged/`) or in the local `staged/` directory (gitignored).
- **Content ledger** — a DynamoDB table (`somnatek-content-ledger`) is planned to track release state for each artifact: `drafted` → `scheduled` → `released` → `discovered` → `superseded` → `removed`. **This table is not yet deployed.** (`aws dynamodb describe-table --table-name somnatek-content-ledger` returns ResourceNotFoundException.) Run `scripts/seed-content-ledger.js` to deploy it, or add it to CDK before using the ledger workflow.
- **Release scripts** live in `scripts/`. They copy staged artifacts to the public S3 or EC2 path and update the ledger.
- **Automation (planned):** EventBridge Scheduler will trigger release Lambdas on a schedule for daily micro-drops. This is not yet implemented — current releases are manual (admin runs deploy script).

For daily micro-drops before automation is built, the operational workflow is:
1. Author artifact locally.
2. Run `scripts/deploy-and-nginx.ps1` (or equivalent) to sync the file to EC2.
3. Update `somnatek-content-ledger` record to `released`. **NOTE: table not yet deployed — skip step 3 until `somnatek-content-ledger` is provisioned. Track releases manually in `docs/roadmap.md` changelog section.**

## Content Cadence

### Daily Micro-Drops

Small updates that keep the world alive without requiring major production effort.

Examples:

- One new forum reply.
- One corrected typo in a public record.
- One new appointment log row.
- One broken link becoming active.
- One archived image replacing a placeholder.
- One metadata change in a PDF.
- One new automated status message.
- One hidden HTML comment.
- One new patient ID in a table.
- One weather / sleep lab status update.

Daily drops should usually be subtle. Most should not be major puzzle gates.

### Weekly Major Drops

Larger updates that create momentum and discussion.

Examples:

- New staff memo.
- New patient file.
- New RestWell forum thread.
- New university abstract revision.
- New county record.
- New audio artifact.
- New hidden portal page.
- New puzzle chain.
- New personalized email batch.
- New in-world announcement.

Weekly drops should move the central mystery forward or reveal a new branch.

### Monthly Events

Bigger community moments.

Examples:

- Timed portal maintenance window.
- Live puzzle night.
- Public records release.
- Appointment confirmation wave.
- RestWell forum lockdown.
- Dorsal Health Holdings statement.
- New entity site discovered.
- Physical / digital evidence drop.

Monthly events keep the ARG from becoming only a passive archive.

## Escalation Model

The story should get stranger slowly. Each stage should preserve plausible deniability until players are too deep to step back cleanly.

**Current implementation status (May 1, 2026):**
- Stage 1 — ✅ Live
- Stage 2 — ✅ Live (archive, admin portal)
- Stages 3–6 — ⬜ Planned

**Stage 3 trigger conditions** (scripted in `scripts/discord-channel-pins.txt` and `scripts/seed-content-ledger.js`):
- 100+ Discord members, OR
- 30 days since launch, OR
- 10+ Level 3 inbound emails

When any trigger fires, update the relevant ledger entries to `released` and run the Stage 3 content deploy.

### Stage 1: Forgotten Clinic

The site looks abandoned and real.

Tone:

- Administrative.
- Medical.
- Dry.
- Slightly outdated.

Player role:

- Visitor.
- Investigator.
- Curious outsider.

Examples:

- Closure notices.
- Staff pages.
- Patient resources.
- Research PDFs.
- Broken portal login.

### Stage 2: Shared Dream Evidence

Players discover that unrelated patients described the same place.

Tone:

- Clinical unease.
- Pattern recognition.
- Data contradictions.

Player role:

- Researcher.
- Solver.
- Archivist.

Examples:

- Recall summaries.
- Environmental checklists.
- Session logs.
- Protocol notes.

### Stage 3: The Archive Responds

The site begins reacting to community progress.

Tone:

- Quietly aware.
- Still bureaucratic.
- Never openly supernatural.

Player role:

- Known visitor.
- Unassigned observer.

Examples:

- A page changes after a puzzle is solved.
- A new memo references "external review activity."
- A portal status says "unregistered access pattern detected."
- Forum moderator posts after players find a hidden thread.

### Stage 4: Visitor Classification

Players who opt into email or portal participation receive IDs.

**Live escalation triggers (email and phone):**

The email responder Lambda (`lambda/email-responder/index.js`) is live and classifies inbound emails to `records@somnatek.org` by keyword content.

**Important:** Classification is passive — any email sent to `records@somnatek.org` triggers classification and DynamoDB write (SHA-256 hashed sender, level, timestamp). No opt-in is required. This is by design for immersion. Ensure `privacy.html` is live and references this behavior before running promotion pushes.

**Email responder operational status:**

| Layer | Status |
|---|---|
| Lambda built | ✅ |
| Lambda deployed (`SomnatekEmailStack`) | ✅ |
| Level 1 live-tested | ⚠️ Unconfirmed |
| Level 2 live-tested | ⚠️ Unconfirmed |
| Level 3 live-tested | ⚠️ Unconfirmed |

This is the primary mechanism for Stage 3–4 escalation without requiring Discord infrastructure.

- **Level 1** — General inquiry. Automated form-letter response. No identification.
- **Level 2** — Study awareness (keywords: Protocol 7A, sleep study, dream recall, Ellison, Ortiz). Response references study records, asks for patient ID.
- **Level 3** — Direct ARG knowledge (keywords: 413, PLEASE WAIT TO BE RECALLED, PTX, night floor, blue door, indexed space). Response implies a pre-existing file on the sender and references the recall queue. Response is generated by Claude 3 Haiku (Bedrock) using the in-world system prompt.

The phone line `(404) 551-4145` routes through Amazon Connect. The inbound fax `(404) 671-9774` plays the morse-code audio artifact (Morse for "413" at 15 WPM).

**Phone/fax operational status:**

| Layer | Status |
|---|---|
| `lambda/phone-responder` built | ✅ |
| `SomnatekPhoneStack` deployed (Connect + Lambda) | ✅ |
| IVR contact flow end-to-end tested | ⚠️ Unconfirmed |
| Fax audio `(404) 671-9774` confirmed playing live | ⚠️ Unconfirmed |
| `fax_decoded` milestone achievable by players | ⚠️ Blocked — depends on fax IVR live test |

Do not count `fax_decoded` (15 pts) as achievable until the fax IVR is confirmed operational.

Email level never decreases. A sender who reaches Level 3 stays at Level 3 across all future interactions. Sender state is stored in DynamoDB by SHA-256-hashed sender address (no PII stored in plaintext).

Tone:

- Administrative personalization.
- Mildly invasive.
- Procedural.

Player role:

- Visitor.
- Observer.
- Candidate.

Examples:

- Visitor ID assigned.
- Appointment window generated.
- Portal says "classification pending."
- Emails address them by chosen alias or assigned code.

### Stage 5: Follow-Up Subject

The ARG implies the player has become part of the experiment.

Tone:

- Calmly alarming.
- Institutional.
- Avoid direct threats.

Player role:

- Follow-up subject.
- Recalled participant.

Examples:

- "You have been added to the recall queue."
- "Your arrival window has not been confirmed."
- "If you have not completed intake, disregard the blue door."
- "Observer status amended after unscheduled document access."

### Stage 6: The System Is Larger Than Somnatek

Somnatek becomes one node in a broader network.

Tone:

- Expansive.
- Conspiratorial, but still grounded.
- More records, fewer answers.

Player role:

- Active participant.
- Witness.
- Unwilling archivist within the fiction.

Examples:

- Other clinics.
- Other countries.
- Earlier studies.
- Corporate successors.
- Public infrastructure links.
- Insurance and billing trails.

## Making Players Feel Part of the Experiment

### Use Assigned IDs

Give opt-in players an in-world identifier.

**Live implementation:** Players who solve the portal puzzle receive a `VIS-XXXXX` visitor ID (five-digit, zero-padded). The ID is issued by `lambda/portal-login`, stored in DynamoDB (`somnatek-visitors` table), and persisted in the player’s browser `localStorage` as `sntk_vis`. Every subsequent page visit fires a beacon that records the VIS ID against milestone progress.

Examples:

- VIS-04291
- OBS-17C
- RCL-PENDING
- EXT-413-08

IDs can appear in:

- Emails.
- Portal pages.
- Downloaded PDFs.
- Supporter dashboards.
- Discord roles.

Do not use real names unless the player explicitly provides a display name for personalization.

### Use Portal State

A simple portal can make the ARG feel reactive.

**Live implementation:** The fake admin portal (`/admin/`) has three access tiers with credentials hidden in HTML comments across different pages. Tier 3 shows the player’s own VIS-XXXXX in the recall queue with status `RECALL PENDING`. This is the first live instance of the player being inside the system. The page-beacon Lambda (`lambda/page-beacon`) writes milestone `admin_t3` and recomputes `percentComplete` and `level` immediately on access.

Possible statuses:

- Visitor record created.
- Intake incomplete.
- Observation pending.
- Recall window unavailable.
- Session interrupted.
- Duplicate environment match.
- Manual review required.

### Use Community Milestone Recognition

The system can react to group behavior without targeting individuals.

Examples:

- "Unusual access volume detected."
- "Archived materials temporarily unavailable due to external review."
- "Please discontinue unauthorized reconstruction of deleted patient discussions."
- "Protocol 7A materials have been restored for compliance review."

### Use Personalized But Non-Sensitive Details

Safe personalization inputs:

- Chosen alias.
- Email address.
- Time zone.
- Preferred contact type.
- Self-selected role, such as Observer, Archivist, Technician, or Former Patient.

Avoid:

- Medical history.
- Sleep habits.
- Real mental health information.
- Exact location.
- Real identity details.
- Anything that could make players feel unsafe outside the fiction.

### Use Time-Based Appointment Windows

Generate unsettling appointment notices.

Examples:

- "Arrival window: 02:10-02:17 local time."
- "If you are awake during your assigned interval, no action is required."
- "Missed arrivals are automatically rescheduled."

These should be fictional and should not encourage unhealthy behavior like sleep deprivation.

## Infinite Content Engines

### 1. Patient File Generator

A repeatable format for new patient records.

Fields:

- Participant ID.
- Intake date.
- Session count.
- Sleep complaint.
- Recall consistency score.
- Environmental markers.
- Technician note.
- Redacted follow-up status.

Use this to create weekly or monthly new case files.

### 2. Forum Thread Generator

A repeatable format for RestWell posts.

Thread types:

- Former patient checking in.
- CPAP troubleshooting.
- Insurance complaint.
- Dream similarity discussion.
- Deleted / locked moderator incident.
- User warning others not to contact the clinic.

Most forum content should be mundane. Only some threads should contain clues.

### 3. Records Correction Generator

Government and business records can update forever.

Correction types:

- Name spelling correction.
- Date correction.
- Document replaced.
- Case number added.
- Entity merged.
- Registered agent changed.
- Public notice amended.

These updates are believable and can hide clue changes.

### 4. Research Revision Generator

Academic abstracts can change quietly.

Revision types:

- Abstract wording changed.
- Author removed.
- Ethics note added.
- Poster unavailable.
- Supplement restored.
- Citation corrected.
- Dataset link deprecated.

This lets the university archive remain active.

### 5. Automated System Messages

The portal can produce ongoing system notices.

Examples:

- "Maintenance completed."
- "Legacy records restored."
- "Recall queue synchronized."
- "Duplicate visitor hash detected."
- "Session records reindexed."
- "Environmental marker list updated."

These are easy to add and keep the world alive.

## Perpetual Story Branches

The ARG can expand through branches rather than endings.

### Branch A: Other Clinics

Somnatek was not unique.

New entities:

- Lakeshore Sleep Diagnostics.
- Meridian Circadian Institute.
- Halberg Neurological Sleep Lab.
- Dorsal Health Holdings.

### Branch B: Insurance Records

Billing codes reveal impossible appointment patterns.

Artifacts:

- Explanation of benefits.
- Denied claims.
- Prior authorization requests.
- Billing disputes.
- Procedure code tables.

### Branch C: The University Lab

The academic partner knew more than the clinic.

Artifacts:

- Research grants.
- Ethics amendments.
- Poster sessions.
- Internal review notes.
- Dataset descriptions.

### Branch D: The Night Floor Map

Players slowly reconstruct the shared environment.

Artifacts:

- Patient sketches.
- Environmental checklists.
- Room lists.
- Staff route notes.
- Contradictory maps.

### Branch E: Corporate Successor

A current company inherited the protocol.

Artifacts:

- Press releases.
- Investor language.
- Product pages.
- Wellness app terms.
- Data privacy policy.

### Branch F: The Player Cohort

Opt-in players become a fictional cohort.

Artifacts:

- Cohort dashboard.
- Visitor status.
- Recall queue.
- Appointment batches.
- Group progress milestones.

## Content Calendar Template

### Weekly Rhythm

Monday:

- Small administrative update.
- Example: corrected record, new table row, forum reply.

Wednesday:

- Clue-bearing artifact.
- Example: new memo, hidden comment, updated PDF, audio fragment.

Friday:

- Community-facing disruption.
- Example: portal outage, forum lockdown, new status notice.

Sunday:

- Optional recap or quiet change.
- Example: a timestamp update, a deleted page, a new archive entry.

### Monthly Rhythm

Week 1:

- New patient file.

Week 2:

- New cross-site connection.

Week 3:

- Community puzzle or live window.

Week 4:

- Story escalation or new branch reveal.

## Production Workflow

### Maintain a Canon Bible

Track:

- Dates.
- Patient IDs.
- Staff names.
- Corporate entities.
- Domain names.
- Room numbers.
- Puzzle answers.
- Which clues are public.
- Which clues are paid bonus only.
- Which documents have changed.

This prevents contradictions from becoming accidental instead of intentional.

### Maintain a Release Ledger

For each drop, record:

- Release date.
- Artifact name.
- Site / path.
- Clue purpose.
- Related documents.
- Whether it is required for progression.
- Whether it has been discovered.
- Community reaction.

### Maintain a Backlog

Keep at least four weeks of drops prepared before launch.

Backlog categories:

- Daily micro-drops.
- Weekly major drops.
- Emergency filler artifacts.
- Community response artifacts.
- Monetization artifacts.
- Future branch seeds.

## AWS Automation Model

### Static Content

Use:

- S3 for static pages and assets.
- CloudFront for hosting and caching.
- Route 53 for domains.

### Scheduled Drops

Use:

- EventBridge Scheduler to trigger releases.
- Lambda to copy scheduled artifacts from a private S3 prefix to a public S3 prefix.
- DynamoDB to track released artifacts and player states.

Example content states:

- drafted
- scheduled
- released
- discovered
- superseded
- removed

### Portal Personalization

Use:

- API Gateway for portal endpoints.
- Lambda for validation and state changes.
- DynamoDB for visitor IDs and solve state.
- SES for opt-in email transmissions.

### Safe Personalization Data

Store only:

- Visitor ID.
- Email if opted in.
- Chosen display alias.
- Puzzle progress.
- Email preferences.
- Consent timestamp.
- Unsubscribe status.

Avoid storing unnecessary personal data.

## Community Management

### Discord / Forum Strategy

Create an out-of-world community space, but keep the in-world sites separate.

Channels:

- General discussion.
- Clue solving.
- Document archive.
- Theories.
- Spoilers.
- Announcements.
- Support / safety.

### Community Response Drops

When players discover something quickly, let the world respond.

Examples:

- A page disappears.
- A memo is revised.
- A moderator warns users.
- A system status says an archive was accessed too frequently.
- A staff account uploads the wrong version of a file.

### Avoid Punishing Players

Do not delete clues permanently because players solved them.

If an artifact disappears in-world, make it recoverable through:

- Mirrors.
- Cached pages.
- Forum quotes.
- Downloaded copies.
- Later archive restoration.

## Psychological Escalation Without Harm

Use implication, not real intimidation.

Good:

- "Your visitor record has been created."
- "Observer status pending."
- "You have accessed materials outside the expected sequence."
- "No action is required if you do not recall the hallway."

Avoid:

- Real-world threats.
- Implying actual surveillance.
- Encouraging sleep deprivation.
- Asking players to isolate themselves.
- Asking players to provide medical details.
- Suggesting players are physically unsafe.
- Contacting players outside channels they opted into.

## Never-Ending Season Model

Instead of seasons ending, use arcs that transform into new arcs.

### Arc 1: Somnatek

Question: What happened at the clinic?

Transformation: Somnatek was one implementation of a larger protocol.

### Arc 2: Dorsal Health Holdings

Question: Who inherited the study?

Transformation: The protocol became a data product.

### Arc 3: The Other Sites

Question: How many locations mapped the same environment?

Transformation: The night floor predates the clinics.

### Arc 4: Visitor Cohort

Question: Why are current players being classified?

Transformation: The archive is not documenting the experiment. It is running it.

### Arc 5: The Recall Network

Question: What is the system trying to recall?

Transformation: The players are helping reconstruct a map that something else can use.

## Burnout Prevention

A never-ending ARG needs sustainable production.

Use three content sizes:

- Small: one table row, one forum reply, one metadata change.
- Medium: one document, one thread, one email, one image.
- Large: one new site section, one live event, one puzzle chain.

Most drops should be small.

Recommended ratio:

- 70% small.
- 25% medium.
- 5% large.

Do not try to make every update a major event.

## First 30 Days Plan

### Week 1

- Launch Somnatek public site.
- Add patient portal.
- Release first redacted study document.
- Assign first visitor IDs to opt-in users.

### Week 2

- Add first recall summary page.
- Add RestWell forum thread.
- Send first opt-in email transmission.
- Update portal status to "observer pending."

### Week 3

- Release Protocol 7A memo.
- Add audio tone clue.
- Add university abstract page.
- Introduce first community milestone response.

### Week 4

- Add county records trail.
- Release first appointment confirmation batch.
- Add Dorsal Health Holdings reference.
- End the month with a page that implies the visitor cohort has begun.

## First 90 Days Plan

### Month 1: Discovery

Players learn Somnatek is not just abandoned.

### Month 2: Classification

Players receive IDs, statuses, and appointment language.

### Month 3: Expansion

Players discover Somnatek is one node in a larger system.

By the end of 90 days, the ARG should support ongoing operations:

- Multiple sites.
- Regular drops.
- Opt-in player IDs.
- Email transmissions.
- Community milestones.
- Paid optional artifacts.
- A backlog of future branches.

## The Best Long-Term Trick

Let old content change meaning.

A never-ending ARG does not need infinite new material if old material keeps becoming newly relevant.

Ways to do that:

- Add a new document that explains an old typo.
- Reveal that an old staff name was an alias.
- Change a table heading after players solve a puzzle.
- Add a correction notice to an old PDF.
- Make a harmless phrase become a protocol term later.
- Introduce another clinic that used the same room numbers.
- Reveal that a player-discovered clue was planted by a character.

The archive should feel alive because the past refuses to stay fixed.

## Final Direction

The infinite version of the ARG should feel like this:

- The clinic is closed, but its systems still run.
- The study ended, but follow-up continues.
- The records are public, but not passive.
- The players are solving the mystery, but the mystery is also sorting them.
- Every answer creates a new document.
- Every document creates a new room.
- Every room implies another appointment.

The project should never fully say, "You are part of the experiment."

It should calmly behave as if that has already been documented.
