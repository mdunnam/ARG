# Sleep Clinic ARG Monetization Plan

## Core Monetization Principle

The core mystery should remain free.

Monetization should support the project through optional artifacts, expanded participation, behind-the-scenes access, and season archives. Players should never feel that they need to pay to solve the main ARG.

The guiding rule:

**Monetize the experience, artifacts, and aftercare. Do not monetize the answers.**

## Why This Matters

ARG communities are sensitive to trust. If the audience feels the mystery is primarily a sales funnel, the illusion breaks and the community can turn against the project.

A strong monetization model should:

- Preserve immersion.
- Keep the main puzzle path fair.
- Reward supporters without disadvantaging free players.
- Make paid items feel like collectibles, not toll gates.
- Avoid obvious advertising inside in-world sites.

## Revenue Streams

## 1. Patreon / Ko-fi Support

This is the cleanest early monetization path.

Position it as out-of-world project support rather than part of the fictional clinic.

### Possible Tiers

### $3-$5/month: Observer Tier

- Early access to public chapter drops.
- Monthly production updates.
- Post-solve notes after the community completes a puzzle.
- Access to supporter-only Discord channels if a community server exists.

### $8-$12/month: Records Tier

- Everything in Observer.
- Bonus non-essential lore documents.
- Digital artifact drops.
- Behind-the-scenes puzzle design notes after puzzle completion.
- Polls for future cosmetic details, such as document types or artifact themes.

### $20-$30/month: Archive Tier

- Everything in Records.
- Name, initials, or alias placed in non-critical background material.
- Early access to season archive drafts.
- Occasional printable evidence files.

### Important Limits

Supporter content should not contain required answers for the main ARG.

Supporter-only lore can expand the world, but the public community should still be able to solve the main story without it.

## 2. Physical Evidence Kits

Physical evidence kits are a strong fit for the Somnatek sleep clinic concept because the story is document-driven.

### Product Ideas

Basic case file:

- Patient intake form.
- Redacted clinic memo.
- Appointment card.
- Printed dream recall sheet.
- Sleep study chart.
- Records transfer notice.
- Clinic envelope.

Deluxe case file:

- Everything in the basic kit.
- Staff badge replica.
- Room 413 key tag.
- Low-quality clinic photo print.
- Handwritten technician note.
- University abstract printout.
- Numbered certificate or archive label.

### Price Ranges

- Basic physical file: $15-$25.
- Standard physical file: $35-$50.
- Deluxe limited drop: $60-$90+.

### Design Rules

- Paid physical kits may include extra lore.
- Paid physical kits should not include exclusive required clues.
- If a clue appears in a kit, provide a free digital equivalent somewhere in the main ARG.
- Make the kit feel like an in-world artifact, not branded fan merchandise.

## 3. Digital Case Files

Digital case files are low-cost and easy to fulfill.

### Product Ideas

- Recovered archive bundle.
- Printable Somnatek case file.
- Staff memo packet.
- Patient recall summaries.
- Dream environment map fragments.
- Audio file bundle.
- Desktop wallpapers based on in-world documents.
- Season 1 dossier after completion.

### Price Ranges

- Small digital pack: $5-$8.
- Larger evidence bundle: $10-$15.
- Full season archive: $20-$30.

### Best Timing

Digital packs should launch after players are already invested. They work best once the audience understands the value of the documents and wants to collect or study them.

## 4. In-Universe Merchandise

Merch should look like objects from the world, not generic ARG branding.

### Product Ideas

- Somnatek Sleep Health Center mug.
- Room 413 key tag.
- "Please wait to be recalled" shirt.
- Clinic logo tote bag.
- Patient file folder.
- RestWell forum sticker pack.
- Appointment card notebook.
- Staff lanyard.
- Dorsal Health Holdings pen.

### Design Rules

- Keep designs subtle.
- Avoid overt horror imagery.
- Make items wearable or usable even without explaining the ARG.
- Use in-world logos, phrases, IDs, and institutional design.

## 5. Paid Live Events

Paid live events can work after the project has an audience.

### Event Ideas

- 90-minute live puzzle night.
- Timed records office opening.
- Staff portal maintenance window.
- Live email / audio drop event.
- Character-led Discord event.
- Limited-time appointment confirmation event.

### Price Range

- $5-$20 per ticket.

### Fairness Rule

Paid live events should be special experiences, not required story access. If a live event reveals important story information, publish an in-world public artifact afterward so the main audience is not locked out.

## 6. Sponsorships

Sponsorships should be handled carefully because they can damage immersion.

### Good Sponsor Fits

- Horror podcasts.
- Indie horror games.
- Escape rooms.
- Mystery subscription boxes.
- TTRPG publishers.
- Horror conventions.
- Analog horror or found-footage creators.

### Bad Sponsor Fits

- Random display ads.
- Pop-up ads.
- Generic affiliate links.
- Sponsored content inside the fake clinic site.
- Anything that makes the in-world websites feel like normal monetized blogs.

### Best Placement

Put sponsorships on out-of-world surfaces:

- Creator site.
- Newsletter footer.
- Season archive page.
- Discord announcement.
- Post-solve recap.

Avoid putting sponsorships inside the Somnatek, RestWell, university archive, or county records sites.

## 7. Season Archive / Book / Zine

After Season 1 ends, package the completed experience.

### Product Ideas

- The Somnatek Case File.
- Printed zine.
- Art book.
- Annotated puzzle solution guide.
- Full timeline.
- Character dossier.
- Room 413 map.
- Behind-the-scenes design notes.
- Unused documents and cut content.

### Why This Works

A season archive does not interfere with the live ARG. It gives fans a way to revisit the story and gives new players a collected entry point after the live event has passed.

## 8. Email List

Build the audience before pushing monetization hard.

### In-World Signup Ideas

- Records transfer notification.
- Patient archive update request.
- RestWell forum registration.
- Research study follow-up notice.
- Appointment reminder subscription.

### Out-of-World Signup Ideas

- Creator newsletter.
- Production updates.
- New chapter announcements.
- Merch and evidence drop notifications.

### Important Note

If collecting emails in-world, include appropriate real-world privacy and consent language somewhere accessible. Do not create legal or trust issues for the sake of immersion.

## Recommended Monetization Timeline

## Phase 1: Free Launch

Goal: Build trust and audience.

Release:

- Somnatek public site.
- First hidden puzzle layer.
- Email signup.
- Optional Ko-fi / Patreon linked from an out-of-world creator page.

Do not push sales aggressively during the initial launch.

**Cost note:** The email responder Lambda (`lambda/email-responder`) calls Amazon Bedrock (Claude 3 Haiku) to generate in-world responses. Bedrock inference is not covered by AWS free tier. At typical ARG email volumes (tens to low hundreds of emails/month), expect ~$0.25–1.00/month in Bedrock charges. At higher volumes, model the cost before launching large promotion pushes.

## Phase 2: First Supporters

Goal: Let invested players support production.

Release:

- Patreon / Ko-fi tiers.
- Monthly updates.
- Early access to chapter drops.
- Post-solve notes.
- Optional Discord supporter area.

Keep required puzzles public.

## Phase 3: Digital Evidence Drop

Goal: Offer low-cost collectibles.

Release:

- Digital case file.
- Printable documents.
- Bonus non-essential lore.
- Audio bundle.

Suggested price: $7-$12.

## Phase 4: Physical Evidence Drop

Goal: Create a premium collectible.

Release:

- Limited physical case file.
- Numbered evidence packets.
- Room 413 key tags.
- Appointment cards.

Suggested price: $35-$50 for standard kits, higher for deluxe limited editions.

## Phase 5: Live Event

Goal: Create a memorable community moment.

Release:

- Ticketed puzzle night or timed records access.
- Public recap afterward.
- Optional event-exclusive physical or digital artifact.

Suggested price: $5-$20.

## Phase 6: Season 1 Archive

Goal: Monetize the completed season without harming the live solve.

Release:

- Full dossier.
- Annotated solution guide.
- Timeline.
- Behind-the-scenes notes.
- Printed zine or book.

Suggested price: $20-$30 digital, higher for print.

## Monetization Do / Don't

### Do

- Keep the main ARG solvable for free.
- Use paid content to expand, not gate.
- Make merch and kits feel like in-world artifacts.
- Build an email list early.
- Reward supporters after puzzles are solved.
- Be transparent out-of-world when money is involved.
- Preserve player trust.

### Don't

- Sell required answers.
- Put core clues only in paid products.
- Add obvious ads to in-world sites.
- Break immersion with aggressive popups.
- Make the fake clinic site feel like a storefront.
- Use real medical claims or imply real clinical services.
- Collect sensitive personal data from players.

## Legal / Trust Notes

Because the ARG uses a fake medical organization, avoid anything that could be mistaken for real medical advice or real healthcare services.

Recommended safeguards:

- Use fictional clinic names, fictional counties, and fictional institutions.
- Do not impersonate real universities, hospitals, counties, or businesses.
- Include an out-of-world creator page or footer somewhere discoverable.
- Include privacy language for email collection.
- Do not ask players for medical history, sleep data, diagnoses, or sensitive personal information.
- If using forms, collect only minimal non-sensitive data.

## Best First Monetization Move

Start with an email list and optional support link.

The first paid product should probably be a **digital Somnatek case file** after the opening puzzle has gained traction. It is low risk, low cost, and perfectly aligned with the document-horror style.

The strongest later product is a **physical evidence kit** with appointment cards, redacted memos, and patient file materials.
