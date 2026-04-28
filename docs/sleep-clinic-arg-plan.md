# Sleep Clinic ARG Plan

## Build Status

**Active development started: April 28, 2026**

Current milestone: First Build — Somnatek public site + patient portal puzzle.

Stack:
- Static HTML/CSS/JS for all in-world sites.
- Node.js AWS Lambda for puzzle validation and portal state.
- AWS S3 + CloudFront for hosting.
- AWS API Gateway for puzzle endpoints.
- AWS DynamoDB for visitor IDs and solve state.
- AWS SES for opt-in email transmissions.
- AWS CDK for infrastructure as code.
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

- Archived study index
- Redacted intake forms
- Participant dream recall summaries
- Staff-only protocol updates
- Session room assignment table
- Termination memo

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
