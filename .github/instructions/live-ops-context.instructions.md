---
applyTo: "docs/**,docs/roadmap.md,scripts/**"
---

# Live Ops Puppetmaster Context — Auto-loaded

When editing planning documents or release scripts you are working on the operational machinery of a living ARG. Every design decision — content drop timing, trigger conditions, NPC moves, cadence — determines whether players feel the world is alive or static. Apply live ops discipline.

## Live Infrastructure Reference

| System | How to use it |
|---|---|
| DynamoDB content ledger | States: `drafted` → `scheduled` → `released` → `discovered` → `superseded` → `removed` |
| S3 staging (`staged/`) | Unreleased artifacts — never commit to public repo branch |
| Release scripts (`scripts/`) | Copy staged artifact to public S3 path + update ledger state |
| Page beacon system | Tracks visits, milestone hits, VIS IDs, referrers in real time |
| Admin Lambda | Query beacon data to see solve depth across the community |
| Amazon Connect | Live phone / voicemail — can be updated without redeployment |
| AWS SES (`records@somnatek.org`) | In-world email — Ortiz or Ellison can send directly to players |

## Current Milestone Solve Depth (watch these)

`portal_solved` (20pts) · `recall_accessed` (25pts) · `protocol_7a` (30pts) · `correspondence_found` (25pts) · `doc_7a_found` (15pts) · `supp_index_found` (20pts) · `supp_010_found` (35pts) · `supp_005_found` (40pts) · `admin_t1` (10pts) · `admin_t2` (20pts) · `admin_t3` (35pts)

**Released: 285 pts / 355 pts all-time.**

## Trigger Conditions to Wire Into Roadmap

| Trigger | Condition | Recommended response |
|---|---|---|
| Portal stall | < 5 players hit `portal_solved` after 2 weeks | Subtle HTML comment hint added to patient-resources |
| SUPP-INDEX barrier | Community found portal but not archive | Phone line message updated with audio breadcrumb |
| Archive reached | `supp_005_found` hits threshold | Phase 2 RestWell announcement seeded |
| Admin T3 reached | First player hits `admin_t3` | Discord launch + Ortiz email to that VIS ID |
| Community fragments | Multiple contradictory theories, no convergence | New document fragment rules out wrong paths |
| Solve velocity too high | All milestones hit in < 3 days | Second layer activates (Protocol 7A Section 9) |

## NPC Live Activation Options

| Character | Vector | Status |
|---|---|---|
| Lena Ortiz | `records@somnatek.org` SES email, RestWell forum posts | Badge active, available for contact |
| Dr. Ellison | Archived correspondence only (no active channel) | Disappeared — new comms = major event |
| PTX-031 | In-world forum, admin system | Active status — can surface with prior knowledge |

## Content Drop Rules (from copilot-instructions.md)

- Unreleased content stays in `staged/` or private S3 prefix — never in a public repo branch
- Release scripts copy to public S3 path and update ledger
- Content ledger state must be updated atomically with the file release

## Cadence Anchors

- **Pre-Phase 2 (now):** 1–2 updates/week max. Slow burn. Subtle.
- **Phase 2 launch:** Event storm cadence. Daily drops for 2 weeks.
- **Between phases:** Pulse mode. Quiet + spikes.
- **Finale:** Event storm. Coordinated. Climactic.

## Example Prompts

- "The beacon shows players are stalling at the portal — design a subtle live update that nudges the PDF cipher connection without giving it away"
- "First player just hit Admin Tier 3 — design the response: what does Ortiz send, what unlocks, and how does it seed Phase 2"
- "Design the Phase 2 RestWell launch ops plan — what drops when, what triggers what, and what is the 2-week content cadence"
- "Design a 30-day live ops roadmap from now through Phase 2 launch — triggers, NPC moves, cadence, and stall recovery built in"
- "Community has fragmented into two incompatible theories about EMP-247 — design a live ops move that steers convergence without revealing the answer"
